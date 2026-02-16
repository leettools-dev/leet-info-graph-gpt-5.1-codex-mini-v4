#!/usr/bin/env bash
set -euo pipefail

<<<<<<< HEAD
PID_DIR="pids"

if [[ ! -d $PID_DIR ]]; then
  echo "No PID directory found; nothing to stop."
  exit 0
fi

kill_service() {
  local name=$1
  local pid_file="$PID_DIR/$2"
  if [[ -f $pid_file ]]; then
    local pid
    pid=$(<"$pid_file")
    if [[ -n $pid ]]; then
      if kill "$pid" >/dev/null 2>&1; then
        echo "Stopped $name (PID $pid)."
      else
        echo "PID $pid for $name not running."
      fi
    fi
    rm -f "$pid_file"
  fi
}

kill_service "frontend" "frontend.pid"
kill_service "backend" "backend.pid"

echo "Services stopped."
=======
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
>>>>>>> dev#feature#research-infographic-studio
