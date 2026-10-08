#!/usr/bin/env bash
# Launch the whole BoxTrack stack (backend API + frontend) with one command.
# Ctrl+C stops both.

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

[ -d node_modules ] || (echo "Installing frontend deps..." && npm install)
[ -d backend/node_modules ] || (echo "Installing backend deps..." && npm --prefix backend install)
[ -f backend/.env ] || cp backend/.env.example backend/.env

cleanup() {
  echo
  echo "Stopping BoxTrack..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

npm --prefix backend run dev &
BACKEND_PID=$!

npm run dev &
FRONTEND_PID=$!

echo "BoxTrack API   -> http://localhost:${PORT:-3000}"
echo "BoxTrack front -> http://localhost:5173"
echo "(Ctrl+C to stop both)"

wait "$BACKEND_PID" "$FRONTEND_PID"
