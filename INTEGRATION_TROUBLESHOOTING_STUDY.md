# End-to-End Integration and Troubleshooting Study Guide

## Assessment focus

The group section is worth 14 marks:

- End-to-end workflow: 3 marks
- Live integration: 3 marks
- Troubleshooting: 3 marks
- Team coordination: 3 marks
- Final viva: 2 marks

## Complete project flow

```text
Git branch and commit
        ↓
GitHub pull request and merge
        ↓
Jenkins checkout and test
        ↓
Docker image build
        ↓
Docker registry push
        ↓
Kubernetes Deployment
        ↓
URL-shortener Pods and Service
        ↓
Prometheus scrapes /metrics
        ↓
Grafana queries Prometheus
```

## How one stage feeds the next

| Stage | Output | Used by next stage |
|---|---|---|
| Git | Commit and branch | GitHub and Jenkins |
| GitHub | Repository event | Jenkins trigger |
| Jenkins tests | Pass/fail result | Controls whether packaging continues |
| Docker build | Tagged image | Registry push |
| Registry push | Pullable immutable image tag | Kubernetes Deployment |
| Kubernetes | Running Pods and Service | Prometheus target discovery |
| Application | `/metrics` data | Prometheus |
| Prometheus | Time-series data | Grafana panels |

## Recommended live handover

### Student 1: Git

“The feature branch was reviewed and merged into `main`. This merge is the input to Jenkins.”

### Student 2: Jenkins

“Jenkins checked out that commit, ran the tests, and built image `build-N`. The same tag was pushed and deployed.”

### Student 3: Docker

“The image contains the Node.js application and production dependencies. It listens on port 3000 and can run consistently anywhere.”

### Student 4: Kubernetes

“Kubernetes is running two replicas behind a Service. The Service is the endpoint Prometheus and users reach through the configured access path.”

### Monitoring handover

“The application exposes metrics, Prometheus confirms the target is UP, and Grafana displays rates, errors, latency, and health.”

## General troubleshooting method

Use this order:

1. Identify the first failing stage.
2. Verify the expected output of that stage.
3. Read the tool’s logs or status.
4. Check configuration, names, ports, credentials, and versions.
5. Make the smallest safe correction.
6. Re-run the failed verification.
7. Confirm downstream stages recover.

Do not jump directly to random changes.

## Scenario 1: Git change does not trigger Jenkins

Check the branch, webhook, Jenkins job branch, repository URL, and recent build history. Manually trigger a build only after confirming the webhook or polling configuration.

## Scenario 2: Jenkins tests pass but deployment uses the wrong image

Compare the image tag in the Jenkins build log with the image tag in Kubernetes:

```powershell
kubectl get deployment url-shortener -n url-shortener -o yaml
```

The deployment must use the same immutable `build-N` tag that Jenkins built and pushed.

## Scenario 3: Docker image cannot be pulled by Kubernetes

Use:

```powershell
kubectl get pods -n url-shortener
kubectl describe pod <pod-name> -n url-shortener
kubectl get events --sort-by=.lastTimestamp -n url-shortener
```

Check image name, tag, registry visibility, and image-pull credentials.

## Scenario 4: Application Pod is running but API returns database errors

Check:

```powershell
kubectl logs <pod-name> -n url-shortener
kubectl get secret -n url-shortener
kubectl get pods -l app=postgres -n url-shortener
kubectl get service postgres -n url-shortener
```

Verify that `DATABASE_URL` uses the Kubernetes PostgreSQL Service name `postgres`, the correct port, username, database, and password.

## Scenario 5: Prometheus target is DOWN

Check application health and metrics:

```powershell
Invoke-WebRequest http://localhost:3000/health
Invoke-WebRequest http://localhost:3000/metrics
```

Then check Prometheus target address, port, path, network reachability, and Kubernetes annotations.

## Scenario 6: Grafana has no data

Verify Prometheus first. If the target is DOWN, Grafana cannot display application data. If Prometheus is UP, check the datasource URL, dashboard time range, exact metric names, and panel queries.

## Scenario 7: Kubernetes `ImagePullBackOff` demonstration

Introduce the safe failure:

```powershell
kubectl -n url-shortener set image deployment/url-shortener url-shortener=invalid/url-shortener:does-not-exist
kubectl get pods -n url-shortener
kubectl describe pod <pod-name> -n url-shortener
kubectl logs <pod-name> -n url-shortener
```

Expected explanation:

1. The image name or tag does not exist.
2. Kubernetes cannot pull it.
3. The Pod enters `ImagePullBackOff`.
4. `describe` Events reveal the reason.
5. Logs may be empty because the container never started.
6. Restore the correct image tag.
7. Verify the rollout returns to `Running`.

Restore:

```powershell
kubectl -n url-shortener set image deployment/url-shortener url-shortener=<correct-image>:<correct-tag>
kubectl -n url-shortener rollout status deployment/url-shortener
kubectl get pods -n url-shortener
```

## Final viva questions

### Why is the project called cloud-native if it can run locally?

It uses cloud-native practices—containerized packaging, declarative deployment, replicas, service discovery, automated delivery, and observable services. Kubernetes can run locally or in a cloud.

### What is the most important integration rule?

The artifact tested by Jenkins must be the same immutable artifact deployed by Kubernetes.

### What happens after a developer pushes code?

GitHub receives the commit and triggers Jenkins. Jenkins checks out, installs, tests, builds, pushes, and deploys. Kubernetes runs the new image, Prometheus scrapes metrics, and Grafana visualizes them.

### What is the difference between an application failure and an infrastructure failure?

An application failure is caused by code or runtime behavior, such as a database connection error. An infrastructure failure is caused by deployment, networking, scheduling, image, or cluster configuration.

### Which command gives the most useful Kubernetes troubleshooting information?

`kubectl describe pod` shows resource state and Events. `kubectl logs` shows container output. Both are used together.

### How do you prove the monitoring system is working?

Show the Prometheus target as UP, query `http_requests_total`, generate traffic, and show the corresponding change in Grafana.

### How should the team handle a live failure during the assessment?

Stay calm, identify the failing stage, show status and logs, explain the likely cause, apply a small correction, and verify recovery. The troubleshooting process itself is evidence of understanding.
