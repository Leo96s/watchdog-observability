#!/bin/sh
set -e

max_attempts=15
attempt=0

until npm run db:migrate; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Migrations failed after ${max_attempts} attempts, giving up."
    exit 1
  fi
  echo "Migration attempt ${attempt} failed (database may still be starting up) - retrying in 10s..."
  sleep 10
done

exec npm start
