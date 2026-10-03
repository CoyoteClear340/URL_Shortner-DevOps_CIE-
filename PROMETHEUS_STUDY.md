# Prometheus Study Guide

## Why Prometheus is used in this project

Prometheus collects time-series metrics from the URL-shortener `/metrics` endpoint. It stores counters and histogram data so request rate, errors, latency, and health can be queried over time.

## Assessment checklist

The Prometheus rubric awards marks for:

1. Explaining Prometheus, targets, and exporters where applicable.
2. Explaining the scrape configuration.
3. Verifying target status and retrieving a metric/query.

## How this project exposes metrics

The application uses `prom-client` and exposes:

```text
http_requests_total
http_request_duration_seconds
http_errors_total
url_shortener_created_total
url_shortener_redirects_total
```

Request metrics use safe labels:

```text
method
route
status_code
```

Raw short codes and raw URLs are not used as labels, which avoids unnecessary high-cardinality time series.

## Configuration

For Docker Compose, `monitoring/prometheus.yml` scrapes:

```yaml
scrape_configs:
  - job_name: url-shortener
    metrics_path: /metrics
    static_configs:
      - targets: ["app:3000"]
```

For Kubernetes, the application Pods have:

```text
prometheus.io/scrape: "true"
prometheus.io/path: /metrics
prometheus.io/port: "3000"
```

`k8s/prometheus-config.yaml` demonstrates Kubernetes Pod discovery.

## How to demonstrate Prometheus

1. Start the stack:

```powershell
docker compose up --build
```

2. Open:

```text
http://localhost:9090/targets
```

3. Confirm the `url-shortener` target is **UP**.
4. Open the Graph page.
5. Run a query.

Useful queries:

```promql
rate(http_requests_total[1m])
sum(rate(http_requests_total[1m]))
sum(rate(http_errors_total[1m]))
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
up
```

Generate traffic:

```powershell
.\scripts\generate-traffic.ps1 -Count 100
```

## Questions and answers

### What is Prometheus?

Prometheus is an open-source monitoring system that collects and stores numeric time-series data and provides the PromQL query language.

### What is scraping?

Scraping is Prometheus periodically making an HTTP request to a target’s metrics endpoint.

### What is a target?

A target is an endpoint that Prometheus is configured to scrape, such as `app:3000/metrics`.

### What is an exporter?

An exporter converts metrics from a system into Prometheus format. In this project the Node.js application exposes its own metrics directly using `prom-client`, so a separate exporter is not required.

### What is `/metrics`?

It is the HTTP endpoint that returns metrics in Prometheus exposition format.

### What is a counter?

A counter is a value that increases over time, such as total requests or total errors. Rates are calculated from counters using `rate()`.

### What is a histogram?

A histogram records observations in buckets. The request-duration histogram allows percentile calculations such as p95 latency.

### What does `rate(http_requests_total[1m])` mean?

It calculates the per-second average increase in the request counter over the last minute.

### What does `up` mean?

`up` is usually `1` when a scrape succeeded and `0` when the target could not be scraped.

### Why should raw URLs not be labels?

Every unique raw URL would create a new time series, causing high cardinality and unnecessary memory usage. This project uses normalized route labels instead.

## Troubleshooting questions

### The target is DOWN.

Check:

1. The application is running.
2. `/metrics` responds.
3. The target hostname is correct.
4. Prometheus can reach the target over the Docker or Kubernetes network.
5. The scrape path and port are correct.

Compose uses `app:3000`, not `localhost:3000`, because Prometheus runs in a separate container.

### Metrics endpoint returns 404.

Check that the metrics route is registered before the dynamic `/:shortCode` route. Verify:

```powershell
Invoke-WebRequest http://localhost:3000/metrics
```

### Metrics exist but queries return no data.

Generate requests, wait for the scrape interval, and check the target status. Confirm the exact metric name:

```text
http_requests_total
http_errors_total
http_request_duration_seconds_bucket
```

### Request rate is always zero.

Send traffic to the same application target Prometheus scrapes. Then wait for at least one or two scrape intervals.

### Error rate is not visible.

Generate safe 404 requests:

```powershell
Invoke-WebRequest http://localhost:3000/invalid-demo-code -ErrorAction SilentlyContinue
```

The application increments `http_errors_total` for 4xx and 5xx responses.

### Prometheus Kubernetes discovery finds no Pods.

Check Pod annotations, namespace selection, Prometheus permissions, Pod IPs, and the generated scrape configuration.

## Good viva answer

“Prometheus scrapes the application’s `/metrics` endpoint and stores counters and latency histograms. We verify the `url-shortener` target is UP, then use PromQL such as `sum(rate(http_requests_total[1m]))` to calculate request rate.”
