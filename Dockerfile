FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

WORKDIR /app

# Install system dependencies, Python for g4f, curl, unzip, and rclone
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    unzip \
    ca-certificates \
    git \
    && curl -fsSL https://rclone.org/install.sh | bash \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definition and pre-install runtime packages
COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy public engine assets
COPY agents/Sanitizer.ts /app/agents/Sanitizer.ts
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
