#!/usr/bin/env bash
set -e

echo "=========================================="
echo "[WEBENGINE] Booting Headless Execution Node"
echo "=========================================="

# 1. Initialize Rclone configuration if provided via environment
if [ -n "$RCLONE_CONFIG_DATA" ]; then
    echo "[WEBENGINE] Initializing cloud sync layer..."
    mkdir -p ~/.config/rclone
    echo "$RCLONE_CONFIG_DATA" > ~/.config/rclone/rclone.conf
    chmod 600 ~/.config/rclone/rclone.conf
fi

WORKSPACE_DIR="/app/payload"
mkdir -p "$WORKSPACE_DIR"

# 2. Synchronize private payload from Google Drive (or remote storage)
GDRIVE_PATH="${GDRIVE_REMOTE_PATH:-gdrive:pmu-engine}"
if command -v rclone &> /dev/null && [ -f ~/.config/rclone/rclone.conf ]; then
    echo "[WEBENGINE] Synchronizing project payload from ${GDRIVE_PATH}..."
    rclone copy "$GDRIVE_PATH" "$WORKSPACE_DIR" --drive-acknowledge-abuse -v || true
fi

# 3. Enter execution workspace
if [ -d "$WORKSPACE_DIR" ] && [ -f "$WORKSPACE_DIR/worker.ts" ]; then
    cd "$WORKSPACE_DIR"
else
    cd /app
fi

if [ -f "package.json" ]; then
    echo "[WEBENGINE] Verifying node dependencies..."
    npm install --prefer-offline --no-audit || true
fi

# Ensure Playwright browser binaries are ready
npx playwright install chromium --with-deps || true

# 4. Launch automation engine
if [ -f "worker.ts" ]; then
    echo "[WEBENGINE] Launching worker node..."
    npx tsx worker.ts
    EXIT_CODE=$?
else
    echo "[WEBENGINE ERROR] worker.ts not found! Please check cloud sync path."
    EXIT_CODE=1
fi

# 5. Synchronize output state back to cloud storage
if command -v rclone &> /dev/null && [ -f ~/.config/rclone/rclone.conf ]; then
    echo "[WEBENGINE] Synchronizing state back to ${GDRIVE_PATH}..."
    rclone copy "$WORKSPACE_DIR" "$GDRIVE_PATH" \
        --exclude "node_modules/**" \
        --exclude ".git/**" \
        --drive-acknowledge-abuse || true
fi

echo "[WEBENGINE] Run finished with exit code $EXIT_CODE."
exit $EXIT_CODE
