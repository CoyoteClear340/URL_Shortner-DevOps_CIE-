# Architecture

The system is intentionally small: one REST API, one PostgreSQL database, and standard DevOps/observability tools.

| Stage | Purpose | Input | Output | Why it exists |
|---|---|---|---|---|
| Developer/Git | Version source code and collaborate | Code change | Commit, branch, pull request | Gives traceability and review |
| GitHub | Remote source of truth | Git push | Repository event | Stores the reviewed project |
| Jenkins | Automate CI/CD | Merge or push event | Test result, image, deployment | Prevents manual, inconsistent releases |
| Docker | Package the app | Source and `package-lock.json` | Reproducible image | Runs the same artifact everywhere |
| Registry | Store images | Tagged Docker image | Pullable immutable tag | Shares the artifact with Kubernetes |
| Kubernetes | Run and heal replicas | Image tag and manifests | Pods and Service | Provides scheduling, probes, scaling, and stable networking |
| PostgreSQL | Persist shortened URLs | URL and generated code | Rows and click counts | Keeps data beyond a process restart |
| Prometheus | Collect time-series metrics | `/metrics` response | PromQL data | Shows request rate, errors, and latency |
| Grafana | Visualize Prometheus data | PromQL queries | Dashboard panels | Makes behavior easy to demonstrate and interpret |

The key integration rule is that Jenkins deploys the exact immutable `build-N` image it built and pushed. Kubernetes annotations identify application pods for scraping. Grafana reads Prometheus; it does not query the application directly.
