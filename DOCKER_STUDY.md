# Docker Study Guide

## Why Docker is used in this project

Docker packages the Node.js application and its dependencies into a reproducible image. The same image can run on a laptop, Jenkins agent, or Kubernetes node.

## Assessment checklist

The Docker rubric awards marks for:

1. Explaining `FROM`, `COPY`, `RUN`, and `CMD` or `ENTRYPOINT`.
2. Building, tagging, and verifying an image.
3. Running, inspecting, and accessing a container on the correct port.

## Dockerfile explanation

```dockerfile
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 3000
CMD ["node", "src/server.js"]
```

| Instruction | Meaning in this project |
|---|---|
| `FROM` | Selects the Node.js Alpine base image |
| `WORKDIR` | Sets the application directory |
| `COPY` | Copies manifests, dependencies, and source code |
| `RUN` | Installs production dependencies during image build |
| `EXPOSE` | Documents that the app listens on port 3000 |
| `CMD` | Starts the Node.js server |

The Dockerfile is multi-stage so the final runtime image does not need development dependencies.

## Important commands

```powershell
docker build -t url-shortener:v1 .
docker images
docker run --name url-shortener-demo -p 3000:3000 url-shortener:v1
docker ps
docker logs url-shortener-demo
docker inspect url-shortener-demo
docker stop url-shortener-demo
docker rm url-shortener-demo
```

Compose command:

```powershell
docker compose up --build
docker compose ps
docker compose logs app
docker compose down
```

## How to verify Docker

```powershell
docker images url-shortener
docker ps
Invoke-RestMethod http://localhost:3000/health
docker logs url-shortener-demo
```

Expected result:

```json
{
  "status": "ok"
}
```

## Questions and answers

### What is a Docker image?

An image is an immutable package containing the application, runtime, dependencies, and filesystem layers needed to create containers.

### What is a container?

A container is a running instance of an image. It is an isolated process that uses the host kernel.

### What does `FROM` do?

It selects the base image for the build. This project uses `node:22-alpine`.

### What does `COPY` do?

It copies files from the build context or an earlier stage into the image.

### What does `RUN` do?

It executes a command while building the image. Here it installs production dependencies.

### What does `CMD` do?

It defines the default command executed when a container starts.

### What is the difference between an image and a container?

An image is the packaged template. A container is the running process created from that template.

### Why use a multi-stage build?

It separates dependency/build work from the runtime image and reduces unnecessary files and development dependencies.

### Why is port 3000 used?

The Express application listens on port 3000. `-p 3000:3000` maps host port 3000 to container port 3000.

### Why does the Docker container need a database configuration?

The API stores URLs in PostgreSQL. The app image contains the code, but `DATABASE_URL` tells it where PostgreSQL is running.

## Troubleshooting questions

### Docker daemon is not running.

Start Docker Desktop and verify:

```powershell
docker info
```

If `docker info` cannot connect to the engine, image builds and containers cannot run.

### The image builds but the container exits.

Check:

```powershell
docker ps -a
docker logs <container-id>
```

Typical causes are missing `DATABASE_URL`, a database that is not running, or an application startup error.

### Port 3000 is already allocated.

Find the process or use another host port:

```powershell
docker run --rm -p 3001:3000 url-shortener:v1
```

Then access `http://localhost:3001/health`.

### The application cannot connect to PostgreSQL.

Inside Compose, use the service name:

```text
postgresql://urlshortener:urlshortener@postgres:5432/urlshortener
```

Do not use `localhost` from inside the app container because `localhost` means the app container itself.

### Docker image changes are not visible.

Rebuild:

```powershell
docker build --no-cache -t url-shortener:v2 .
```

Use a new tag or recreate the Compose container.

### `docker logs` is empty.

The process may have exited before logging, or the wrong container name may have been used. Run `docker ps -a` and inspect the container status.

## Good viva answer

“Docker packages this Express API and its production dependencies into an image. Jenkins builds and pushes that image, and Kubernetes runs the same tagged image. The port mapping exposes the application’s internal port 3000 on the host.”
