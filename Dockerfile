##########  builder stage  ##########
FROM node:20-bookworm AS builder

# Set memory limits and security flags
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium

# Install system dependencies including Chrome/Chromium
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      wget \
      gnupg \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libcups2 \
      libdrm2 \
      libgbm1 \
      libgtk-3-0 \
      libnss3 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxss1 \
      libxtst6 \
      xdg-utils \
      chromium \
      chromium-driver && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy source code and build
COPY . .
RUN npm run build

##########  runtime stage  ##########
FROM node:20-bookworm-slim AS runtime

# Install runtime dependencies for Chrome/Chromium
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libcups2 \
      libdrm2 \
      libgbm1 \
      libgtk-3-0 \
      libnss3 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxss1 \
      libxtst6 \
      xdg-utils \
      chromium \
      chromium-driver && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_FLAGS="--headless --disable-gpu --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-extensions --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding"

# Copy built application
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "server.js"]
