# Jenkins CI/CD Study Guide

## Why Jenkins is used in this project

Jenkins automates the path from source code to a deployed application. It makes the process repeatable and ensures that code is tested before a Docker image is built and deployed.

This project uses `jenkins/Jenkinsfile`.

## Assessment checklist

The Jenkins rubric awards marks for:

1. Explaining pipeline stages and configuration.
2. Demonstrating a trigger and automated build.
3. Demonstrating or explaining deployment.

## Pipeline stages in this project

```text
Checkout
    ↓
Install Dependencies
    ↓
Test
    ↓
Docker Build
    ↓
Docker Push
    ↓
Kubernetes Deploy
```

The pipeline creates an immutable image tag:

```text
<docker-image>:build-<BUILD_NUMBER>
```

The same tag is pushed to the registry and deployed to Kubernetes.

## What must be configured

The Jenkins agent needs:

- Node.js and npm
- Docker CLI and access to a Docker daemon
- kubectl
- Kubernetes Credentials plugin
- Docker Hub credentials
- A kubeconfig credential

Credentials configured in the Jenkinsfile:

| Credential ID | Purpose |
|---|---|
| `dockerhub-credentials` | Login to the Docker registry |
| `kubernetes-config` | Access the Kubernetes cluster |

Do not place passwords or tokens in the Jenkinsfile.

## How to demonstrate Jenkins

1. Push or merge a change on GitHub.
2. Open the Jenkins job.
3. Show the build trigger.
4. Open the console output.
5. Show each successful stage.
6. Show the pushed Docker image tag.
7. Show the Kubernetes rollout result.

Useful verification:

```powershell
kubectl get deployment url-shortener -n url-shortener
kubectl rollout status deployment/url-shortener -n url-shortener
kubectl get pods -n url-shortener
```

## Questions and answers

### What is CI?

Continuous Integration automatically builds and tests code whenever changes are integrated into the shared repository.

### What is CD?

Continuous Delivery or Deployment automates delivery of a tested build to an environment. In this project Jenkins deploys the Docker image to Kubernetes.

### What is Jenkins?

Jenkins is an automation server that runs pipelines for building, testing, packaging, and deploying software.

### What is a Jenkinsfile?

A Jenkinsfile is a pipeline definition stored with the source code. It documents and automates the delivery process.

### Why use a pipeline?

A pipeline gives repeatable stages, visible logs, automatic failure reporting, and less manual work.

### What triggers this pipeline?

A GitHub push or merge can trigger it through a webhook or Jenkins polling configuration.

### Why use `BUILD_NUMBER` in the image tag?

It creates an identifiable and immutable version. If build 17 is deployed, we know exactly which pipeline run produced it.

### Why should Kubernetes use the same image Jenkins built?

Using the same tag guarantees that the tested artifact is the artifact being deployed. Otherwise Jenkins could test one image while Kubernetes runs a different image.

### What happens if tests fail?

The pipeline stops at the Test stage. Docker build, push, and deployment should not continue because the source has not passed validation.

### Why are credentials stored in Jenkins?

Jenkins credentials are protected and injected only during the required step. This is safer than committing passwords to source code.

## Troubleshooting questions

### Jenkins cannot clone the repository.

Check:

1. Repository URL.
2. Branch name.
3. GitHub credentials.
4. Network access from the Jenkins agent.
5. Whether the repository is private.

Read the Checkout stage log for the exact error.

### `npm ci` fails.

Check that `package.json` and `package-lock.json` are committed and consistent:

```powershell
npm ci
```

Run the command locally with the same Node.js version. Do not replace `npm ci` with an uncontrolled install in CI.

### Tests fail in Jenkins but pass locally.

Compare Node.js versions, environment variables, working directory, database availability, and test command. The project tests mock database access, so unexpected database errors usually indicate a configuration or code difference.

### Docker build fails.

Check the Dockerfile, build context, `package-lock.json`, Docker daemon access, and `.dockerignore`. Run:

```powershell
docker build -t url-shortener:test .
```

### Docker push is denied.

Check the Docker Hub credential, image name, registry login, and permission to push to the repository. The image name must include the correct Docker Hub username.

### Kubernetes deployment does not update.

Check the kubeconfig and namespace:

```powershell
kubectl config current-context
kubectl get deployment -n url-shortener
kubectl describe deployment url-shortener -n url-shortener
```

Confirm Jenkins deployed the new immutable tag rather than reusing an old tag.

### How do you explain a failed Jenkins build in the viva?

Identify the first failed stage, read its console output, fix that stage locally, rerun the same command, and trigger a new build. Do not skip the failed stage without understanding it.

## Good viva answer

“Jenkins receives a GitHub change, checks out the commit, installs dependencies, runs Jest tests, builds a Docker image, pushes the immutable `build-N` tag, and updates Kubernetes to that exact tag. If testing fails, later delivery stages are not executed.”
