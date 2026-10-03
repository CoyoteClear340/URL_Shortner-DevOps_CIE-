# Kubernetes Study Guide

## Why Kubernetes is used in this project

Kubernetes runs the URL-shortener containers, maintains the desired number of replicas, provides stable networking through a Service, performs health checks, and supports scaling and rolling updates.

## Assessment checklist

The Kubernetes rubric awards marks for:

1. Applying or explaining the Deployment YAML and verifying Pods.
2. Demonstrating Service exposure or replica scaling.
3. Using `kubectl get`, `describe`, `logs`, and events to troubleshoot.

## Resources in this project

| Resource | Purpose |
|---|---|
| Namespace | Isolates project resources under `url-shortener` |
| Deployment | Maintains two URL-shortener replicas |
| Service | Provides stable access to changing Pods |
| ConfigMap | Stores non-secret configuration such as port and base URL |
| Secret | Stores database connection information |
| PostgreSQL Deployment | Runs the demo database |
| Probes | Check application readiness and liveness |

## Deployment flow

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml -f k8s/postgres.yaml -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl get pods -n url-shortener
```

The application Deployment starts:

```yaml
replicas: 2
```

Access with port forwarding:

```powershell
kubectl port-forward service/url-shortener 3000:3000 -n url-shortener
```

Scale:

```powershell
kubectl scale deployment url-shortener --replicas=4 -n url-shortener
kubectl get pods -n url-shortener
```

## Verification commands

```powershell
kubectl get all -n url-shortener
kubectl get pods -o wide -n url-shortener
kubectl get deployment url-shortener -n url-shortener
kubectl describe deployment url-shortener -n url-shortener
kubectl describe pod <pod-name> -n url-shortener
kubectl logs <pod-name> -n url-shortener
kubectl get events --sort-by=.lastTimestamp -n url-shortener
kubectl rollout status deployment/url-shortener -n url-shortener
```

## Questions and answers

### What is Kubernetes?

Kubernetes is a platform for deploying, scheduling, networking, scaling, and healing containerized applications.

### What is a Pod?

A Pod is the smallest Kubernetes scheduling unit. It contains one or more closely related containers that share networking and storage.

### What is a Deployment?

A Deployment declares the desired application state, such as image version and replica count, and creates or updates ReplicaSets and Pods to maintain that state.

### What is a Service?

A Service provides a stable virtual IP and DNS name for a group of Pods selected by labels.

### Why are replicas used?

Replicas improve availability and allow traffic to be distributed across multiple application instances.

### What is a readiness probe?

It tells Kubernetes whether a Pod is ready to receive traffic. A failed readiness probe removes the Pod from Service endpoints.

### What is a liveness probe?

It tells Kubernetes whether the container is still functioning. Repeated failure causes Kubernetes to restart the container.

### What is scaling?

Scaling changes the number of running replicas. This project demonstrates scaling from two to four Pods.

### What is a rolling update?

A rolling update gradually replaces old Pods with new Pods so the application can remain available during deployment.

### Why use a namespace?

A namespace groups and isolates project resources, making commands and cleanup safer.

### What is the difference between a ConfigMap and a Secret?

A ConfigMap stores non-sensitive configuration. A Secret is intended for sensitive values such as database passwords and connection strings.

## Troubleshooting questions

### Pods show `Pending`.

Run:

```powershell
kubectl describe pod <pod-name> -n url-shortener
kubectl get events --sort-by=.lastTimestamp -n url-shortener
```

Look for insufficient CPU or memory, unschedulable nodes, missing volumes, or invalid scheduling constraints.

### Pods show `ImagePullBackOff`.

Check:

```powershell
kubectl describe pod <pod-name> -n url-shortener
```

Look at Events. Common causes are a wrong image name, wrong tag, private registry credentials, or an unavailable registry.

Fix the image:

```powershell
kubectl set image deployment/url-shortener url-shortener=<correct-image>:<tag> -n url-shortener
kubectl rollout status deployment/url-shortener -n url-shortener
```

### Pods show `CrashLoopBackOff`.

Read the current and previous logs:

```powershell
kubectl logs <pod-name> -n url-shortener
kubectl logs <pod-name> --previous -n url-shortener
```

Check environment variables, database connectivity, application startup errors, and probe configuration.

### Pods are running but Service access fails.

Check labels and endpoints:

```powershell
kubectl get pods --show-labels -n url-shortener
kubectl get service url-shortener -n url-shortener
kubectl get endpoints url-shortener -n url-shortener
```

The Service selector must match the Pod label `app: url-shortener`. Also verify the target port and port-forward command.

### Readiness probe fails.

Test the endpoint inside the Pod:

```powershell
kubectl exec -it <pod-name> -n url-shortener -- wget -qO- http://localhost:3000/health
```

The `/health` route is intentionally lightweight and should return `{"status":"ok"}`.

### Database-backed requests fail but `/health` works.

This usually means the app process is healthy but PostgreSQL configuration or connectivity is wrong. Check the Secret, PostgreSQL Pod, PostgreSQL Service, and `DATABASE_URL`.

### How do you safely demonstrate a Kubernetes failure?

Change only the image tag to a nonexistent value. Observe `ImagePullBackOff`, inspect the Pod with `describe`, then restore the known-good immutable tag. Do not delete the namespace or production data.

## Good viva answer

“The Deployment keeps two URL-shortener Pods running. The Service gives them stable access, probes control traffic and restarts, and Kubernetes can scale the Deployment to four replicas. If a Pod cannot start, `kubectl describe` and events show the reason, while `kubectl logs` shows application output when the container starts.”
