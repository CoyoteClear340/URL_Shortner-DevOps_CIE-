# Troubleshooting

## Application does not start

Check `DATABASE_URL`, then start PostgreSQL:

```powershell
docker compose up -d postgres
docker compose logs postgres
npm start
```

The health endpoint does not query PostgreSQL, but the server initializes the schema before listening.

## Invalid URL returns 400

The API accepts only non-empty `http://` and `https://` URLs. Send JSON with the `Content-Type: application/json` header.

## Kubernetes `ImagePullBackOff` demonstration

This is a safe, deliberate failure. It changes only the deployment image and does not delete data:

```powershell
kubectl -n url-shortener set image deployment/url-shortener url-shortener=invalid/url-shortener:does-not-exist
kubectl get pods -n url-shortener
kubectl describe pod <pod-name> -n url-shortener
kubectl logs <pod-name> -n url-shortener
```

`describe` shows an image-pull event because the registry cannot find the image. `logs` may be empty because the container never started. Restore the real tag:

```powershell
kubectl -n url-shortener set image deployment/url-shortener url-shortener=your-dockerhub-user/url-shortener:build-17
kubectl -n url-shortener rollout status deployment/url-shortener
kubectl get pods -n url-shortener
```

## Prometheus target is DOWN

Check that the application is listening on port 3000 and that `/metrics` responds. In Compose, the target must be `app:3000`, not `localhost:3000`, because Prometheus runs in another container. In Kubernetes, confirm pod annotations and that Prometheus has permission to discover pods.

## Grafana shows no data

Confirm the Prometheus datasource URL is `http://prometheus:9090` from inside Compose. Generate traffic, wait for two scrape intervals, and check the Prometheus targets page before debugging Grafana panels.
