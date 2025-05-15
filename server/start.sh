#!/bin/bash

set -e

python3 manage.py migrate

# exec gunicorn summarizer.wsgi:application --bind 0.0.0.0:8000
exec gunicorn summarizer.wsgi:application --worker-class gevent --workers 4 --bind 0.0.0.0:8000
