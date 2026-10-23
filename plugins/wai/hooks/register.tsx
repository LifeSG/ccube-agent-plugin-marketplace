import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type {
  FindingRow,
  Findings,
  GitState,
  Guide,
  Request,
  Severity,
  StepId,
} from '../types'

const PANE = 'swe-guide'
const TITLE = 'SWE Guide · Feature change'
const COMMAND = 'cc-swe-coach-ui'
const POLL_MS = 10_000
// Asking the remote for requests is a network call, so it runs at most
// this often for the same pushed commit.
const REQUEST_MS = 60_000

// Change the tag when Guide's fields change: it declines what an earlier
// version stored, which outlives a reload.
const guide = atom({ plugin: 'wai', key: 'guide' } as const, null, {
  shape: 'guide-5',
})
// The level whose findings table the pane shows, if any.
const viewing = atom({ plugin: 'wai', key: 'viewing' } as const, null, {
  shape: 'viewing-1',
})

// Each review severity, in the order fixes are made. Fix all leaves out LOW,
// which the review marks optional.
const SEVERITIES = [
  { id: 'critical', label: 'CRITICAL', meaning: 'blocks approval', color: 'error' },
  { id: 'high', label: 'HIGH', meaning: 'should fix', color: 'warning' },
  { id: 'medium', label: 'MEDIUM', meaning: 'recommended', color: 'suggestion' },
  { id: 'low', label: 'LOW', meaning: 'optional', color: 'subtle' },
] as const
const LEVELS: readonly Severity[] = SEVERITIES.map(s => s.id)
const severity = (id: Severity) => SEVERITIES.find(s => s.id === id) ?? SEVERITIES[0]
const FIX_ALL: readonly Severity[] = ['critical', 'high', 'medium']

// isManual steps are ticked by "Mark done" or the tool; isRemote steps are
// listed under the remote's heading (GitLab or GitHub), the rest under LOCAL.
type Step = {
  id: StepId
  label: string
  next: string
  isManual: boolean
  isRemote: boolean
}

const STEPS: readonly Step[] = [
  {
    id: 'branch',
    label: 'Create branch',
    next: 'create a branch for your change',
    isManual: false,
    isRemote: false,
  },
  {
    id: 'implement',
    label: 'Implement',
    next: 'make your change on the branch',
    isManual: false,
    isRemote: false,
  },
  {
    id: 'commit',
    label: 'Commit',
    next: 'commit your changes',
    isManual: false,
    isRemote: false,
  },
  {
    id: 'push',
    label: 'Push',
    next: 'push your branch so the team can see it',
    isManual: false,
    isRemote: false,
  },
  {
    id: 'review',
    label: 'Code review',
    next: 'review your code before opening an MR',
    isManual: true,
    isRemote: false,
  },
  {
    id: 'mr',
    label: 'Open MR',
    next: 'open a merge request',
    isManual: true,
    isRemote: true,
  },
  {
    id: 'merge',
    label: 'Review & merge',
    next: 'get the MR approved and merged',
    isManual: true,
    isRemote: true,
  },
]

const MANUAL = STEPS.filter(step => step.isManual).map(step => step.id)
const MANUAL_LIST = MANUAL.map(id => `"${id}"`).join(', ')
// Each push brings new code to review, so these marks are dropped when the
// pushed commit changes.
const PER_PUSH: readonly StepId[] = ['review', 'merge']
// The swe_guide tool's actions; Maestro's SWE Guide section names "branch"
// and "mark", so a rename there must follow here.
const ACTIONS = ['start', 'branch', 'status', 'mark', 'unmark', 'findings', 'fixed'] as const

// The ring drawn around the steps a person repeats for each change: down the
// right side past the buttons, back up the left to Implement.
const LOOP: Partial<Record<StepId, { left: string; right: string }>> = {
  implement: { left: '╭─ ', right: ' ─╮' },
  commit: { left: '▲  ', right: '  ▼' },
  push: { left: '╰─ ', right: ' ─╯' },
}
const GUTTER = '   '
// Labels padded to the longest loop label, so the ring's right side lines up;
// rows outside the ring have no right side to align.
const LABEL_WIDTH = Math.max(
  ...STEPS.filter(step => LOOP[step.id] !== undefined).map(step => step.label.length),
)

const NO_REPO: GitState = {
  isRepo: false,
  root: '',
  branch: '',
  base: 'main',
  dirty: 0,
  branchCommits: 0,
  hasUpstream: false,
  ahead: 0,
  pushed: '',
}

