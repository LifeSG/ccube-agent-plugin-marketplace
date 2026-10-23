export type StepId =
  | 'branch'
  | 'implement'
  | 'commit'
  | 'push'
  | 'mr'
  | 'review'
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

export type Guide = {
  isActive: boolean
  git: GitState
  marked: StepId[]
}

declare module 'claude-code' {
  interface PluginState {
    'wai': { guide: Shaped<Guide | null> }
  }
}
