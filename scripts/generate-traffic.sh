#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://localhost:3000}"
COUNT="${2:-100}"

echo "Generating ${COUNT} requests against ${BASE_URL}"
i=1
while [ "$i" -le "$COUNT" ]; do
  if [ $((i % 10)) -eq 0 ]; then
    curl -s -o /dev/null -w "error %{http_code}\n" "${BASE_URL}/invalid-demo-code"
  else
    curl -s -o /dev/null -w "request %{http_code}\n" "${BASE_URL}/health"
  fi
  i=$((i + 1))
done
