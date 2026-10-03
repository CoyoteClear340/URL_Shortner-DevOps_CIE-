# 8–10 Minute CIE Demonstration

Prepare Docker, a local Kubernetes cluster, Jenkins, and Compose before the presentation. Keep a known-good image tag and a copy of the manifests as a fallback.

## 0:00–0:40 — Introduction

Explain that the project shortens URLs, stores them in PostgreSQL, and exposes Prometheus metrics. Show the architecture: Git → Jenkins → Docker/registry → Kubernetes → Prometheus → Grafana.

## 0:40–1:50 — Student 1: Git

```powershell
git checkout -b feature/shorten-api
git status
git add .
git commit -m "Build observable URL shortener"
git push -u origin feature/shorten-api
```

Open the pull request, merge it into `main`, and show `git pull origin main`. Explain that the merge event triggers Jenkins.

## 1:50–3:00 — Student 2: Jenkins

Open the successful build and show **Checkout**, **Install Dependencies**, **Test**, **Docker Build**, **Docker Push**, and **Kubernetes Deploy**. Explain that the `build-N` tag is the same artifact pushed to Docker Hub and deployed by Kubernetes.

## 3:00–4:00 — Student 3: Docker

```powershell
docker build -t url-shortener:v1 .
docker run --rm -d --name url-shortener-demo -p 3000:3000 <image-with-database-config>
docker ps
docker logs url-shortener-demo
```

Show `FROM`, `COPY`, `RUN`, and `CMD` in the multi-stage Dockerfile. Verify `/health` and stop the demo container afterward.

## 4:00–5:20 — Student 4: Kubernetes

```powershell
kubectl apply -f k8s/namespace.yaml
$DbPassword = Read-Host "Choose a PostgreSQL demo password"
kubectl create secret generic postgres-secret -n url-shortener --from-literal=POSTGRES_PASSWORD="$DbPassword" --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic url-shortener-secret -n url-shortener --from-literal=DATABASE_URL="postgresql://urlshortener:$DbPassword@postgres:5432/urlshortener" --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/configmap.yaml -f k8s/postgres.yaml -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl get pods -n url-shortener
kubectl get service -n url-shortener
kubectl scale deployment url-shortener --replicas=4 -n url-shortener
kubectl get pods -n url-shortener
```

Explain replicas, readiness, liveness, and the NodePort/port-forward access path.

## 5:20–6:20 — Prometheus

Open `http://localhost:9090/targets` and show the `url-shortener` target as **UP**. Run:

```promql
rate(http_requests_total[1m])
sum(rate(http_errors_total[1m]))
```

Explain scraping: Prometheus periodically requests `/metrics`.

## 6:20–7:20 — Grafana

Open `http://localhost:3001`, show **URL Shortener - Full Observability**, and explain request rate, error rate, p95 latency, and healthy pod count. Run `scripts/generate-traffic.ps1 -Count 100` or the shell equivalent and refresh the time range to show the spike.

## 7:20–8:30 — Failure and recovery

Temporarily change the deployment image to a deliberately invalid tag:

```powershell
kubectl -n url-shortener set image deployment/url-shortener url-shortener=invalid/url-shortener:does-not-exist
kubectl get pods -n url-shortener
kubectl describe pod <pod-name> -n url-shortener
kubectl logs <pod-name> -n url-shortener
```

Show `ImagePullBackOff`, identify the tag error in Events, then restore the known-good tag and wait for `kubectl rollout status`. This is documented in `TROUBLESHOOTING.md`.

## 8:30–10:00 — Viva

Use `VIVA.md`. Every student should be able to explain how the image, deployment, metrics, and dashboard connect.
