import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'wai',
  component: 'Pane',
  requestId: 'swe-guide',
  props: {
    title: 'SWE Guide · Feature change',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

type Repo = {
  dirty: string
  branchCommits: string
  ahead: string | null
  remoteRefs?: string
  pushed?: string
  // Overrides for the checks below; null makes that git call fail.
  branch?: string
  remoteUrl?: string
  isRepo?: boolean
  isRemoteDown?: boolean
}

// The git arguments after the -c settings the module always passes.
function gitArgs(argv: readonly string[]) {
  const args = argv.slice(1)
  let i = 0
  while (args[i] === '-c') i += 2

  return args.slice(i).join(' ')
}

function answerGit(repo: Repo, argv: readonly string[]) {
  const args = gitArgs(argv)
  const ok = (stdout: string) => ({
    value: {
      exitCode: 0,
      stdout,
      stderr: '',
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  })
  const fail = { value: { ...ok('').value, exitCode: 128 } }

  if (args === 'rev-parse --show-toplevel') return repo.isRepo === false ? fail : ok('/repo\n')
  if (args === 'branch --show-current') return ok(`${repo.branch ?? 'feat/x'}\n`)
  if (args.startsWith('symbolic-ref')) return ok('origin/main\n')
  if (args === '--no-optional-locks status --porcelain') return ok(repo.dirty)
  if (args === 'rev-list --count origin/main..HEAD') return ok(repo.branchCommits)
  if (args === 'rev-parse --abbrev-ref @{u}') {
    return repo.ahead === null ? fail : ok('origin/feat/x\n')
  }
  if (args === 'rev-list --count @{u}..HEAD') return ok(repo.ahead ?? '0')
  if (args === 'rev-parse @{u}') {
    return repo.ahead === null ? fail : ok(`${repo.pushed ?? 'p1'}\n`)
  }
  if (args.startsWith('ls-remote origin')) {
    return repo.isRemoteDown === true ? fail : ok(repo.remoteRefs ?? '')
  }
  if (args === 'remote get-url origin') {
    return ok(`${repo.remoteUrl ?? 'git@github.com:acme/app.git'}\n`)
  }

  return fail
}

test('commit and push tick from git and untick on new changes', async ($, on) => {
  const repo: Repo = { dirty: ' M a.ts\n M b.ts\n', branchCommits: '0', ahead: null }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ key: 'commit' }))?.text).toBe(
      'Commit 2 changed files',
    )
    expect((await ui.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
      'Next: commit your changes',
    )
    const badge = await ui.find({ type: 'Text', text: 'YOU ARE HERE' })
    expect(badge?.props.backgroundColor).toBe('claude')
    expect(badge?.props.color).toBe('inverseText')
    // Code review is offered and lit before anything is committed.
    expect((await ui.find({ key: 'code-review' }))?.text).toBe('Run code review')
    const review = await ui.find({ type: 'Text', text: /Code review/ })
    expect(review?.props.dimColor).toBe(false)
    const merge = await ui.find({ type: 'Text', text: /Review & merge/ })
    expect(merge?.props.dimColor).toBe(true)
    await ui.unmount()
  }

  repo.dirty = ''
  repo.branchCommits = '1'
  repo.ahead = '0'
  await $.tool.call({ tool: 'Bash', command: 'git push' })

  const pushed = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await pushed.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: review your code before opening an MR',
  )
  await pushed.press({ key: 'mark-done' })
  expect((await pushed.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: open a merge request',
  )
  await pushed.press({ key: 'mark-done' })
  expect((await pushed.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: get the MR approved and merged',
  )
  await pushed.unmount()

  repo.dirty = ' M c.ts\n'
  await $.tool.call({ tool: 'Edit', file_path: '/repo/c.ts', old_string: 'a', new_string: 'b' })

  const edited = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await edited.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: commit your changes',
  )
  expect((await edited.find({ key: 'commit' }))?.text).toBe('Commit 1 changed file')
  await edited.unmount()
})

