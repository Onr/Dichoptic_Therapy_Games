#!/usr/bin/env bash
set -euo pipefail

# Ensure gum is installed
if ! command -v gum >/dev/null 2>&1; then
  echo "gum is required but not installed."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y gum
  elif command -v brew >/dev/null 2>&1; then
    brew install gum
  else
    echo "Please install gum manually: https://github.com/charmbracelet/gum"
    exit 1
  fi
fi

gum style --border normal --margin "1 2" --padding "1 4" --border-foreground 212 --foreground 212 "Dichoptic Therapy Games Setup"

PORT=$(gum input --placeholder "Port for server (default 8080)")
PORT=${PORT:-8080}

echo "PORT=$PORT" > .env
gum style "Port set to $PORT and saved to .env"

if gum confirm "Install Node dependencies with npm?"; then
  gum spin --spinner dot --title "Installing dependencies" -- npm install
fi

if gum confirm "Run tests with npm test?"; then
  gum spin --spinner dot --title "Running tests" -- npm test
fi

if gum confirm "Run npm audit health check?"; then
  gum spin --spinner dot --title "Running npm audit" -- sh -c 'npm audit || true'
fi

if gum confirm "Write machine info to machine_info.txt?"; then
  {
    echo "Date: $(date)"
    echo "OS: $(uname -a)"
    echo "Node: $(node -v)"
    echo "npm: $(npm -v)"
    echo "Git commit: $(git rev-parse --short HEAD 2>/dev/null || echo N/A)"
  } > machine_info.txt
  gum style "Saved machine info to machine_info.txt"
fi

gum style --foreground 42 --bold "Setup complete."
