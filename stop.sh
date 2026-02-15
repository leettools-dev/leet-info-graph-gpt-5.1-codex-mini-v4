#!/usr/bin/env bash
set -euo pipefail

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