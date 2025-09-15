# Docker Setup Guide

This project includes optimized Docker configurations for both development and production environments.

## Quick Start

### Development

```bash
# Build and run development environment
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f web

# Stop containers
docker-compose down
```

### Production

```bash
# Build production image
docker build -t gtm-site-speed:latest .

# Run production container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e CHROME_PATH=/usr/bin/chromium \
  gtm-site-speed:latest

# Or use docker-compose with production profile
docker-compose --profile production up web-prod
```

## Docker Files Overview

### `Dockerfile` (Production)

- **Multi-stage build** for optimized image size
- **Security**: Non-root user, minimal dependencies
- **Performance**: Standalone Next.js output, optimized Chrome flags
- **Monitoring**: Built-in health checks
- **Size**: ~500MB (vs 1GB+ with development dependencies)

### `Dockerfile.dev.chrome` (Development)

- **Hot reload**: Volume mounting for code changes
- **Full tooling**: All development dependencies included
- **Chrome/Chromium**: Automatic fallback if Google Chrome fails
- **Security**: Non-root user with proper permissions

### `docker-compose.yml`

- **Development service**: Hot reload, volume mounting
- **Production service**: Optimized for production (profile-based)
- **Networking**: Isolated network for services
- **Health checks**: Automatic container health monitoring

## Environment Variables

| Variable                           | Development                     | Production          | Description                        |
| ---------------------------------- | ------------------------------- | ------------------- | ---------------------------------- |
| `NODE_ENV`                         | `development`                   | `production`        | Node.js environment                |
| `CHROME_PATH`                      | `/usr/bin/google-chrome-stable` | `/usr/bin/chromium` | Chrome binary path                 |
| `CHROME_PATH_FALLBACK`             | `/usr/bin/chromium`             | -                   | Fallback Chrome path               |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true`                          | `true`              | Skip Puppeteer's Chrome download   |
| `WATCHPACK_POLLING`                | `true`                          | -                   | Enable file watching in containers |
| `CHOKIDAR_USEPOLLING`              | `true`                          | -                   | Enable polling for file changes    |

## Chrome Configuration

The containers are configured with optimal Chrome flags for headless operation:

- `--headless`: Run without GUI
- `--disable-gpu`: Disable GPU acceleration
- `--no-sandbox`: Required for Docker containers
- `--disable-setuid-sandbox`: Additional sandbox disabling
- `--disable-dev-shm-usage`: Use /tmp instead of /dev/shm
- `--disable-extensions`: Disable Chrome extensions
- `--disable-background-timer-throttling`: Prevent throttling
- `--disable-backgrounding-occluded-windows`: Keep background tabs active
- `--disable-renderer-backgrounding`: Prevent renderer backgrounding

## Troubleshooting

### Chrome/Chromium Issues

1. **Chrome fails to start**: Check if running in privileged mode or adjust security flags
2. **Memory issues**: Increase container memory limits
3. **Permission denied**: Ensure non-root user has proper permissions

### Development Issues

1. **Hot reload not working**: Ensure `WATCHPACK_POLLING=true` is set
2. **File changes not detected**: Check volume mounting and file permissions
3. **Build failures**: Clear Docker cache: `docker system prune -a`

### Production Issues

1. **Image too large**: Ensure multi-stage build is working correctly
2. **Slow startup**: Check health check configuration
3. **Memory leaks**: Monitor container memory usage

## Performance Optimization

### Image Size Reduction

- Multi-stage builds separate build and runtime dependencies
- Standalone Next.js output reduces runtime size
- Minimal base images (bookworm-slim for production)
- Efficient layer caching with proper COPY order

### Runtime Performance

- Non-root user for security without performance loss
- Optimized Chrome flags for headless operation
- Health checks for automatic recovery
- Proper memory limits and Node.js heap sizing

### Development Experience

- Hot reload with volume mounting
- Polling for cross-platform file watching
- Automatic dependency installation
- Comprehensive logging and debugging

## Security Features

### Container Security

- Non-root user execution
- Minimal runtime dependencies
- No unnecessary packages or tools
- Proper file permissions and ownership

### Chrome Security

- Sandboxing disabled safely for containers
- No extensions or plugins
- Isolated browser processes
- Secure defaults for headless operation

## Monitoring

### Health Checks

Both development and production containers include health checks:

- **Endpoint**: `http://localhost:3000/`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start period**: 5-10 seconds

### Logging

- Structured logging with request UUIDs
- Chrome process monitoring
- Performance metrics tracking
- Error handling and reporting

## Platform Compatibility

### Supported Architectures

- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (Apple Silicon, ARM64)

### Tested Environments

- Docker Desktop (macOS, Windows, Linux)
- Docker Engine (Linux servers)
- Cloud platforms (Google Cloud Run, AWS ECS, Azure Container Instances)
- Kubernetes clusters

## Best Practices

### Development

1. Use `docker-compose` for local development
2. Mount source code as volumes for hot reload
3. Use development Dockerfile for full tooling
4. Enable polling for file watching in containers

### Production

1. Use multi-stage builds for smaller images
2. Run as non-root user for security
3. Set proper resource limits
4. Use health checks for monitoring
5. Configure proper logging and monitoring

### CI/CD

1. Build production images in CI pipeline
2. Run security scans on images
3. Test containers before deployment
4. Use image tagging for version control

## Examples

### Local Development

```bash
# Start development environment
docker-compose up

# Run specific service
docker-compose up web

# Rebuild after dependency changes
docker-compose up --build

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec web npm run lint
```

### Production Deployment

```bash
# Build production image
docker build -t gtm-site-speed:v1.0.0 .

# Run with custom environment
docker run -d \
  --name gtm-site-speed \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  gtm-site-speed:v1.0.0

# Check container health
docker ps
docker logs gtm-site-speed
```

### Cloud Deployment

```bash
# Google Cloud Run
gcloud run deploy gtm-site-speed \
  --image gcr.io/PROJECT_ID/gtm-site-speed:latest \
  --platform managed \
  --memory 2Gi \
  --cpu 1 \
  --port 3000

# AWS ECS (Fargate)
# Use the provided Dockerfile with appropriate task definition

# Azure Container Instances
az container create \
  --resource-group myResourceGroup \
  --name gtm-site-speed \
  --image gtm-site-speed:latest \
  --cpu 1 \
  --memory 2 \
  --port 3000
```
