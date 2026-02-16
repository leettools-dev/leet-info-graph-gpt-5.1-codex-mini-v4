#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PID_DIR="$ROOT_DIR/pids"

if [[ ! -d "$PID_DIR" ]]; then
  echo "PID directory not found. Nothing to stop."
  exit 0
fi

for pid_file in "$PID_DIR"/*.pid; do
  [[ -f "$pid_file" ]] || continue
  pid=$(cat "$pid_file")
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "Stopping $(basename "$pid_file" .pid) (PID $pid)..."
    kill "$pid"
    wait "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
done
