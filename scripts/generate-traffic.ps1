param(
  [string]$BaseUrl = "http://localhost:3000",
  [int]$Count = 100
)

for ($i = 1; $i -le $Count; $i++) {
  if ($i % 10 -eq 0) {
    try {
      Invoke-WebRequest -Uri "$BaseUrl/invalid-demo-code" -UseBasicParsing -ErrorAction Stop | Out-Null
    } catch {
      # This 404 is intentional so Grafana can display an error-rate spike.
    }
  } else {
    Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing | Out-Null
  }
}
Write-Host "Generated $Count requests against $BaseUrl"
