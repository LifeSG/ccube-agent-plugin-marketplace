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
}

function answerGit(repo: Repo, argv: readonly string[]) {
  const args = argv.slice(1).join(' ')
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

  if (args === 'rev-parse --show-toplevel') return ok('/repo\n')
  if (args === 'branch --show-current') return ok('feat/x\n')
  if (args.startsWith('symbolic-ref')) return ok('origin/main\n')
  if (args === 'status --porcelain') return ok(repo.dirty)
  if (args === 'rev-list --count origin/main..HEAD') return ok(repo.branchCommits)
  if (args === 'rev-parse --abbrev-ref @{u}') {
    return repo.ahead === null ? fail : ok('origin/feat/x\n')
  }
  if (args === 'rev-list --count @{u}..HEAD') return ok(repo.ahead ?? '0')
  if (args === 'rev-parse @{u}') {
    return repo.ahead === null ? fail : ok(`${repo.pushed ?? 'p1'}\n`)
  }
  if (args.startsWith('ls-remote origin')) return ok(repo.remoteRefs ?? '')
  if (args === 'remote get-url origin') return ok('git@github.com:acme/app.git\n')

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
    const isBranch = e.argv.slice(1).join(' ') === 'branch --show-current'

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
