import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { GitState, Guide, StepId } from '../types'

const PANE = 'swe-guide'
const TITLE = 'SWE Guide · Feature change'
const COMMAND = 'cc-swe-coach-ui'
const POLL_MS = 10_000

// Change the tag when Guide's fields change: it declines what an earlier
// version stored, which outlives a reload.
const guide = atom({ plugin: 'wai', key: 'guide' } as const, null, {
  shape: 'guide-1',
})

type Step = { id: StepId; label: string; next: string; isManual: boolean }

const STEPS: readonly Step[] = [
  {
    id: 'branch',
    label: 'Create branch',
    next: 'create a branch for your change',
    isManual: false,
  },
  {
    id: 'implement',
    label: 'Implement change',
    next: 'make your change on the branch',
    isManual: false,
  },
  {
    id: 'commit',
    label: 'Commit',
    next: 'commit your changes',
    isManual: false,
  },
  {
    id: 'push',
    label: 'Push',
    next: 'push your branch so the team can see it',
    isManual: false,
  },
  {
    id: 'mr',
    label: 'Open MR',
    next: 'open a merge request',
    isManual: true,
  },
  {
    id: 'review',
    label: 'Review',
    next: 'get the MR reviewed and approved',
    isManual: true,
  },
  {
    id: 'merge',
    label: 'Merge',
    next: 'merge the MR',
    isManual: true,
  },
]

const MANUAL = STEPS.filter(step => step.isManual).map(step => step.id)

// The ring drawn around the steps a person repeats for each change: down the
// right side past the buttons, back up the left to Implement.
const LOOP: Partial<Record<StepId, { left: string; right: string }>> = {
  implement: { left: '╭─ ', right: ' ─╮' },
  commit: { left: '▲  ', right: '  ▼' },
  push: { left: '╰─ ', right: ' ─╯' },
}
const GUTTER = '   '
// Every label padded to the longest, so the ring's right side lines up.
const LABEL_WIDTH = Math.max(...STEPS.map(step => step.label.length))

const NO_REPO: GitState = {
  isRepo: false,
  root: '',
  branch: '',
  base: 'main',
  dirty: 0,
  branchCommits: 0,
  hasUpstream: false,
  ahead: 0,
}

async function git($: EngineInterface, ...args: string[]) {
  try {
    const ran = await $.process.run(['git', ...args], { timeoutMs: 5_000 })

    return { isOk: ran.exitCode === 0, out: ran.stdout.trim() }
  } catch {
    return { isOk: false, out: '' }
  }
}

