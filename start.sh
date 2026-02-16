#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

load_env_file() {
  for candidate in .env .env.sample; do
    if [[ -f "$candidate" ]]; then
      set -o allexport
      # shellcheck disable=SC1090
      source "$candidate"
      set +o allexport
      echo "Loaded environment file: $candidate"
      return
    fi
  done
  echo "No .env file found; proceeding with defaults."
}

load_env_file

if [[ -x "./stop.sh" ]]; then
  ./stop.sh >/dev/null 2>&1 || true
fi

mkdir -p logs pids

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${BACKEND_PORT}}"

start_service() {
  local name=$1
  local cmd=$2
  local log_file="$ROOT_DIR/logs/${name}.log"
  local pid_file="$ROOT_DIR/pids/${name}.pid"

  echo "Starting $name (logs: $log_file)..."
  nohup bash -c "$cmd" >>"$log_file" 2>&1 &
  echo $! >"$pid_file"
  echo "Started $name (PID $(cat "$pid_file"))"
}

start_service "backend" "cd '$ROOT_DIR/backend' && uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT}"
start_service "frontend" "cd '$ROOT_DIR/frontend' && npm run dev -- --hostname 0.0.0.0 --port ${FRONTEND_PORT}"

printf "\nFrontend: http://localhost:%s\n" "${FRONTEND_PORT}"
printf "Backend API: http://localhost:%s\n" "${BACKEND_PORT}"
