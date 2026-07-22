# Git Setup Failure Recovery Protocol

Apply these steps in order when a git command fails during Section 0A.

```
Git Setup Failure Recovery:
1. Uncommitted Changes → git stash save "review-temp-$(date +%s)"
   then retry setup
2. Branch Not Found → git ls-remote --heads origin <branch>
   then git fetch --all, retry
3. Auth Error → ABORT: "Git authentication failed. Verify
   credentials and retry."
4. Merge Conflict / Detached HEAD → checkout base, reset --hard,
   retry setup
5. 2 failures → ABORT with specific error message
```
