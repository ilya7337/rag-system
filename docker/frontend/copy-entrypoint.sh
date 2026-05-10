#!/usr/bin/env sh
set -eu

# Copy build artifacts into the backend static directory.
# Assumes /frontend-out is mounted to /src/static
cp -R /frontend-out/. /src/static/