test('Create branch on main asks Claude for the ticket first', async ($, on) => {
  const repo: Repo = { dirty: ' M a.ts\n', branchCommits: '0', ahead: null }
  const sent: string[] = []

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => {
    const ran = answerGit(repo, e.argv)
    const isBranch = gitArgs(e.argv) === 'branch --show-current'

    return isBranch ? { value: { ...ran.value, exitCode: 0, stdout: 'main\n' } } : ran
  })
  on('prompt.submit', (_, e) => {
    sent.push(e.text)

    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'create-branch' })
  await ui.unmount()

  expect(sent.length).toBe(1)
  expect(sent[0]).toContain('ticket number')
  expect(sent[0]).toContain('feat/<short-desc>')
  expect(sent[0]).toContain('1 uncommitted file')
  expect(sent[0]).toContain('git pull --ff-only')
})

test('Commit and Push buttons ask Claude to do the work', async ($, on) => {
  const repo: Repo = { dirty: ' M a.ts\n', branchCommits: '0', ahead: null }
  const sent: string[] = []

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('prompt.submit', (_, e) => {
    sent.push(e.text)

    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const dirty = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await dirty.press({ key: 'commit' })
  await dirty.unmount()
  expect(sent[0]).toContain('cc-git-commit')
  expect(sent[0]).toContain('approve your recommended grouping in advance')
  expect(sent[0]).toContain('1 uncommitted file')

  repo.dirty = ''
  repo.branchCommits = '1'
  await $.tool.call({ tool: 'Bash', command: 'git commit -m x' })

  const committed = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await committed.press({ key: 'push' })
  await committed.unmount()
  expect(sent[1]).toContain('git push -u origin feat/x')
  expect(sent[1]).toContain('the next step is a code review')

  repo.ahead = '0'
  await $.tool.call({ tool: 'Bash', command: 'git push -u origin feat/x' })

  const pushed = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await pushed.press({ key: 'code-review' })
  await pushed.unmount()
  expect(sent[2]).toContain('cc-code-review')
  expect(sent[2]).toContain('model: "sonnet"')
  expect(sent[2]).toContain('main..HEAD')
  expect(sent[2]).toContain('step "review"')
})

test('an open PR at the pushed commit ticks Open MR and links to it', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '2',
    ahead: '0',
    remoteRefs:
      'abc\trefs/heads/feat/x\n' +
      'old\trefs/pull/7/head\n' +
      'abc\trefs/pull/54/head\n',
  }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: review your code before opening an MR',
  )
  const link = await ui.find({ type: 'Link' })
  expect(link?.props.href).toBe('https://github.com/acme/app/pull/54')
  expect(link?.props.label).toBe('View PR #54')
  expect(await ui.find({ key: 'open-mr' })).toBeUndefined()
  const merge = await ui.find({ type: 'Text', text: /Review & merge/ })
  expect(merge?.props.dimColor).toBe(false)
  await ui.unmount()
})

test('a new push unticks Code review and Review & merge', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '1',
    ahead: '0',
    pushed: 'p1',
    remoteRefs: 'p1\trefs/heads/feat/x\np1\trefs/pull/54/head\n',
  }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  const clock = mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const first = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await first.press({ key: 'mark-done' })
  expect((await first.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: get the MR approved and merged',
  )
  await first.press({ key: 'mark-done' })
  expect((await first.find({ type: 'Text', text: /All done/ }))?.text).toBe(
    '🎉 All done. Nice work!',
  )
  await first.unmount()

  repo.branchCommits = '2'
  repo.pushed = 'p2'
  repo.remoteRefs = 'p2\trefs/heads/feat/x\np2\trefs/pull/54/head\n'
  await clock.advance(61_000)
  await $.tool.call({ tool: 'Bash', command: 'git push' })

  const again = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await again.find({ type: 'Text', text: /^Next/ }))?.text).toBe(
    'Next: review your code before opening an MR',
  )
  expect((await again.find({ type: 'Link' }))?.props.label).toBe('View PR #54')
  await again.unmount()
})