async function readGit($: EngineInterface): Promise<GitState> {
  const root = await git($, 'rev-parse', '--show-toplevel')
  if (!root.isOk) return NO_REPO

  const branch = (await git($, 'branch', '--show-current')).out
  const head = await git($, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD')
  const base = head.isOk
    ? head.out.replace(/^origin\//, '')
    : (await git($, 'rev-parse', '--verify', '-q', 'master')).isOk
      ? 'master'
      : 'main'
  const status = await git($, 'status', '--porcelain')
  const dirty = status.out === '' ? 0 : status.out.split('\n').length

  let branchCommits = 0
  for (const ref of [`origin/${base}`, base]) {
    const counted = await git($, 'rev-list', '--count', `${ref}..HEAD`)
    if (counted.isOk) {
      branchCommits = Number(counted.out) || 0
      break
    }
  }

  const upstream = await git($, 'rev-parse', '--abbrev-ref', '@{u}')
  const ahead = upstream.isOk
    ? Number((await git($, 'rev-list', '--count', '@{u}..HEAD')).out) || 0
    : 0

  return {
    isRepo: true,
    root: root.out,
    branch,
    base,
    dirty,
    branchCommits,
    hasUpstream: upstream.isOk,
    ahead,
  }
}

function progressKey(state: GitState) {
  return `progress:${state.root}#${state.branch}`
}

// Commit and Push follow the live repo, so new changes untick them; the
// steps that happen in GitLab stay ticked once marked.
function doneSteps(g: Guide): Set<StepId> {
  const done = new Set<StepId>()
  const { git: state } = g
  if (!state.isRepo) return done

  const isOnBranch = state.branch !== '' && state.branch !== state.base
  if (isOnBranch) done.add('branch')
  if (isOnBranch && (state.dirty > 0 || state.branchCommits > 0)) {
    done.add('implement')
  }
  if (done.has('implement') && state.dirty === 0 && state.branchCommits > 0) {
    done.add('commit')
  }
  if (done.has('commit') && state.hasUpstream && state.ahead === 0) {
    done.add('push')
  }
  for (const id of g.marked) done.add(id)

  return done
}

function currentStep(g: Guide): Step | undefined {
  const done = doneSteps(g)

  return STEPS.find(step => !done.has(step.id))
}

async function refresh($: EngineInterface) {
  const held = await read($, guide)
  if (held === null || !held.isActive) return

  const state = await readGit($)
  const stored = state.isRepo ? await $.store.get(progressKey(state)) : []
  const marked = Array.isArray(stored)
    ? stored.filter((id): id is StepId => MANUAL.includes(id))
    : []

  await update($, guide, g => (g === null ? g : { ...g, git: state, marked }))
}

async function setMarked($: EngineInterface, id: StepId, isMarked: boolean) {
  const g = await read($, guide)
  if (g === null || !g.git.isRepo) return

  const marked = isMarked
    ? [...new Set([...g.marked, id])]
    : g.marked.filter(one => one !== id)
  await $.store.set(progressKey(g.git), marked)
  await update($, guide, held => (held === null ? held : { ...held, marked }))
}

async function activate($: EngineInterface) {
  await update($, guide, g =>
    g === null ? { isActive: true, git: NO_REPO, marked: [] } : { ...g, isActive: true },
  )
  await refresh($)

  return $.ui.open({ id: PANE, title: TITLE })
}

function describe(g: Guide): string {
  if (!g.git.isRepo) return 'Not in a git repository.'

  const done = doneSteps(g)
  const lines = STEPS.map(
    (step, i) => `${done.has(step.id) ? '[x]' : '[ ]'} ${i + 1} ${step.label}`,
  )
  const now = currentStep(g)
  lines.push(`Branch: ${g.git.branch || '(detached)'} (base ${g.git.base})`)
  lines.push(`Uncommitted files: ${g.git.dirty}`)
  lines.push(`Commits not pushed: ${g.git.hasUpstream ? g.git.ahead : 'no upstream yet'}`)
  lines.push(now === undefined ? 'All steps done.' : `Current step: ${now.label}`)

  return lines.join('\n')
}

// The steps Claude follows to create the branch, shared by the pane's button
// and the tool so both paths ask the same questions in the same order.
function branchPlaybook(state: GitState): string {
  const dirty =
    state.dirty > 0
      ? `There are ${state.dirty} uncommitted file(s) on "${state.branch}". ` +
        'Before anything else, explain in plain words what uncommitted changes ' +
        'are and ask whether to carry them to the new branch or set them aside ' +
        '(git stash). Do what they choose.'
      : 'There are no uncommitted changes.'

  return [
    'Help me create a branch for my change. I am new to git, so keep each ' +
      'question short and explain any git words you use.',
    '',
    `1. ${dirty}`,
    '2. Ask me for the ticket number (for example MOL-123). Tell me I can ' +
      'say "no ticket".',
    '3. With a ticket: ask in one line what the ticket is about if you do ' +
      'not know, then propose `<TICKET>-<short-desc>`, the ticket in ' +
      'uppercase and short-desc 2 to 5 lowercase words joined by hyphens ' +
      '(for example MOL-123-add-login-page).',
    '   Without a ticket: ask what feature I am building, then propose ' +
      '`feat/<short-desc>` the same way (for example feat/add-login-page).',
    `4. Show me the proposed name and wait for my yes. Change it if I ask.`,
    `5. Update the base branch first: \`git checkout ${state.base}\` then ` +
      '`git pull --ff-only`. If the pull fails, explain why and stop.',
    '6. Create the branch with `git checkout -b <name>` and tell me in one ' +
      'line what just happened and that the next step is making the change.',
  ].join('\n')
}

// What the pane's action buttons ask Claude to do. Pressing one is the
// person's explicit request, so the push and MR prompts say so.
function commitPlaybook(state: GitState): string {
  return [
    `Commit my ${state.dirty} uncommitted file(s) on "${state.branch}". ` +
      'I am new to git, so explain in one line what a commit is.',
    '',
    '1. Use the cc-git-commit skill to group the changes and write the messages.',
    '2. I approve your recommended grouping in advance: do not show me the ' +
      'plan or wait for my yes, commit it straight away.',
    '3. Leave out files that look private or local (for example ' +
      'CLAUDE.local.md, .env files, keys) and tell me which ones you skipped.',
    '4. After committing, list each commit in one line and tell me in one ' +
      'line that the next step is pushing.',
  ].join('\n')
}

function pushPlaybook(state: GitState): string {
  const how = state.hasUpstream
    ? `\`git push\` (${state.ahead} commit(s) to send)`
    : `\`git push -u origin ${state.branch}\` (the branch is not on the remote yet)`

  return [
    `I am asking you to push my branch "${state.branch}" so the team can see it.`,
    '',
    `1. Run ${how}.`,
    '2. If it fails, explain why in plain words and stop.',
    '3. Tell me in one line what just happened and that the next step is ' +
      'opening a merge request.',
  ].join('\n')
}

// The person opens the MR themselves from a prefilled link, so they review
// the title and description on GitLab or GitHub before anything is created.
function mrPlaybook(state: GitState): string {
  return [
    `Give me a link that opens the create merge request page for ` +
      `"${state.branch}" into "${state.base}", with the title and ` +
      'description filled in. I am new to git, so explain in one line what ' +
      'a merge request is.',
    '',
    `1. Write a title and a short description from \`git log --oneline ` +
      `${state.base}..HEAD\`. Do not wait for my yes, I can edit them on the page.`,
    '2. Read the host and project path from `git remote get-url origin` ' +
      '(SSH or HTTPS form).',
    '3. Build the link, URL-encoding every value:',
    '   - GitHub: `https://github.com/<owner>/<repo>/compare/' +
      `${state.base}...${state.branch}?expand=1&title=<title>&body=<description>\``,
    '   - GitLab: `https://<host>/<project path>/-/merge_requests/new?' +
      `merge_request[source_branch]=${state.branch}&merge_request[target_branch]=` +
      `${state.base}&merge_request[title]=<title>&merge_request[description]=` +
      '<description>`',
    '   - Any other host: say it is not supported and stop.',
    '4. Show me the title, the description and the link. Do not open the ' +
      'merge request yourself.',
    '5. Tell me in one line to click the link, press Create on the page, then ' +
      'press "Mark done" on the Open MR step.',
  ].join('\n')
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? '' : 's'}`
}

// A button on a step's row: a prompt sent to Claude, or a manual step ticked.
type Action =
  | { key: string; label: string; text: string }
  | { key: string; label: string; mark: StepId }

// The buttons each step's row carries. Commit and push stay offered whenever
// git says they apply, so a person can loop implement, commit, push.
function actions(g: Guide, now: Step | undefined): Map<StepId, Action[]> {
  const { git: state } = g
  const byStep = new Map<StepId, Action[]>()
  const add = (id: StepId, action: Action) =>
    byStep.set(id, [...(byStep.get(id) ?? []), action])

  if (now?.id === 'branch') {
    add('branch', { key: 'create-branch', label: 'Create branch', text: branchPlaybook(state) })
  }
  const isOnBranch = state.branch !== '' && state.branch !== state.base
  if (isOnBranch && state.dirty > 0) {
    add('commit', {
      key: 'commit',
      label: `Commit ${plural(state.dirty, 'changed file')}`,
      text: commitPlaybook(state),
    })
  }
  const unpushed = state.hasUpstream ? state.ahead : state.branchCommits
  if (isOnBranch && unpushed > 0) {
    add('push', {
      key: 'push',
      label: `Push ${plural(unpushed, 'commit')}`,
      text: pushPlaybook(state),
    })
  }
  if (isOnBranch && now?.id === 'mr') {
    add('mr', { key: 'open-mr', label: 'Open MR', text: mrPlaybook(state) })
  }
  if (now?.isManual) {
    add(now.id, { key: 'mark-done', label: 'Mark done', mark: now.id })
  }

  return byStep
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Show or hide the SWE Guide pane',
    })
    await $.tool.register({
      name: 'swe_guide',
      description:
        'The SWE Guide pane shows a newcomer their progress through the ' +
        'feature-change workflow (branch, implement, commit, push, open MR, ' +
        'review, merge). Branch, implement, commit and push are detected from ' +
        'git. action "start" opens the pane; "branch" returns the steps to ' +
        'follow when the person wants to create a branch (call it before ' +
        'creating one); "status" returns the steps, ' +
        'uncommitted file count and unpushed commits; "mark" or "unmark" ' +
        'with step "mr", "review" or "merge" ticks or unticks that step.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'branch', 'status', 'mark', 'unmark'] },
          step: { type: 'string', enum: MANUAL },
        },
        required: ['action'],
      },
      isDeferred: false,
    })
    $.clock.every(POLL_MS, () => void refresh($))

    return next(e)
  })

  on('command.run', { command: COMMAND }, async $ => {
    const isOpen = (await $.ui.panes()).some(pane => pane.id === PANE)
    if (isOpen) {
      await $.ui.close({ id: PANE })

      return { text: 'SWE Guide hidden.' }
    }
    await activate($)

    return { text: 'SWE Guide opened.' }
  })

  on('tool.call', { tool: 'mcp__wai__swe_guide' }, async ($, e) => {
    const action = e.action
    const step = MANUAL.find(id => id === e.step)

    if (action === 'branch') {
      await refresh($)
      const g = await read($, guide)

      return { result: branchPlaybook(g?.git ?? (await readGit($))) }
    }
    if (action === 'start') await activate($)
    else if (action === 'mark' || action === 'unmark') {
      if (step === undefined) {
        return { result: 'step must be "mr", "review" or "merge".' }
      }
      await refresh($)
      await setMarked($, step, action === 'mark')
    } else await refresh($)

    const g = await read($, guide)

    return { result: g === null ? 'SWE Guide is not started.' : describe(g) }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.tool === 'Bash' || e.tool === 'Edit' || e.tool === 'Write') {
      await refresh($).catch(() => undefined)
    }

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const g = await read($, guide)

    if (g === null || !g.git.isRepo) {
      return <Text dimColor>Open a git repository to start the guide.</Text>
    }

    const done = doneSteps(g)
    const now = currentStep(g)
    const { branch, base } = g.git
    const count = STEPS.filter(step => done.has(step.id)).length
    const percent = Math.round((count / STEPS.length) * 100)
    const cols = e.props.bodyColumns
    const barWidth = Math.max(10, Math.min(28, cols - 14))
    const filled = Math.round((count / STEPS.length) * barWidth)

    const acts = actions(g, now)
    const isLooping = now !== undefined && LOOP[now.id] !== undefined
    const ringColor = isLooping ? 'claude' : 'subtle'
    // Inside the loop a person can be at any of its steps, so the marker sits
    // on the loop's middle row rather than following one step.
    const hereId: StepId | undefined = isLooping ? 'commit' : now?.id

    const row = (step: Step, i: number) => {
      const isHere = step.id === hereId
      const buttons = acts.get(step.id) ?? []
      const ring = LOOP[step.id]
      // Only the step under the marker is lit. While looping the marker stands
      // for the whole ring, so every loop step is lit; all else is dimmed.
      const isLit = isHere || (isLooping && ring !== undefined)

      return (
        <Box justifyContent="space-between" alignItems="center">
          <Box flexShrink={1}>
            <Text color={ringColor}>{ring?.left ?? GUTTER}</Text>
            <Text
              color={isLit ? 'text' : 'subtle'}
              dimColor={!isLit}
              bold={isLit}
              wrap="truncate-end"
            >
              {` ${i + 1}  ${step.label.padEnd(LABEL_WIDTH)} `}
            </Text>
            <Text color={ringColor}>{ring?.right ?? GUTTER}</Text>
            {isHere && (
              <Text color="claude" bold>{' you are here!'}</Text>
            )}
          </Box>
          {buttons.length > 0 && (
            <Box columnGap={1} flexShrink={0}>
              {buttons.map((act, n) => (
                <Button
                  key={act.key}
                  label={act.label}
                  variant={n === 0 && 'text' in act ? 'primary' : undefined}
                  onPress={() =>
                    'text' in act
                      ? $.prompt.submit({ text: act.text, asUser: true })
                      : setMarked($, act.mark, true)
                  }
                />
              ))}
            </Box>
          )}
        </Box>
      )
    }

    const local = STEPS.filter(step => !step.isManual)
    const remote = STEPS.filter(step => step.isManual)

    return (
      <Box flexDirection="column" gap={1}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={now === undefined ? 'success' : 'claude'}
          paddingX={1}
        >
          <Box justifyContent="space-between">
            <Text color="claude" bold>◆ Feature change</Text>
            <Text color={now === undefined ? 'success' : 'text'} bold>
              {`${count}/${STEPS.length}`}
            </Text>
          </Box>
          <Box>
            <Text color="success">{'█'.repeat(filled)}</Text>
            <Text color="subtle">{'░'.repeat(barWidth - filled)}</Text>
            <Text dimColor>{` ${percent}%`}</Text>
          </Box>
          <Text color="subtle" wrap="truncate-middle">
            {`⎇ ${branch || '(detached)'} → ${base}`}
          </Text>
        </Box>

        <Box
          borderStyle="round"
          borderColor={now === undefined ? 'success' : 'suggestion'}
          paddingX={1}
        >
          <Text color={now === undefined ? 'success' : 'suggestion'} bold>
            {now === undefined ? '🎉 All done. Nice work!' : `Next: ${now.next}`}
          </Text>
        </Box>

        <Box flexDirection="column">
          <Text color="subtle" bold>{'LOCAL · tracked from git'}</Text>
          {local.map(step => row(step, STEPS.indexOf(step)))}
          <Text color={ringColor} dimColor={!isLooping}>
            {`${GUTTER}↻ repeat for each change`}
          </Text>
        </Box>

        <Box flexDirection="column">
          <Text color="subtle" bold>{'GITLAB · mark when done'}</Text>
          {remote.map(step => row(step, STEPS.indexOf(step)))}
        </Box>

      </Box>
    )
  })
}
