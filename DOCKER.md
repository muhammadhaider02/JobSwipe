# 🐳 Docker Setup for JobSwipe

This project includes a comprehensive Docker setup for both development and production environments.

## 🚀 Quick Start

### Development Environment

Start all services in development mode:

```bash
pnpm docker:dev:up
```

Stop all services:

```bash
pnpm docker:dev:down
```

### Production Environment

Start all services in production mode:

```bash
pnpm docker:prod:up
```

Stop all services:

```bash
pnpm docker:prod:down
```

## 📋 Available Commands

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `pnpm docker:dev:up`    | Start development containers           |
| `pnpm docker:dev:down`  | Stop development containers            |
| `pnpm docker:dev:logs`  | View development logs                  |
| `pnpm docker:prod:up`   | Start production containers (detached) |
| `pnpm docker:prod:down` | Stop production containers             |
| `pnpm docker:prod:logs` | View production logs                   |
| `pnpm docker:clean`     | Clean up Docker system and volumes     |

## 🏗️ Architecture

### Development Setup

- **Hot reload** for all apps
- **Volume mounts** for live code changes
- **PostgreSQL** database on port 5432
- **Redis** cache on port 6379
- **Web** app on port 3000
- **API** service on port 3002
- **Docs** app on port 3001

### Production Setup

- **Multi-stage builds** for optimized images
- **Nginx reverse proxy** for load balancing
- **Health checks** for all services
- **Restart policies** for reliability
- **SSL ready** configuration

## 🔧 Services

### Web App (Next.js)

- **Development**: Hot reload with volume mounts
- **Production**: Standalone output with optimized build
- **Port**: 3000
- **Health check**: `/api/health`

### API Service (NestJS)

- **Development**: Watch mode with nodemon
- **Production**: Compiled and optimized
- **Port**: 3002
- **Health check**: `/health`

### Docs App (Next.js)

- **Development**: Hot reload with volume mounts
- **Production**: Standalone output
- **Port**: 3001
- **Health check**: `/api/health`

### Reverse Proxy (Nginx) - Production Only

- **Port**: 80 (HTTP), 443 (HTTPS)
- **Load balancing** across services
- **SSL termination** ready

## 🌍 Environment Variables

### Development (.env.dev)

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Production (.env.prod)

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
JWT_SECRET=your_jwt_secret
POSTGRES_PASSWORD=your_secure_password
```

## 📁 Docker Files Structure

```
JobSwipe/
├── docker-compose.dev.yml      # Development orchestration
├── docker-compose.prod.yml     # Production orchestration
├── nginx.conf                  # Nginx configuration
├── .dockerignore              # Docker ignore rules
├── .env.example               # Environment template
└── apps/
    ├── web/
    │   ├── Dockerfile         # Production build
    │   └── Dockerfile.dev     # Development build
    ├── api/
    │   ├── Dockerfile         # Production build
    │   └── Dockerfile.dev     # Development build
    └── docs/
        ├── Dockerfile         # Production build
        └── Dockerfile.dev     # Development build
```

## 🔍 Monitoring & Logs

### View logs for all services

```bash
# Development
pnpm docker:dev:logs

# Production
pnpm docker:prod:logs
```

### View logs for specific service

```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f web
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f docs

# Production
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f docs
```

### Health Checks

All production services include health checks:

- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

## 🚀 Deployment

### Local Development

1. Copy environment variables:

   ```bash
   cp .env.example .env.dev
   ```

2. Start development environment:

   ```bash
   pnpm docker:dev:up
   ```

3. Access services:
   - Web: http://localhost:3000
   - API: http://localhost:3002
   - Docs: http://localhost:3001
   - Database: localhost:5432
   - Redis: localhost:6379

### Production Deployment

1. Set up environment variables:

   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. Start production environment:

   ```bash
   pnpm docker:prod:up
   ```

3. Access via Nginx:
   - Web: http://localhost
   - API: http://api.localhost
   - Docs: http://docs.localhost

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```bash
   # Check what's using the port
   lsof -i :3000

   # Kill the process
   kill -9 <PID>
   ```

2. **Volume permissions**:

   ```bash
   # Fix node_modules permissions
   docker-compose -f docker-compose.dev.yml exec web chown -R node:node node_modules
   ```

3. **Database connection issues**:

   ```bash
   # Reset database
   docker-compose -f docker-compose.dev.yml down -v
   pnpm docker:dev:up
   ```

4. **Clean slate restart**:
   ```bash
   # Clean everything
   pnpm docker:clean
   pnpm docker:dev:up
   ```

### Performance Tips

1. **Use BuildKit** for faster builds:

   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

2. **Prune regularly**:

   ```bash
   pnpm docker:clean
   ```

3. **Use .dockerignore** to reduce context size

## 🔐 Security

### Production Security

- Change default passwords
- Use secrets management
- Enable SSL/TLS
- Implement proper firewall rules
- Regular security updates

### Environment Variables

- Never commit `.env` files
- Use Docker secrets in production
- Rotate credentials regularly

## 📊 Monitoring

### Health Checks

All services include health endpoints:

- Web: `GET /api/health`
- API: `GET /health`
- Docs: `GET /api/health`

### Resource Usage

```bash
# Monitor resource usage
docker stats

# View system info
docker system df
```

Happy Dockerizing! 🐳
