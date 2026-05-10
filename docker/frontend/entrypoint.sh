#!/usr/bin/env sh
set -eu

# Copy built assets into the mounted backend static directory
cp -R /frontend-out/. /src/static/


