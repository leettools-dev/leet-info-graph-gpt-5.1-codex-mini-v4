#!/usr/bin/env bash
set -euo pipefail

<<<<<<< HEAD
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
}

load_env_file

if [[ -x "./stop.sh" ]]; then
  ./stop.sh >/dev/null 2>&1 || true
fi

mkdir -p logs pids

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${BACKEND_PORT}}"
=======
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/pids"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

mkdir -p "$LOG_DIR" "$PID_DIR"

if [[ -x "$ROOT_DIR/stop.sh" ]]; then
  "$ROOT_DIR/stop.sh" >/dev/null 2>&1 || true
fi
>>>>>>> dev#feature#research-infographic-studio

start_service() {
  local name=$1
  local cmd=$2
<<<<<<< HEAD
  local log_file="logs/${name}.log"

  nohup bash -c "$cmd" >>"$log_file" 2>&1 &
  local pid=$!
  echo "$pid" >"pids/${name}.pid"
  printf "Started %s (PID %s). Logs: %s\n" "$name" "$pid" "$log_file"
}

start_service "backend" "cd backend && uvicorn backend.app.main:app --host 0.0.0.0 --port ${BACKEND_PORT}"
start_service "frontend" "cd frontend && npm run dev -- --hostname 0.0.0.0 --port ${FRONTEND_PORT}"

printf "\nFrontend: http://localhost:%s\n" "${FRONTEND_PORT}"
printf "Backend API: http://localhost:%s\n" "${BACKEND_PORT}"
=======
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
>>>>>>> dev#feature#research-infographic-studio
