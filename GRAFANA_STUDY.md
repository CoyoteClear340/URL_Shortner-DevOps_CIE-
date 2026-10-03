# Grafana Study Guide

## Why Grafana is used in this project

Grafana turns Prometheus time-series data into readable dashboards. It helps the team understand request traffic, errors, latency, and healthy application instances during the demonstration.

## Assessment checklist

The Grafana rubric awards marks for:

1. Opening an appropriate dashboard.
2. Using appropriate PromQL and visualization panels.
3. Interpreting the visualization and identifying an anomaly.

## Dashboard in this project

Dashboard title:

```text
URL Shortener - Full Observability
```

Panels:

| Panel | Query purpose |
|---|---|
| Request Rate | Shows requests per second |
| Error Rate | Shows 4xx/5xx responses per second |
| Request Latency | Shows p95 duration |
| Healthy Application Instances | Shows healthy targets or Pods |

Compose provisions the Prometheus datasource and dashboard automatically.

Open:

```text
http://localhost:3001
```

## PromQL used by the dashboard

Request rate:

```promql
sum(rate(http_requests_total[1m]))
```

Error rate:

```promql
sum(rate(http_errors_total[1m]))
```

p95 latency:

```promql
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

Healthy targets:

```promql
count(up{job="url-shortener"} == 1)
```

## How to demonstrate Grafana

1. Start Compose.
2. Open Grafana.
3. Open the pre-provisioned dashboard.
4. Confirm the Prometheus datasource is selected.
5. Explain each panel.
6. Generate traffic:

```powershell
.\scripts\generate-traffic.ps1 -Count 100
```

7. Refresh the time range and point out the request-rate spike and controlled error increase.

## Questions and answers

### What is Grafana?

Grafana is a visualization and dashboard tool that queries data sources such as Prometheus.

### How is Grafana related to Prometheus?

Prometheus collects and stores the metrics. Grafana queries Prometheus and displays the results in panels.

### What is a dashboard?

A dashboard is a group of panels that display related queries and metrics.

### What is a panel?

A panel is one visualization, such as a graph, stat, table, or gauge, backed by a query.

### What does request rate mean?

Request rate is the number of requests processed per second over a selected time window.

### What is latency?

Latency is the time taken to process a request. This dashboard shows the 95th percentile, meaning 95% of requests are at or below the displayed value.

### What is an anomaly?

An anomaly is an unexpected or unusual change from normal behavior. In this project a sudden traffic spike is deliberately generated and should appear as a request-rate increase.

### Why does the error-rate panel use a separate metric?

Separating `http_errors_total` makes 4xx and 5xx behavior easy to query and explain without calculating it indirectly from all requests.

### Why might a graph be empty immediately after starting?

Prometheus needs to scrape the application first, and the dashboard needs a time range containing data. Generate traffic and wait for a few scrape intervals.

## Troubleshooting questions

### Grafana cannot connect to Prometheus.

Check the datasource URL. From inside Compose it must be:

```text
http://prometheus:9090
```

Do not use `localhost:9090` from inside the Grafana container.

### Dashboard panels show “No data”.

Check in this order:

1. Prometheus is running.
2. The target is UP.
3. The metric exists in Prometheus.
4. The selected time range includes recent requests.
5. The panel query uses the exact metric name.

### Request rate does not change.

Run the traffic script against the same application monitored by Prometheus. Wait at least two scrape intervals and refresh the dashboard.

### Error rate is flat.

Generate controlled 404 requests and confirm `http_errors_total` in Prometheus before debugging Grafana.

### p95 latency is missing.

Confirm the histogram bucket metric exists:

```text
http_request_duration_seconds_bucket
```

The query must aggregate by `le` before calling `histogram_quantile`.

### How do you explain an anomaly?

State what changed, when it changed, and which panel proves it. For example: “The traffic script generated 100 requests, so the request-rate graph increased. Every tenth request is an intentional 404, so the error-rate graph also increased.”

## Good viva answer

“Grafana reads Prometheus data through a configured datasource. Our dashboard shows request rate, error rate, p95 latency, and healthy instances. We identify an anomaly by generating traffic and observing the corresponding spike in the request-rate and error-rate panels.”
