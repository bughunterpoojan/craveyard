#!/usr/bin/env bash
# Exit immediately on failure
set -o errexit

echo "==> Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Build complete successfully!"
