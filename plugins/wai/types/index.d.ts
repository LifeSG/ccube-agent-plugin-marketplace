export type StepId =
  | 'branch'
  | 'implement'
  | 'commit'
  | 'push'
  | 'review'
  | 'mr'
  | 'merge'

export type GitState = {
  isRepo: boolean
  root: string
  branch: string
  base: string
  dirty: number
  branchCommits: number
  hasUpstream: boolean
  ahead: number
  // The upstream's commit, or '' with no upstream.
  pushed: string
}

// An open merge request (GitLab) or pull request (GitHub) for the branch.
export type Request = { kind: 'MR' | 'PR'; number: number; url: string }

export type Severity = 'critical' | 'high' | 'medium' | 'low'

// The last code review's finding counts, and the levels Claude has fixed.
// isDismissed hides the card until a newer review replaces it.
export type Findings = {
  report: string
  counts: Record<Severity, number>
  fixed: Severity[]
  isDismissed: boolean
}

// One finding as the report lists it, for the pane's summary table.
export type FindingRow = { id: string; title: string; where: string }

// The level whose findings the pane lists; rows is null when the report
// could not be read.
export type FindingsView = {
  report: string
  level: Severity
  rows: FindingRow[] | null
}

// team: branch, review and merge request; vibe: commit and push straight to
// the base branch.
export type Mode = 'team' | 'vibe'

// isShipped is true in vibe mode once the work begun on the base branch has
// been pushed and nothing new has started.
export type Guide = {
  isActive: boolean
  mode: Mode
  isShipped: boolean
  git: GitState
  marked: StepId[]
  request: Request | null
  findings: Findings | null
}

declare module 'claude-code' {
  interface PluginState {
    'wai': { guide: Shaped<Guide | null>; viewing: Shaped<FindingsView | null> }
  }
}