test('review findings offer a Fix per level and Fix all except low', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  const sent: string[] = []

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('prompt.submit', (_, e) => {
    sent.push(e.text)

    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const before = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await before.find({ key: 'fix-all' })).toBeUndefined()
  await before.unmount()

  await $.tool.call({
    tool: 'mcp__wai__swe_guide',
    action: 'findings',
    report: 'reviews/r/CODE-REVIEW.md',
    counts: { critical: 0, high: 9, medium: 13, low: 13 },
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ key: 'fix-critical' })).toBeUndefined()
  expect((await ui.find({ key: 'fix-high' }))?.text).toBe('Fix 9 high')
  expect((await ui.find({ key: 'fix-low' }))?.text).toBe('Fix 13 low')
  expect((await ui.find({ key: 'fix-all' }))?.text).toBe('Fix all except low')

  await ui.press({ key: 'fix-high' })
  expect(sent[0]).toContain('Fix only the HIGH findings')
  expect(sent[0]).toContain('reviews/r/CODE-REVIEW.md')
  expect(sent[0]).toContain('level "high"')

  await ui.press({ key: 'fix-all' })
  expect(sent[1]).toContain('Fix only the HIGH, MEDIUM findings')
  expect(sent[1]).not.toContain('LOW')
  await ui.unmount()

  await $.tool.call({ tool: 'mcp__wai__swe_guide', action: 'fixed', level: 'high' })

  const fixed = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await fixed.find({ key: 'fix-high' })).toBeUndefined()
  expect((await fixed.find({ type: 'Text', text: 'fixed' }))?.props.color).toBe('success')
  expect((await fixed.find({ key: 'fix-medium' }))?.text).toBe('Fix 13 medium')
  await fixed.press({ key: 'fix-all' })
  expect(sent[2]).toContain('Fix only the MEDIUM findings')
  await fixed.unmount()
})

test('a review report for the branch fills the findings card', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  const report =
    '# Code Review\n' +
    '### CRITICAL Issues (BLOCKS APPROVAL) - 1 issue\n' +
    '### HIGH Priority (SHOULD FIX) - 9 issues\n' +
    '### LOW Priority (OPTIONAL) - 13 suggestions\n'
  const dir = (name: string) => ({ name, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('fs.list', () => ({
    value: [
      dir('20261020-0900-DIFF-feat-x'),
      dir('20261023-0549-DIFF-feat-x'),
      dir('20261024-0100-DIFF-feat-xy'),
      dir('20261024-0100-TOPIC-feat-x'),
    ],
  }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', (_, e) => {
    expect(e.path).toBe('/repo/reviews/20261023-0549-DIFF-feat-x/CODE-REVIEW-feat-x.md')

    return { value: report }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ key: 'fix-critical' }))?.text).toBe('Fix 1 critical')
  expect((await ui.find({ key: 'fix-high' }))?.text).toBe('Fix 9 high')
  expect(await ui.find({ key: 'fix-medium' })).toBeUndefined()
  expect((await ui.find({ key: 'fix-low' }))?.text).toBe('Fix 13 low')
  expect((await ui.find({ type: 'Text', text: /CODE-REVIEW-feat-x/ }))?.text).toBe(
    'reviews/20261023-0549-DIFF-feat-x/CODE-REVIEW-feat-x.md',
  )
  await ui.unmount()

  // Marking a level fixed survives the next scan of the same report.
  await $.tool.call({ tool: 'mcp__wai__swe_guide', action: 'fixed', level: 'high' })
  const fixed = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await fixed.find({ key: 'fix-high' })).toBeUndefined()
  expect((await fixed.find({ key: 'fix-all' }))?.text).toBe('Fix all except low')
  await fixed.unmount()
})

// The swe_guide tool answers on the result; a plugin tool's answer is a string.
async function callGuide($: Parameters<Parameters<typeof test>[1]>[0], input: object) {
  const ran = await $.tool.call({ tool: 'mcp__wai__swe_guide', ...input })

  return 'result' in ran ? String(ran.result) : `deny: ${ran.deny}`
}