// git runs by itself in whatever repo the session is in, so settings a cloned
// repo's own config could use to run a program are overridden: an fsmonitor
// hook on every status, and an upload-pack command or the ext:: and file
// transports when ls-remote asks origin.
const SAFE_CONFIG = ['-c', 'core.fsmonitor=false']
const SAFE_REMOTE_CONFIG = [
  '-c', 'remote.origin.uploadpack=git-upload-pack',
  '-c', 'protocol.ext.allow=never',
  '-c', 'protocol.file.allow=never',
]

async function git($: EngineInterface, ...args: string[]) {
  const safe = args[0] === 'ls-remote' ? [...SAFE_CONFIG, ...SAFE_REMOTE_CONFIG] : SAFE_CONFIG
  try {
    const ran = await $.process.run(['git', ...safe, ...args], {
      timeoutMs: args[0] === 'ls-remote' ? 15_000 : 5_000,
      // Never stop to ask for a password: a failed check finds no request.
      env: { GIT_TERMINAL_PROMPT: '0' },
    })

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
  // A background status must not take .git/index.lock, or the person's own
  // git add or commit can fail while it runs.
  const status = await git($, '--no-optional-locks', 'status', '--porcelain')
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
  const pushed = upstream.isOk ? (await git($, 'rev-parse', '@{u}')).out : ''

  return {
    isRepo: true,
    root: root.out,
    branch,
    base,
    dirty,
    branchCommits,
    hasUpstream: upstream.isOk,
    ahead,
    pushed,
  }
}

// The web address of the remote's project, from an SSH or HTTPS remote URL.
function webBase(remote: string): string | undefined {
  const ssh = remote.match(/^(?:ssh:\/\/)?[^@/\s]+@([^:/\s]+)(?::\d+)?[:/](.+?)(?:\.git)?\/?$/)
  const web = remote.match(/^https?:\/\/(?:[^@/\s]+@)?([^/\s]+)\/(.+?)(?:\.git)?\/?$/)
  const found = ssh ?? web

  return found === null ? undefined : `https://${found[1]}/${found[2]}`
}

// GitHub keeps refs/pull/<n>/head and GitLab refs/merge-requests/<n>/head for
// each request, updated on every push while it is open. A request whose head
// is the branch's pushed commit is the branch's open request.
// undefined when the remote could not be asked, so the answer is not cached.
async function readRequest(
  $: EngineInterface,
  state: GitState,
): Promise<Request | null | undefined> {
  // A repo's own ssh command would run on every check; such a repo is not
  // asked, and Open MR is left to "Mark done".
  if ((await git($, 'config', '--local', '--get', 'core.sshCommand')).isOk) return null

  const listed = await git(
    $,
    'ls-remote',
    'origin',
    `refs/heads/${state.branch}`,
    'refs/pull/*/head',
    'refs/merge-requests/*/head',
  )
  if (!listed.isOk) return undefined

  const refs = listed.out
    .split('\n')
    .map(line => line.split('\t'))
    .filter((pair): pair is [string, string] => pair.length === 2)
  const head = refs.find(([, ref]) => ref === `refs/heads/${state.branch}`)?.[0]
  if (head === undefined) return null

  const matches = refs.flatMap(([sha, ref]) => {
    const found = ref.match(/^refs\/(pull|merge-requests)\/(\d+)\/head$/)

    return sha === head && found !== null
      ? [{ kind: found[1] === 'pull' ? ('PR' as const) : ('MR' as const), number: Number(found[2]) }]
      : []
  })
  if (matches.length === 0) return null

  // The newest request wins when an older one was closed at the same commit.
  const newest = matches.reduce((a, b) => (b.number > a.number ? b : a))
  const remote = await git($, 'remote', 'get-url', 'origin')
  if (!remote.isOk) return undefined
  const base = webBase(remote.out)
  if (base === undefined) return null
  const path = newest.kind === 'PR' ? 'pull' : '-/merge_requests'

  return { ...newest, url: `${base}/${path}/${newest.number}` }
}

let lastCheck: { key: string; at: number; request: Request | null } | undefined

// Only a pushed branch can have a request; the remote is asked again when the
// pushed commit changes, or once REQUEST_MS has passed. A failed ask keeps the
// last answer for the same push and is tried again on the next refresh.
async function findRequest($: EngineInterface, state: GitState): Promise<Request | null> {
  const isOnBranch = state.branch !== '' && state.branch !== state.base
  if (!state.isRepo || !isOnBranch || !state.hasUpstream) return null

  const key =
    `${state.root}#${state.branch}#${state.pushed}#${state.branchCommits}#${state.ahead}`
  const now = await $.clock.now()
  if (lastCheck?.key === key && now - lastCheck.at < REQUEST_MS) {
    return lastCheck.request
  }
  const request = await readRequest($, state)
  if (request === undefined) return lastCheck?.key === key ? lastCheck.request : null
  lastCheck = { key, at: now, request }

  return request
}

function progressKey(state: GitState) {
  return `progress:${state.root}#${state.branch}`
}

// Findings outlive a push, so a person can fix one level, commit and push,
// then fix the next. The next review replaces them.
function findingsKey(state: GitState) {
  return `findings:${state.root}#${state.branch}`
}

function parseCounts(value: unknown): Findings['counts'] | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const raw = value as Record<string, unknown>
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const level of LEVELS) {
    const n = raw[level]
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) return undefined
    counts[level] = n
  }

  return counts
}

