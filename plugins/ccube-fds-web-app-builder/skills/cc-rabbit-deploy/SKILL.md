---
name: cc-rabbit-deploy
description: >-
  GCC deployment via Rabbit Deploy — initialize a local project with git,
  configure the Rabbit Deploy GitLab remote with a Project Access Token, and
  push to trigger automatic deployment. Use when a user wants to deploy their
  project to GCC using Rabbit Deploy, set up version control for the first
  time, or push code changes to trigger the CI/CD pipeline.
argument-hint: >-
  Provide your Rabbit Deploy GitLab repo URL and Project Access Token, or
  ask for help obtaining them from the portal.
user-invocable: true
---

# Rabbit Deploy — GCC Deployment Skill

This skill walks you through initialising version control and pushing your
project to Rabbit Deploy to trigger automatic deployment to GCC (Government
Commercial Cloud).

---

## Prerequisites

Before running this skill you MUST confirm the user has:

1. **WOG AD Account** — required to log in to the Rabbit Deploy Portal.
2. **Rabbit Deploy Access** — if not yet assigned to a Product Space, the
   user must ping `#ask-rabbit` on Slack with their WOG AD email.
3. **Git installed** — verify with `git --version` on a SEED laptop. Git is
   pre-installed on SEED laptops; contact CIO Office support if missing.
4. **A Rabbit Deploy project created** in the portal (see below).

### Create a Project (if not yet done)

1. Go to [https://rabbitdeploy.sandbox.gov.sg](https://rabbitdeploy.sandbox.gov.sg)
   and log in with your WOG AD credentials.
2. Select your team workspace and click **Create New**.
3. Fill in the following:
   - **Project Name** — meaningful name for the app
   - **Description** — brief description of the project
   - **Template** — select **Empty Project Template**

### Get Your Project Access Token

1. In the Rabbit Deploy Portal, navigate to your project.
2. In the **Actions** section, click **Get Repo Token**, click **Generate Token**.
3. Copy the generated token immediately — it is shown **only once**.

---

## Step 1 — Gather Required Values

Ask the user to confirm one value before proceeding:

| Value             | Where to find it                                                    |
| ----------------- | ------------------------------------------------------------------- |
| `GITLAB_REPO_URL` | From the Rabbit Deploy Portal — your project's full GitLab repo URL |
|                   | e.g. `https://gitlab.cio.sandbox.gov.sg/my-team/my-project.git`     |

> **Security:** You MUST NOT ask the user to share their Project Access
> Token with Copilot. The token is a secret credential. All commands
> below include a `<PROJECT_ACCESS_TOKEN>` placeholder — the user MUST
> substitute their token directly in the terminal before running each
> command.

---

## Step 2 — Verify Git and Initialise the Repository

Run the following from the root of the project directory in the terminal:

```bash
# Confirm git is available
git --version

# Initialise a new git repository (safe to run even if .git already exists)
git init

# Check the current state
git status
```

If `git status` reports `fatal: not a git repository`, `git init` was
needed. If the `.git` folder already exists, `git init` is still safe and
can be skipped.

---

## Step 3 — Configure the Rabbit Deploy Remote

Add the Rabbit Deploy GitLab repository as the `origin` remote, embedding
the Project Access Token directly in the URL for authentication.

> **Security:** Replace `<PROJECT_ACCESS_TOKEN>` yourself in the
> terminal. Do not paste the token into this chat.

```bash
git remote add origin \
  https://oauth2:<PROJECT_ACCESS_TOKEN>@<GITLAB_HOST_AND_PATH>
```

**Example** (replace with your actual values):

```bash
# Original URL from the portal:
#   https://gitlab.cio.sandbox.gov.sg/my-team/my-project.git

git remote add origin \
  https://oauth2:glpat-xxxxxxxxxxxxxxxxxxxx@gitlab.cio.sandbox.gov.sg/my-team/my-project.git
```

Verify the remote was set correctly:

```bash
git remote -v
```

---

## Step 4 — Stage and Commit Your Code

Stage all project files and create the initial commit:

```bash
git add .
git commit -m "Initial commit"
```

If the commit step outputs `nothing to commit, working tree clean`, the
directory is already committed — proceed directly to Step 5.

---

## Step 5 — Push to Trigger Automatic Deployment

Push your code to the `main` branch on the Rabbit Deploy remote:

```bash
git push -u origin main
```

If the default branch is not `main`, replace it with `master` or the
correct branch name shown in the portal.

After a successful push:

- The CI/CD deployment pipeline is **automatically triggered** — no manual
  steps are required.
- Allow **1–3 minutes** for the build to complete.
- Your app will be accessible at:
  `https://<project-name>.cio.rabbitdeploy.sandbox.gov.sg`

The sandbox URL works on GSIB laptops and COMET environments and is
automatically configured with SSL.

---

## Subsequent Pushes (Redeployment)

For every subsequent code change:

```bash
git status                            # Review changed files
git add .                             # Stage all changes
git commit -m "Your commit message"   # Commit with a descriptive message
git push                              # Push to trigger redeployment
```

---

## Troubleshooting

| Symptom                                 | Resolution                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `remote: 401 Unauthorized`              | Token expired. Portal → your project → Actions → **Get Token**. Update the remote: `git remote set-url origin <new-auth-url>` |
| `error: remote origin already exists`   | Run `git remote set-url origin <url>` instead of `git remote add origin`                                                      |
| `src refspec main does not match any`   | No commits yet. Run `git add . && git commit -m "Initial commit"` and retry                                                   |
| `error: failed to push some refs`       | Remote has commits your local does not. Run `git pull --rebase origin main` then push again                                   |
| Build not triggering after push         | Confirm the push succeeded (`git log --oneline -1`) and check the pipeline status in the Rabbit Deploy Portal                 |
| Account not assigned to a Product Space | Ping `#ask-rabbit` on Slack with your WOG AD email and request assignment to your Division / Agency Product Space             |

---

## Resources

- Rabbit Deploy Portal: <https://rabbitdeploy.sandbox.gov.sg>
- TechPass Portal: <https://portal.techpass.gov.sg>
- Slack support: `#ask-rabbit`
- Product Development Journey Portal:
  <https://cioo-product-development-journey.cio.sandbox.gov.sg>
- Sandbox app URL pattern:
  `https://<project-name>.cio.rabbitdeploy.sandbox.gov.sg`
