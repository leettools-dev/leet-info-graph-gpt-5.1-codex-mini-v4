#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/pids"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

mkdir -p "$LOG_DIR" "$PID_DIR"

if [[ -x "$ROOT_DIR/stop.sh" ]]; then
  "$ROOT_DIR/stop.sh" >/dev/null 2>&1 || true
fi

start_service() {
  local name=$1
  local cmd=$2
  local log_file=$3
  local pid_file="$PID_DIR/${name}.pid"

  echo "Starting $name..."
  nohup bash -c "$cmd" >>"$log_file" 2>&1 &
  echo $! >"$pid_file"
  echo "$name PID $(cat "$pid_file") logged to $log_file"
}

start_service "backend" "cd '$ROOT_DIR' && uvicorn backend.app.main:app --host 0.0.0.0 --port $BACKEND_PORT" "$LOG_DIR/backend.log"
start_service "frontend" "cd '$ROOT_DIR' && npm run dev --prefix frontend -- --hostname 0.0.0.0 --port $FRONTEND_PORT" "$LOG_DIR/frontend.log"

echo "\nFrontend: http://localhost:${FRONTEND_PORT}" \
     "\nBackend API: http://localhost:${BACKEND_PORT}" 