async function readFindings($: EngineInterface, state: GitState): Promise<Findings | null> {
  const stored = await $.store.get(findingsKey(state))
  if (typeof stored !== 'object' || stored === null) return null
  const raw = stored as {
    report?: unknown
    counts?: unknown
    fixed?: unknown
    isDismissed?: unknown
  }
  const counts = parseCounts(raw.counts)
  if (typeof raw.report !== 'string' || counts === undefined) return null
  const fixed = Array.isArray(raw.fixed)
    ? raw.fixed.filter((id): id is Severity => LEVELS.includes(id))
    : []

  return { report: raw.report, counts, fixed, isDismissed: raw.isDismissed === true }
}

// cc-code-review writes a branch review to
// reviews/<YYYYMMDD-HHMM>-DIFF-<slug>/CODE-REVIEW-<slug>.md, the slug being the
// branch with every other character than a letter or digit made a hyphen.
function reviewSlug(branch: string) {
  return branch.replace(/[^A-Za-z0-9]/g, '-')
}

// The newest review report for the branch, relative to the repo root; the
// folder's timestamp sorts by name.
async function findReport($: EngineInterface, state: GitState): Promise<string | undefined> {
  if (state.branch === '') return undefined
  const slug = reviewSlug(state.branch)
  const entries = await $.fs.list(`${state.root}/reviews`).catch(() => [])
  const isRun = (name: string) =>
    name.length === slug.length + 19 &&
    /^\d{8}-\d{4}-DIFF-/.test(name) &&
    name.endsWith(slug)
  const runs = entries
    .filter(entry => entry.kind === 'dir' && isRun(entry.name))
    .map(entry => entry.name)
    .sort()
  for (const run of runs.reverse()) {
    const report = `reviews/${run}/CODE-REVIEW-${slug}.md`
    if (await $.fs.exists(`${state.root}/${report}`)) return report
  }

  return undefined
}

// Counts from the report's headings, such as
// "### HIGH Priority (SHOULD FIX) - 9 issues"; a level with no heading has none.
function countFindings(text: string): Findings['counts'] {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  const heading = /^###\s+(CRITICAL|HIGH|MEDIUM|LOW)\b[^\n]*?-\s*(\d+)\s+\w+\s*$/gm
  for (const found of text.matchAll(heading)) {
    const level = found[1]?.toLowerCase() as Severity
    counts[level] = Number(found[2])
  }

  return counts
}

// The findings listed under a level's heading, each a bullet such as
// "- **SEC-HIGH-01**: Title — `path:line` ..." or "- SEC-MED-02: Title",
// its wrapped lines joined. The heading's section ends at the next ## or ###.
function listFindings(text: string, level: Severity): FindingRow[] {
  const lines = text.split('\n')
  const heading = new RegExp(`^###\\s+${level.toUpperCase()}\\b`)
  const start = lines.findIndex(line => heading.test(line))
  if (start === -1) return []

  const items: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^#{2,3}\s/.test(line)) break
    if (line.startsWith('- ')) items.push(line.slice(2).trim())
    else if (/^\s+\S/.test(line) && items.length > 0) {
      items[items.length - 1] += ` ${line.trim()}`
    }
  }

  return items.flatMap(item => {
    const found = item.match(/^\*{0,2}([^:*]+?)\*{0,2}:\s*(.*)$/)
    if (found === null) return []
    const body = found[2] ?? ''
    const title = (body.split(/\s+—\s+/)[0] ?? '').replace(/\.$/, '')
    // A file with a line number first, so a config name such as
    // `core.fsmonitor` is not taken for the file.
    const path =
      body.match(/`([^`\s]+\.\w+:\d[\d,-]*)`/)?.[1] ??
      body.match(/`([^`\s]+\.\w+)`/)?.[1] ??
      ''

    return [{ id: (found[1] ?? '').trim(), title, where: path.split('/').pop() ?? '' }]
  })
}