test('the swe_guide tool answers each action and refuses bad input', async ($, on) => {
  const repo: Repo = { dirty: ' M a.ts\n', branchCommits: '0', ahead: null }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })

  expect(await callGuide($, { action: 'status' })).toBe('SWE Guide is not started.')
  expect(await callGuide($, { action: 'start' })).toContain('Current step: Commit')
  expect(await callGuide($, { action: 'status' })).toContain('Uncommitted files: 1')
  expect(await callGuide($, { action: 'branch' })).toContain('ticket number')

  expect(await callGuide($, { action: 'mark' })).toContain('step must be one of')
  expect(await callGuide($, { action: 'mark', step: 'commit' })).toContain(
    'step must be one of',
  )
  expect(await callGuide($, { action: 'mark', step: 'review' })).toContain('[x] 5 Code review')
  expect(await callGuide($, { action: 'unmark', step: 'review' })).toContain(
    '[ ] 5 Code review',
  )

  expect(await callGuide($, { action: 'fixed', level: 'high' })).toBe(
    'No code review findings are recorded.',
  )
  expect(await callGuide($, { action: 'findings', report: 'r.md' })).toContain(
    'findings needs',
  )
  expect(
    await callGuide($, {
      action: 'findings',
      report: 'r.md',
      counts: { critical: 0, high: 1, medium: 0, low: 0 },
    }),
  ).toContain('Current step')
  expect(await callGuide($, { action: 'fixed', level: 'urgent' })).toContain(
    'level must be one of',
  )
  expect(await callGuide($, { action: 'fixed', level: 'high' })).toContain('Current step')

  expect(await callGuide($, { action: 'reset' })).toContain('action must be one of')
})

test('hiding the pane stops the poll until it is opened again', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  let gitCalls = 0
  let panes: { id: string }[] = []

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => {
    panes = [{ id: 'swe-guide' }]

    return { value: { isPlaced: true } }
  })
  on('ui.close', () => {
    panes = []

    return { value: undefined }
  })
  on('ui.panes', () => ({
    value: panes.map(p => ({ ...p, title: 'SWE Guide', isShown: true, isFocused: false, isPlaced: true })),
  }))
  on('process.run', (_, e) => {
    gitCalls += 1

    return answerGit(repo, e.argv)
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  const clock = mock.clock(on)
  const run = () =>
    $.command.run({
      command: 'cc-swe-coach-ui',
      args: '',
      origin: { kind: 'composer' },
      presentation: { isFullscreen: true, columns: 160 },
    })

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await run()
  gitCalls = 0
  await clock.advance(10_000)
  expect(gitCalls).toBeGreaterThan(0)

  await run()
  gitCalls = 0
  await clock.advance(30_000)
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(gitCalls).toBe(0)

  await run()
  gitCalls = 0
  await clock.advance(10_000)
  expect(gitCalls).toBeGreaterThan(0)
})

test('a branch name with shell or prompt characters gets no prompt buttons', async ($, on) => {
  const repo: Repo = { dirty: ' M a.ts\n', branchCommits: '1', ahead: null }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => {
    const ran = answerGit(repo, e.argv)
    const isBranch = gitArgs(e.argv) === 'branch --show-current'

    return isBranch
      ? { value: { ...ran.value, exitCode: 0, stdout: 'feat/x";$(id)`\n' } }
      : ran
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ key: 'commit' })).toBeUndefined()
  expect(await ui.find({ key: 'push' })).toBeUndefined()
  expect(await ui.find({ key: 'code-review' })).toBeUndefined()
  await ui.unmount()
})

test('a Code review marked before the first push stays ticked after it', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: null }

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })
  expect(await callGuide($, { action: 'mark', step: 'review' })).toContain('[x] 5 Code review')

  repo.ahead = '0'
  repo.pushed = 'p1'
  expect(await callGuide($, { action: 'status' })).toContain('[x] 5 Code review')
})

