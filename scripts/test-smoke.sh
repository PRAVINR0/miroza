#!/bin/bash
set -e

# Start local server in background
npx http-server . -p 8081 > /dev/null 2>&1 &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 5

# Function to check URL
check_url() {
  url=$1
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$code" -eq 200 ]; then
    echo "✅ $url returned 200 OK"
  else
    echo "❌ $url returned $code"
    kill $SERVER_PID
    exit 1
  fi
}

echo "Running smoke tests..."
check_url "http://localhost:8081/index.html"
check_url "http://localhost:8081/news/index.html"
check_url "http://localhost:8081/articles/index.html"
check_url "http://localhost:8081/blogs/index.html"

# Check if homepage has content (naive check for specific strings that should be loaded)
# Note: fetch content might not work with curl if it relies on JS.
# But we can check if the file is served. The JS logic was verified by Playwright script.
# This smoke test primarily checks that files exist and are served.

echo "Smoke tests passed!"
kill $SERVER_PID
exit 0
