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
}

// An open merge request (GitLab) or pull request (GitHub) for the branch.
export type Request = { kind: 'MR' | 'PR'; number: number; url: string }

export type Guide = {
  isActive: boolean
  git: GitState
  marked: StepId[]
  request: Request | null
}

declare module 'claude-code' {
  interface PluginState {
    'wai': { guide: Shaped<Guide | null> }
  }
}