test('View lists the findings at that level and Hide removes it', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  const report = [
    '# Code Review',
    '### CRITICAL Issues (BLOCKS APPROVAL) - 1 issue',
    '',
    '- **STD-CRIT-01**: Manual, partial version bump —',
    '  `plugins/wai/.claude-plugin/plugin.json:4`, and more.',
    '',
    '### HIGH Priority (SHOULD FIX) - 2 issues',
    '',
    '#### Security',
    '',
    '- **SEC-HIGH-01**: Repo-controlled names in prompts —',
    '  `plugins/wai/hooks/register.tsx:389` (`commitPlaybook`).',
    '- **PROD-HIGH-02**: Background `git status` takes the index lock —',
    '  `register.tsx:139`. Runs every 10 s.',
    '',
    '### MEDIUM Priority (RECOMMENDED) - 1 improvement',
    '',
    '- SEC-MED-04: git runs in an untrusted repo',
    '  (`core.fsmonitor`) — `register.tsx:114`.',
    '',
    '## Detailed Analysis',
    '- not a finding',
  ].join('\n')
  const dir = (name: string) => ({ name, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => answerGit(repo, e.argv))
  on('fs.list', () => ({ value: [dir('20261023-0549-DIFF-feat-x')] }))
  on('fs.exists', () => ({ value: true }))
  on('fs.read', () => ({ value: report }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.run', () => ({ text: '' }))
  mock.store(on)
  mock.clock(on)

  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ key: 'view-low' })).toBeUndefined()
    expect(await ui.find({ key: 'findings-list' })).toBeUndefined()

    await ui.press({ key: 'view-high' })
    expect((await ui.find({ type: 'Text', text: 'SEC-HIGH-01' }))?.props.bold).toBe(true)
    expect(await ui.find({ type: 'Text', text: 'register.tsx:389' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Repo-controlled names in prompts' })).toBeDefined()
    expect(
      await ui.find({ type: 'Text', text: 'Background `git status` takes the index lock' }),
    ).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'STD-CRIT-01' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: 'SEC-MED-04' })).toBeUndefined()
    expect((await ui.find({ key: 'view-high' }))?.text).toBe('Hide')

    await ui.press({ key: 'view-medium' })
    expect(await ui.find({ type: 'Text', text: 'SEC-HIGH-01' })).toBeUndefined()
    expect(
      await ui.find({ type: 'Text', text: 'git runs in an untrusted repo (`core.fsmonitor`)' }),
    ).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'not a finding' })).toBeUndefined()

    await ui.press({ key: 'view-medium' })
    expect(await ui.find({ key: 'findings-list' })).toBeUndefined()
    await ui.unmount()
  }
})

// The hooks every guide test needs; returns what the module sent and ran.
function guideTest(on: Parameters<Parameters<typeof test>[1]>[1], repo: Repo) {
  const sent: string[] = []
  const ran: string[][] = []

  on('command.register', () => ({ value: { command: 'cc-swe-coach-ui' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__wai__swe_guide' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  on('process.run', (_, e) => {
    ran.push([...e.argv])

    return answerGit(repo, e.argv)
  })
  on('prompt.submit', (_, e) => {
    sent.push(e.text)

    return { text: e.text }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))

  return { sent, ran }
}

async function openGuide($: Parameters<Parameters<typeof test>[1]>[0]) {
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.command.run({
    command: 'cc-swe-coach-ui',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })
}

test('an open GitLab MR ticks Open MR and links to it', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '1',
    ahead: '0',
    remoteUrl: 'ssh://git@gitlab.example.gov.sg:2222/team/sub/app.git',
    remoteRefs: 'p1\trefs/heads/feat/x\np1\trefs/merge-requests/12/head\n',
  }
  guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const link = await ui.find({ type: 'Link' })
  expect(link?.props.href).toBe('https://gitlab.example.gov.sg/team/sub/app/-/merge_requests/12')
  expect(link?.props.label).toBe('View MR #12')
  expect(await ui.find({ type: 'Text', text: 'REMOTE · GITLAB / GITHUB' })).toBeDefined()
  await ui.unmount()
})

test('an HTTPS remote with a user and no .git suffix still links', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '1',
    ahead: '0',
    remoteUrl: 'https://oauth2:token@gitlab.com/team/app/',
    remoteRefs: 'p1\trefs/heads/feat/x\np1\trefs/merge-requests/3/head\n',
  }
  guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Link' }))?.props.href).toBe(
    'https://gitlab.com/team/app/-/merge_requests/3',
  )
  await ui.unmount()
})

test('a failed ls-remote is asked again rather than cached as no request', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '1',
    ahead: '0',
    isRemoteDown: true,
    remoteRefs: 'p1\trefs/heads/feat/x\np1\trefs/pull/9/head\n',
  }
  guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  expect(await callGuide($, { action: 'status' })).toContain('Open merge request: none found')
  repo.isRemoteDown = false
  expect(await callGuide($, { action: 'status' })).toContain('Open merge request: PR #9')
})

