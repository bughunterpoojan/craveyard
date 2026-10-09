#!/usr/bin/env bash
# Exit immediately on failure
set -o errexit

echo "==> Installing dependencies..."
if command -v uv &> /dev/null; then
    echo "Using uv package installer..."
    uv pip install --system -r requirements.txt
else
    echo "Using standard pip..."
    python -m pip install --upgrade pip
    pip install -r requirements.txt
fi

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Build complete successfully!"