function relative(state: GitState, path: string) {
  const bare = path.replace(/^\.\//, '')

  return bare.startsWith(`${state.root}/`) ? bare.slice(state.root.length + 1) : bare
}

// A report on disk newer than the recorded one replaces it, with nothing
// fixed; the same report keeps what was fixed.
async function detectFindings(
  $: EngineInterface,
  state: GitState,
  held: Findings | null,
): Promise<Findings | null> {
  const report = await findReport($, state)
  if (report === undefined) return held
  if (held !== null && relative(state, held.report) >= report) return held

  const text = await $.fs.read(`${state.root}/${report}`).catch(() => undefined)
  if (text === undefined) return held
  const findings = { report, counts: countFindings(text), fixed: [], isDismissed: false }
  await $.store.set(findingsKey(state), findings)

  return findings
}

// A View button shows that level's findings as a table; pressed again, or
// once another review replaces the report, the table goes.
async function toggleView($: EngineInterface, findings: Findings, level: Severity) {
  const held = await read($, viewing)
  if (held?.report === findings.report && held.level === level) {
    await update($, viewing, () => null)

    return
  }
  const g = await read($, guide)
  if (g === null || !g.git.isRepo) return
  const path = relative(g.git, findings.report)
  const text = await $.fs
    .read(path.startsWith('/') ? path : `${g.git.root}/${path}`)
    .catch(() => undefined)
  const rows = text === undefined ? null : listFindings(text, level)
  await update($, viewing, () => ({ report: findings.report, level, rows }))
}

async function setFindings($: EngineInterface, findings: Findings) {
  const g = await read($, guide)
  if (g === null || !g.git.isRepo) return
  await $.store.set(findingsKey(g.git), findings)
  await update($, guide, held => (held === null ? held : { ...held, findings }))
}

// Remove hides the card and its table; a newer review shows it again.
async function dismissFindings($: EngineInterface, findings: Findings) {
  await update($, viewing, () => null)
  await setFindings($, { ...findings, isDismissed: true })
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
  // A push to a branch with an open request still needs its own review, so
  // the request ticks Open MR alone.
  if (g.request !== null) done.add('mr')
  for (const id of g.marked) done.add(id)

  return done
}

function currentStep(g: Guide): Step | undefined {
  const done = doneSteps(g)

  return STEPS.find(step => !done.has(step.id))
}

// Progress is stored as { marked, pushed }; an earlier version stored the
// marked ids alone, which is taken as marked at the current push.
async function readMarked($: EngineInterface, state: GitState): Promise<StepId[]> {
  const stored = await $.store.get(progressKey(state))
  const record =
    typeof stored === 'object' && stored !== null && !Array.isArray(stored)
      ? (stored as { marked?: unknown; pushed?: unknown })
      : { marked: stored, pushed: state.pushed }
  const ids = Array.isArray(record.marked) ? record.marked : []
  const marked = ids.filter((id): id is StepId => MANUAL.includes(id))
  if (record.pushed === state.pushed) return marked

  // A review marked before the branch's first push reviewed the code that
  // push sends, so the first push keeps it.
  const isFirstPush = record.pushed === ''
  const kept = marked.filter(
    id => !PER_PUSH.includes(id) || (isFirstPush && id === 'review'),
  )
  await $.store.set(progressKey(state), { marked: kept, pushed: state.pushed })

  return kept
}

let running: Promise<void> | undefined
let queued: Promise<void> | undefined

// One refresh at a time: a call while one runs waits for a single follow-up
// refresh, shared by every caller that came in meanwhile, so each sees git
// as it was after its own call.
function refresh($: EngineInterface): Promise<void> {
  if (running === undefined) {
    running = refreshOnce($).finally(() => {
      running = undefined
    })

    return running
  }
  queued ??= running
    .catch(() => undefined)
    .then(() => {
      queued = undefined

      return refresh($)
    })

  return queued
}

// The poll and the post-tool refresh run only while the pane is shown; the
// tool and the pane's own drawing refresh whenever they are asked.
async function refreshIfShown($: EngineInterface) {
  const held = await read($, guide)
  const isPaneOpen = (await $.ui.panes()).some(pane => pane.id === PANE)
  if (held === null ? isPaneOpen : held.isActive) await refresh($)
}

async function refreshOnce($: EngineInterface) {
  const held = await read($, guide)
  // A pane left open when the stored guide was declined (a new shape after a
  // reload) starts the guide again instead of asking for a repository.
  const isPaneOpen =
    held === null && (await $.ui.panes()).some(pane => pane.id === PANE)
  if (held === null && isPaneOpen) {
    await update($, guide, g =>
      g ?? { isActive: true, git: NO_REPO, marked: [], request: null, findings: null },
    )
  } else if (held === null) return

  const seen = marks
  const state = await readGit($)
  const marked = state.isRepo ? await readMarked($, state) : []
  const findings = state.isRepo
    ? await detectFindings($, state, await readFindings($, state))
    : null

  // Show git's state at once; the remote's answer can take seconds. A mark
  // made meanwhile is newer than the list read above, so it stands.
  await update($, guide, g =>
    g === null
      ? g
      : { ...g, git: state, marked: marks === seen ? marked : g.marked, findings },
  )
  const request = await findRequest($, state)
  await update($, guide, g => (g === null ? g : { ...g, request }))
}

// Bumped by every mark, so a refresh that read the marks before one does not
// put the old list back.
let marks = 0

async function setMarked($: EngineInterface, id: StepId, isMarked: boolean) {
  marks += 1
  // A refresh under way may rewrite the stored marks for a new push; wait for
  // it, so this mark is written after.
  await running?.catch(() => undefined)
  const g = await read($, guide)
  if (g === null || !g.git.isRepo) return

  // From the store, which holds the marks as of the current push.
  const held = await readMarked($, g.git)
  const marked = isMarked ? [...new Set([...held, id])] : held.filter(one => one !== id)
  await $.store.set(progressKey(g.git), { marked, pushed: g.git.pushed })
  await update($, guide, held => (held === null ? held : { ...held, marked }))
}

async function activate($: EngineInterface) {
  await update($, guide, g =>
    g === null
      ? { isActive: true, git: NO_REPO, marked: [], request: null, findings: null }
      : { ...g, isActive: true },
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
  lines.push(
    g.request === null
      ? 'Open merge request: none found'
      : `Open merge request: ${g.request.kind} #${g.request.number} ${g.request.url}`,
  )
  lines.push(now === undefined ? 'All steps done.' : `Current step: ${now.label}`)

  return lines.join('\n')
}

// Branch names come from the repo and are sent as the person's own words, so
// only plain names reach a prompt: no quotes, backticks, $, &, ; or spaces,
// and no leading - that git would read as an option.
function isSafeRef(name: string): boolean {
  return /^[A-Za-z0-9._/-]+$/.test(name) && !name.startsWith('-')
}

// The steps Claude follows to create the branch, shared by the pane's button
// and the tool so both paths ask the same questions in the same order.
function branchPlaybook(state: GitState): string {
  if (!isSafeRef(state.base)) {
    return (
      'The base branch name has characters a branch name should not have. ' +
      'Tell me in plain words that the repository needs checking, and stop.'
    )
  }
  const on = isSafeRef(state.branch) ? `"${state.branch}"` : 'this branch'
  const dirty =
    state.dirty > 0
      ? `There are ${state.dirty} uncommitted file(s) on ${on}. ` +
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
    '3. Before staging, check every changed file by name and content. Leave ' +
      'out and tell me about any that look private, local or secret: ' +
      'CLAUDE.local.md, `.env` and `.env.*`, `*.pem`, `*.key`, `*.p12`, ' +
      '`id_rsa*`, `*credentials*`, `*secret*`, and any file holding a token, ' +
      'password, private key or API key. If you are unsure about a file, leave ' +
      'it out and ask me. This check is not waived by step 2.',
    '4. Stage files by name (never `git add -A` or `git add .`), then run ' +
      '`git diff --cached --name-only` and make sure none of the files left ' +
      'out in step 3 is staged.',
    '5. After committing, list each commit in one line and tell me in one ' +
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
      'a code review.',
  ].join('\n')
}

// A plugin's prompt cannot pick the model, so the prompt asks Claude to run
// the review's subagents on Sonnet.
function reviewPlaybook(state: GitState): string {
  return [
    `Review the changes on "${state.branch}" before I open a merge request ` +
      `into "${state.base}". I am new to git, so explain in one line what a ` +
      'code review is.',
    '',
    `1. Run the cc-code-review skill on the branch diff ` +
      `(\`${state.base}..HEAD\`).`,
    '2. Launch every review subagent with the Claude Sonnet model ' +
      '(`model: "sonnet"` on the Agent tool).',
    '3. When the review is written, tell me where the report is and list the ' +
      'critical and high findings in one line each.',
    '4. Call the swe_guide tool with action "findings", `report` set to the ' +
      "report's path and `counts` set to the number of critical, high, medium " +
      'and low findings in the report (each a whole number, 0 if none).',
    '5. Call the swe_guide tool with action "mark" and step "review", then ' +
      'tell me in one line that I can fix findings from the guide, or open a ' +
      'merge request.',
  ].join('\n')
}

// What a Fix button asks Claude to do: one level, or every level but LOW.
function fixPlaybook(findings: Findings, levels: readonly Severity[]): string {
  const names = levels.map(level => level.toUpperCase()).join(', ')
  const calls = levels.map(level => `"${level}"`).join(', then ')

  return [
    `Fix only the ${names} findings from the code review in ` +
      `\`${findings.report}\`. I am new to coding, so explain each fix in one line.`,
    '',
    `1. Read the report and list the ${names} findings by ID ` +
      '(for example SEC-HIGH-01).',
    `2. Fix each of them${levels.length > 1 ? ', most severe first' : ''}. Do ` +
      'not change anything for findings at any other severity, even in the ' +
      'same file.',
    '3. Do not commit or push.',
    '4. List each fixed ID in one line, and any you skipped and why.',
    `5. Call the swe_guide tool with action "fixed" and level ${calls}, then ` +
      'tell me in one line that the next step is committing the fixes.',
  ].join('\n')
}

// The person opens the MR themselves from a prefilled link, so they review
// the title and description on GitLab or GitHub before anything is created.
// The branch names go into the link already encoded, so Claude cannot get them
// wrong; actions() offers the button only for names isSafeRef allows.
function mrPlaybook(state: GitState): string {
  const branch = encodeURIComponent(state.branch)
  const base = encodeURIComponent(state.base)

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
    '3. Build the link. The branch names below are already URL-encoded: use ' +
      'them exactly as written. URL-encode the title and description:',
    '   - GitHub: `https://github.com/<owner>/<repo>/compare/' +
      `${base}...${branch}?expand=1&title=<title>&body=<description>\``,
    '   - GitLab: `https://<host>/<project path>/-/merge_requests/new?' +
      `merge_request%5Bsource_branch%5D=${branch}&merge_request%5Btarget_branch%5D=` +
      `${base}&merge_request%5Btitle%5D=<title>&merge_request%5Bdescription%5D=` +
      '<description>`',
    '   - Any other host: say it is not supported and stop.',
    '4. Show me the title, the description and the link. Do not open the ' +
      'merge request yourself, with a tool, the API or the command line: I ' +
      'open it from the link.',
    '5. Tell me in one line to click the link and press Create on the page. ' +
      'The guide ticks Open MR by itself once the request exists; if it does ' +
      'not within a minute, press "Mark done" on the Open MR step.',
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
  // A branch or base with an unusual name gets no prompt buttons.
  const isOnBranch =
    state.branch !== '' &&
    state.branch !== state.base &&
    isSafeRef(state.branch) &&
    isSafeRef(state.base)
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
  // A person may review at any point on the branch, not only after a push.
  if (isOnBranch) {
    add('review', {
      key: 'code-review',
      label: 'Run code review',
      text: reviewPlaybook(state),
    })
  }
  if (isOnBranch && now?.id === 'mr' && g.request === null) {
    add('mr', { key: 'open-mr', label: 'Open MR', text: mrPlaybook(state) })
  }
  if (now?.isManual) {
    add(now.id, { key: 'mark-done', label: 'Mark done', mark: now.id })
  }

  return byStep
}

let poller: Timer | undefined

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
        'feature-change workflow (branch, implement, commit, push, code ' +
        'review, open MR, review and merge). Branch, implement, commit and push are detected from ' +
        'git; Open MR is ticked when the remote has an open request for the ' +
        'pushed branch. action "start" opens the pane; "branch" returns the steps to ' +
        'follow when the person wants to create a branch (call it before ' +
        'creating one); "status" returns the steps, ' +
        'uncommitted file count and unpushed commits; "mark" or "unmark" ' +
        `with step ${MANUAL_LIST} ticks or unticks that step ("review" is ` +
        'the code review before the MR, "merge" is review and merge); ' +
        '"findings" with `report` and `counts` records a finished code ' +
        "review's finding counts; \"fixed\" with `level` shows that level's " +
        'findings as fixed.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: [...ACTIONS] },
          step: {
            type: 'string',
            enum: MANUAL,
            description: 'Required for "mark" and "unmark".',
          },
          report: { type: 'string', description: 'Path of the review report.' },
          counts: {
            type: 'object',
            properties: Object.fromEntries(
              LEVELS.map(level => [level, { type: 'integer', minimum: 0 }]),
            ),
            required: [...LEVELS],
          },
          level: { type: 'string', enum: LEVELS },
        },
        required: ['action'],
      },
      isDeferred: false,
    })
    // A second session.start replaces the poll rather than adding one.
    poller?.cancel()
    poller = $.clock.every(POLL_MS, () => void refreshIfShown($).catch(() => undefined))

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
    if (action === 'findings') {
      const counts = parseCounts(e.counts)
      if (typeof e.report !== 'string' || e.report === '' || counts === undefined) {
        return {
          result:
            'findings needs `report` (a path) and `counts` with whole numbers ' +
            `for ${LEVELS.join(', ')}.`,
        }
      }
      await refresh($)
      await setFindings($, { report: e.report, counts, fixed: [], isDismissed: false })
    } else if (action === 'fixed') {
      const level = LEVELS.find(id => id === e.level)
      if (level === undefined) {
        return { result: `level must be one of ${LEVELS.join(', ')}.` }
      }
      await refresh($)
      const found = (await read($, guide))?.findings ?? null
      if (found === null) return { result: 'No code review findings are recorded.' }
      await setFindings($, { ...found, fixed: [...new Set([...found.fixed, level])] })
    } else if (action === 'start') await activate($)
    else if (action === 'mark' || action === 'unmark') {
      if (step === undefined) {
        return { result: `step must be one of ${MANUAL_LIST}.` }
      }
      await refresh($)
      await setMarked($, step, action === 'mark')
    } else if (action === 'status') await refresh($)
    else return { result: `action must be one of ${ACTIONS.join(', ')}.` }

    const g = await read($, guide)

    return { result: g === null ? 'SWE Guide is not started.' : describe(g) }
  })

  // The tool's result goes back at once; the pane catches up in the
  // background.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.tool === 'Bash' || e.tool === 'Edit' || e.tool === 'Write') {
      void refreshIfShown($).catch(() => undefined)
    }

    return ran
  })

  // A hidden guide stops polling git until it is opened again.
  on('ui.close', { id: PANE }, async ($, e, next) => {
    await next(e)
    await update($, guide, g => (g === null ? g : { ...g, isActive: false }))
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Link } = $.ui.resolve(e)
    const g = await read($, guide)
    const view = await read($, viewing)

    if (g === null) {
      void refresh($).catch(() => undefined)

      return <Text dimColor>Starting the guide…</Text>
    }
    if (!g.git.isRepo) {
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
      // The step under the marker is lit. While looping the marker stands for
      // the whole ring, so every loop step is lit. Code review can run at any
      // time, and Review & merge is under way once a request is open; all
      // else is dimmed.
      const isLit =
        isHere ||
        (isLooping && ring !== undefined) ||
        step.id === 'review' ||
        (step.id === 'merge' && g.request !== null)

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
            {/* A filled badge, so it stands out from the coral outlines. */}
            {isHere && <Text>{' '}</Text>}
            {isHere && (
              <Text backgroundColor="claude" color="inverseText" bold>
                {' ◀ YOU ARE HERE '}
              </Text>
            )}
          </Box>
          {step.id === 'mr' && g.request !== null && (
            <Box flexShrink={0}>
              <Link
                href={g.request.url}
                label={`View ${g.request.kind} #${g.request.number}`}
              />
            </Box>
          )}
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

    const local = STEPS.filter(step => !step.isRemote)
    const remote = STEPS.filter(step => step.isRemote)

    // After a review: one row per severity, each with its own Fix button, and
    // a Fix all that leaves out LOW. A fixed level keeps its row, ticked.
    const findingsCard = (findings: Findings) => {
      const total = LEVELS.reduce((sum, level) => sum + findings.counts[level], 0)
      const isOpen = (level: Severity) =>
        findings.counts[level] > 0 && !findings.fixed.includes(level)
      const rest = FIX_ALL.filter(isOpen)
      const fix = (levels: readonly Severity[]) => () =>
        $.prompt.submit({ text: fixPlaybook(findings, levels), asUser: true })
      const shown = view?.report === findings.report ? view : null

      return (
        <Box flexDirection="column" borderStyle="round" borderColor="subtle" paddingX={1}>
          <Box justifyContent="space-between">
            <Text color="claude" bold>{'Code review findings'}</Text>
            <Box columnGap={1} alignItems="center" flexShrink={0}>
              <Text bold>{String(total)}</Text>
              <Button
                key="dismiss-findings"
                label="Remove"
                onPress={() => dismissFindings($, findings)}
              />
            </Box>
          </Box>
          <Text dimColor wrap="truncate-middle">{findings.report}</Text>
          <Box flexDirection="column" marginTop={1}>
            {SEVERITIES.map(s => {
              const n = findings.counts[s.id]
              const isFixed = n > 0 && findings.fixed.includes(s.id)
              const note = isFixed ? 'fixed' : n === 0 ? '—' : s.meaning

              return (
                <Box key={s.id} justifyContent="space-between" alignItems="center">
                  <Box flexShrink={1}>
                    <Text color={isFixed ? 'success' : s.color}>{isFixed ? '✓ ' : '● '}</Text>
                    <Text bold={isOpen(s.id)} dimColor={n === 0}>
                      {`${s.label.padEnd(8)} ${String(n).padStart(3)}  `}
                    </Text>
                    <Text color={isFixed ? 'success' : 'subtle'} wrap="truncate-end">
                      {note}
                    </Text>
                  </Box>
                  {n > 0 && (
                    <Box columnGap={1} flexShrink={0}>
                      <Button
                        key={`view-${s.id}`}
                        label={shown?.level === s.id ? 'Hide' : 'View'}
                        onPress={() => toggleView($, findings, s.id)}
                      />
                      {isOpen(s.id) && (
                        <Button key={`fix-${s.id}`} label={`Fix ${n} ${s.id}`} onPress={fix([s.id])} />
                      )}
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
          {shown !== null && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold>
                {`${shown.level.toUpperCase()} findings`}
              </Text>
              {shown.rows === null ? (
                <Text color="error">{'The report could not be read.'}</Text>
              ) : shown.rows.length === 0 ? (
                <Text dimColor>{'No findings are listed under this level in the report.'}</Text>
              ) : (
                // Each finding stacks its ID and file over its title, so it
                // reads at any pane width.
                <Box key="findings-list" flexDirection="column" gap={1}>
                  {shown.rows.map(row => (
                    <Box key={`finding-${row.id}`} flexDirection="column">
                      <Box justifyContent="space-between" columnGap={1}>
                        <Text color={severity(shown.level).color} bold>{row.id}</Text>
                        <Text dimColor wrap="truncate-start">{row.where}</Text>
                      </Box>
                      <Box paddingLeft={2}>
                        <Text>{row.title}</Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
          {rest.length > 0 && (
            <Box justifyContent="flex-end" marginTop={1}>
              <Button
                key="fix-all"
                label="Fix all except low"
                variant="primary"
                onPress={fix(rest)}
              />
            </Box>
          )}
        </Box>
      )
    }

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
          <Box marginTop={1}>
            <Text color="subtle">{'Branch  '}</Text>
            <Text color="claude" bold wrap="truncate-middle">
              {`⎇ ${branch || '(detached)'}`}
            </Text>
          </Box>
          <Box>
            <Text color="subtle">{'Into    '}</Text>
            <Text color="text" bold wrap="truncate-middle">{base}</Text>
          </Box>
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
          <Text color="subtle" bold>{'LOCAL'}</Text>
          {local.map(step => row(step, STEPS.indexOf(step)))}
        </Box>

        <Box flexDirection="column">
          <Text color="subtle" bold>{'REMOTE · GITLAB / GITHUB'}</Text>
          {remote.map(step => row(step, STEPS.indexOf(step)))}
        </Box>

        {g.findings !== null && !g.findings.isDismissed && findingsCard(g.findings)}

      </Box>
    )
  })
}
