# URL Shortener

A simple cloud-native URL shortener built with Node.js, Express, PostgreSQL, Docker, Kubernetes, Jenkins, Prometheus, and Grafana.

## Features

- Create short URLs
- Redirect using a short code
- Track click counts
- Store data in PostgreSQL
- Expose Prometheus metrics
- Run locally with Docker Compose
- Deploy with Kubernetes
- Automate build and deployment with Jenkins

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Display API information |
| `GET` | `/health` | Check application health |
| `POST` | `/api/shorten` | Create a short URL |
| `GET` | `/api/urls` | List stored URLs |
| `GET` | `/:shortCode` | Redirect to the original URL |
| `GET` | `/metrics` | Expose Prometheus metrics |

Example request:

```json
{
  "url": "https://github.com/"
}
```

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop
- Optional: Kubernetes, kubectl, Jenkins, Prometheus, and Grafana

## Run locally

```powershell
Copy-Item .env.example .env
npm install
npm test
docker compose up -d postgres
npm start
```

Open the API information page:

```text
http://localhost:3000/
```

For the health check, open:

```text
http://localhost:3000/health
```

## Run the complete stack

```powershell
docker compose up --build
```

Services:

```text
Application: http://localhost:3000
Prometheus:  http://localhost:9090
Grafana:     http://localhost:3001
```

## Docker

```powershell
docker build -t url-shortener:v1 .
docker run --rm -p 3000:3000 url-shortener:v1
```

## Kubernetes

The Kubernetes files are available in the `k8s` directory.

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml -f k8s/postgres.yaml -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl get pods -n url-shortener
kubectl get service -n url-shortener
```

To access the application locally:

```powershell
kubectl port-forward service/url-shortener 3000:3000 -n url-shortener
```

## Monitoring

The application exposes Prometheus metrics at `/metrics`.

Traffic generation:

```powershell
.\scripts\generate-traffic.ps1 -Count 100
```

The script sends health requests and intentionally sends one invalid short-code
request for every ten requests. Those 404 responses are handled silently by
the PowerShell script and are used to create a controlled error-rate signal
for Grafana.

The Grafana dashboard includes request rate, error rate, request latency, and application health panels.

## Testing

```powershell
npm test
npm run lint
```

## Project structure

```text
src/              Application source code
tests/            Jest and Supertest tests
k8s/              Kubernetes manifests
monitoring/       Prometheus and Grafana configuration
jenkins/           Jenkins pipeline
scripts/           Traffic-generation scripts
Dockerfile        Container image definition
docker-compose.yml Local development stack
```

## Complete setup runbook

For the full step-by-step Jenkins, Kubernetes, Prometheus and Grafana setup,
open [DEVOPS_SETUP_GUIDE.html](DEVOPS_SETUP_GUIDE.html) in a browser.

## Study guides

The following guides are aligned with the CIE assessment rubric:

- [GIT_STUDY.md](GIT_STUDY.md)
- [JENKINS_CICD_STUDY.md](JENKINS_CICD_STUDY.md)
- [DOCKER_STUDY.md](DOCKER_STUDY.md)
- [KUBERNETES_STUDY.md](KUBERNETES_STUDY.md)
- [PROMETHEUS_STUDY.md](PROMETHEUS_STUDY.md)
- [GRAFANA_STUDY.md](GRAFANA_STUDY.md)
- [INTEGRATION_TROUBLESHOOTING_STUDY.md](INTEGRATION_TROUBLESHOOTING_STUDY.md)

## License

This project is intended for educational and demonstration purposes.
