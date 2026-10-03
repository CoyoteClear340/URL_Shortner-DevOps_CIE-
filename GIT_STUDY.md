# Git and GitHub Study Guide

## Why Git is used in this project

Git records every source-code change. It allows the team to work on separate branches, review changes through pull requests, return to an older version, and give Jenkins a precise commit to build.

Git is the local version-control tool. GitHub is the remote hosting and collaboration platform.

## Assessment checklist

The Git rubric awards marks for:

1. Demonstrating clone, add, commit, push, and pull.
2. Explaining a branch, pull request, and merge workflow.
3. Verifying the result and explaining why version control is required.

## Project workflow

```text
Clone repository
    ↓
Create feature branch
    ↓
Edit URL shortener
    ↓
Add and commit
    ↓
Push feature branch
    ↓
Open pull request on GitHub
    ↓
Review and merge into main
    ↓
Jenkins builds the merged code
```

## Important commands

```powershell
git clone <repository-url>
cd url_shortner
git status
git branch
git checkout -b feature/shorten-api
git add .
git commit -m "Add URL shortening API"
git push -u origin feature/shorten-api
git pull origin main
git log --oneline --decorate --graph --all
```

Modern equivalent for creating a branch:

```powershell
git switch -c feature/shorten-api
```

## How to verify Git

```powershell
git status
git branch -a
git log --oneline --max-count=5
git remote -v
```

Expected evidence:

- The feature branch exists.
- The commit appears in `git log`.
- The branch is visible on GitHub.
- The pull request shows the changed files.
- After merging, `main` contains the commit.

## Questions and answers

### What is Git?

Git is a distributed version-control system. It stores project history as commits and allows developers to work safely on branches.

### What is GitHub?

GitHub is a platform that hosts Git repositories and provides pull requests, code review, permissions, and webhooks.

### What is the difference between Git and GitHub?

Git is the version-control software. GitHub is an online service that stores Git repositories and supports collaboration.

### What is a repository?

A repository is the project folder together with its Git history and configuration.

### What is a commit?

A commit is a permanent snapshot of staged changes with a message and author information.

### What is staging?

Staging selects which changes will be included in the next commit. `git add` moves changes into the staging area.

### What is a branch?

A branch is an independent line of development. It allows a feature to be developed without changing `main` immediately.

### What is a pull request?

A pull request asks the team to review and merge changes from one branch into another, normally from a feature branch into `main`.

### What is the difference between `git pull` and `git push`?

`git pull` downloads and integrates changes from a remote repository. `git push` uploads local commits to a remote repository.

### Why should we not develop directly on `main`?

A feature branch protects the stable branch and gives the team a place to review and test changes before merging.

### How does Git connect to Jenkins in this project?

The developer pushes or merges code on GitHub. Jenkins detects the repository change through a webhook or polling and checks out the commit for the pipeline.

## Troubleshooting questions

### `git push` is rejected. What should you do?

First inspect the branch and remote:

```powershell
git branch
git remote -v
git pull --rebase origin <branch-name>
git push
```

If the remote branch contains changes, integrate them before pushing. Do not force-push shared history unless the team explicitly agrees.

### Git says there is no remote repository.

Check:

```powershell
git remote -v
```

Add the correct remote:

```powershell
git remote add origin <repository-url>
```

### There is a merge conflict. What do you do?

1. Run `git status`.
2. Open each conflicted file.
3. Choose the correct code and remove conflict markers.
4. Run tests.
5. Stage the resolved files.
6. Complete the merge or rebase.

```powershell
git add <file>
git commit
```

### Jenkins built an old commit. How do you investigate?

Check the Jenkins build commit, the GitHub branch, and the webhook. Compare:

```powershell
git log --oneline origin/main
```

Confirm that Jenkins is configured with the correct repository URL, branch, and credentials.

### Sensitive files appear in Git status. What should you do?

Do not commit them. Add the correct pattern to `.gitignore`, remove already-tracked secrets with `git rm --cached`, rotate exposed credentials, and commit the cleanup.

## Good viva answer

“We use a feature branch so the URL-shortener change can be reviewed in a pull request. After merge into `main`, Jenkins checks out that exact commit, runs tests, builds the Docker image, and deploys it. Git gives us traceability and a safe rollback history.”