test('a new pushed commit asks the remote again at once', async ($, on) => {
  const repo: Repo = {
    dirty: '',
    branchCommits: '1',
    ahead: '0',
    pushed: 'p1',
    remoteRefs: 'p1\trefs/heads/feat/x\n',
  }
  guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  expect(await callGuide($, { action: 'status' })).toContain('Open merge request: none found')
  // An amend and force-push: same commit count, new pushed commit.
  repo.pushed = 'p2'
  repo.remoteRefs = 'p2\trefs/heads/feat/x\np2\trefs/pull/5/head\n'
  expect(await callGuide($, { action: 'status' })).toContain('Open merge request: PR #5')
})

test('git runs with fsmonitor and remote helpers switched off', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  const { ran } = guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  expect(ran.length).toBeGreaterThan(0)
  for (const argv of ran) expect(argv.slice(1, 3)).toEqual(['-c', 'core.fsmonitor=false'])
  const lsRemote = ran.find(argv => argv.includes('ls-remote'))
  expect(lsRemote).toContain('protocol.ext.allow=never')
  expect(lsRemote).toContain('remote.origin.uploadpack=git-upload-pack')
})

test('outside a repository the pane says so and the tool reports it', async ($, on) => {
  guideTest(on, { dirty: '', branchCommits: '0', ahead: null, isRepo: false })
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Open a git repository/ })).toBeDefined()
  await ui.unmount()
  expect(await callGuide($, { action: 'status' })).toBe('Not in a git repository.')
})

test('a detached HEAD offers no prompt buttons', async ($, on) => {
  guideTest(on, { dirty: ' M a.ts\n', branchCommits: '1', ahead: null, branch: '' })
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: '⎇ (detached)' })).toBeDefined()
  expect(await ui.find({ key: 'commit' })).toBeUndefined()
  expect(await ui.find({ key: 'code-review' })).toBeUndefined()
  await ui.unmount()
})

test('marks stored as a bare list by an earlier version are kept', async ($, on) => {
  guideTest(on, { dirty: '', branchCommits: '1', ahead: '0' })
  mock.store(on, { 'progress:/repo#feat/x': ['review', 'not-a-step'] })
  mock.clock(on)
  await openGuide($)

  const status = await callGuide($, { action: 'status' })
  expect(status).toContain('[x] 5 Code review')
  expect(status).toContain('Current step: Open MR')
})

test('Commit names the secret files to leave out and stages by name', async ($, on) => {
  const { sent } = guideTest(on, { dirty: ' M a.ts\n', branchCommits: '0', ahead: null })
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'commit' })
  await ui.unmount()
  expect(sent[0]).toContain('`.env` and `.env.*`')
  expect(sent[0]).toContain('not waived by step 2')
  expect(sent[0]).toContain('never `git add -A`')
  expect(sent[0]).toContain('git diff --cached --name-only')
})

test('Open MR gives URL-encoded branch names and leaves opening to the person', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0', branch: 'feat/a.b' }
  const { sent } = guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  await callGuide($, { action: 'mark', step: 'review' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'open-mr' })
  await ui.unmount()
  expect(sent[0]).toContain('compare/main...feat%2Fa.b?expand=1')
  expect(sent[0]).toContain('merge_request%5Bsource_branch%5D=feat%2Fa.b')
  expect(sent[0]).toContain('Do not open the merge request yourself')
})

test('a mark made while a refresh runs is not undone by it', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  guideTest(on, repo)
  mock.store(on)
  mock.clock(on)
  await openGuide($)

  await Promise.all([
    callGuide($, { action: 'status' }),
    callGuide($, { action: 'mark', step: 'review' }),
    callGuide($, { action: 'status' }),
  ])
  expect(await callGuide($, { action: 'status' })).toContain('[x] 5 Code review')
})

test('a second session start keeps one poll', async ($, on) => {
  const repo: Repo = { dirty: '', branchCommits: '1', ahead: '0' }
  const { ran } = guideTest(on, repo)
  mock.store(on)
  const clock = mock.clock(on)
  await openGuide($)
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })

  ran.length = 0
  await clock.advance(10_000)
  const statuses = ran.filter(argv => gitArgs(argv).endsWith('status --porcelain'))
  expect(statuses.length).toBe(1)
})
