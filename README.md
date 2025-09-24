# JobSwipe

A modern full-stack application built with Next.js, NestJS, and TypeScript.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v22.19.0 (managed via nvm)
- **pnpm**: v9.0.0+
- **Docker**: Latest stable version (optional, for containerized development)

### Initial Setup & Migration

Follow these steps to set up the project after cloning or when migrating to Node.js 22.19.0:

#### 1. Node.js Version Setup

```bash
# Install and use Node.js 22.19.0 via nvm
nvm install 22.19.0
nvm use 22.19.0

# Verify the version
node --version  # Should output v22.19.0
```

#### 2. Install Dependencies

**Root Level:**

```bash
# Install root dependencies
pnpm install --frozen-lockfile
```

**All Services:**

```bash
# Install dependencies for all services in the workspace
pnpm install --recursive --frozen-lockfile

# Or install for specific services
cd apps/api && pnpm install --frozen-lockfile
cd apps/web && pnpm install --frozen-lockfile
```

#### 3. Verify Installation

```bash
# Check all workspace dependencies
pnpm ls --depth=0

# Run type checking across all services
pnpm check-types

# Run linting across all services
pnpm lint

# Build all applications
pnpm build
```

## 🏗️ Project Structure

```
JobSwipe/
├── apps/
│   ├── api/          # NestJS API server
│   └── web/          # Next.js web application
├── packages/
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── .github/
│   └── workflows/    # CI/CD workflows
└── docker-compose.*.yml # Docker configurations
```

## 🔄 Development Workflow

### Branch Strategy

We follow a **feature branch workflow** with the following branch hierarchy:

- `prod` - Production branch (protected)
- `staging` - Staging branch (protected)
- `feature/*` - Feature branches

### Development Process

#### 1. Create Feature Branch

```bash
# Always create feature branches from staging
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

#### 2. Development

Start the development servers:

```bash
# Start all services in development mode
pnpm dev

# Or start individual services
cd apps/api && pnpm dev    # API server on port 3002
cd apps/web && pnpm dev    # Web app on port 3000
```

#### 3. Pre-Commit Checks

Before committing, ensure your code passes all checks:

```bash
# Run the complete validation pipeline
pnpm lint          # ESLint checks
pnpm check-types   # TypeScript type checking
pnpm build         # Build all applications
pnpm test          # Run test suites (when available)

# Format code (optional, but recommended)
pnpm format
```

#### 4. Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples of good commit messages
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve API response caching issue"
git commit -m "docs: update development setup instructions"
git commit -m "refactor: optimize database queries in user service"
```

#### 5. Create Pull Request

```bash
# Push your feature branch
git push origin feature/your-feature-name
```

Then create a PR from your feature branch to `staging`:

- **Title**: Clear, descriptive title
- **Description**: What changes were made and why
- **Checklist**: Ensure all items are checked:
  - [ ] Code follows project conventions
  - [ ] All tests pass locally
  - [ ] Lint and type checks pass
  - [ ] Build succeeds
  - [ ] Documentation updated (if needed)

### CI/CD Pipeline

Our CI/CD pipeline automatically runs on:

- **Push to feature branches**: Runs basic CI checks
- **Pull requests to staging/prod**: Runs full validation suite

#### CI Jobs

1. **Lint & Format**: Code quality checks
2. **Type Check**: TypeScript validation
3. **Build**: Compilation verification
4. **Test**: Test suite execution
5. **Security**: Dependency vulnerability scanning
6. **Bundle Analysis**: Build size analysis

#### PR Requirements

All PRs must pass:

- ✅ Linting and formatting
- ✅ Type checking
- ✅ Build process
- ✅ Security audit
- ✅ Commit message validation

## 📜 Available Scripts

### Root Level Scripts

```bash
pnpm dev              # Start all services in development mode
pnpm build            # Build all applications
pnpm lint             # Run ESLint across all packages
pnpm lint:fix         # Fix auto-fixable ESLint issues
pnpm check-types      # Run TypeScript checks across all packages
pnpm test             # Run test suites across all packages
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

### Docker Scripts

```bash
# Development environment
pnpm docker:dev:up    # Start development containers
pnpm docker:dev:down  # Stop development containers
pnpm docker:dev:logs  # View development logs

# Production environment
pnpm docker:prod:up   # Start production containers
pnpm docker:prod:down # Stop production containers
pnpm docker:prod:logs # View production logs

# Maintenance
pnpm docker:clean     # Clean up Docker resources
```

## 🛠️ Service-Specific Commands

### API Service (`apps/api`)

```bash
cd apps/api

# Development
pnpm dev              # Start with hot reload
pnpm start:debug      # Start with debugging enabled

# Production
pnpm start:prod       # Start in production mode

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio

# Testing & Quality
pnpm test             # Run tests
pnpm test:cov         # Run tests with coverage
pnpm lint             # Run ESLint
pnpm check-types      # TypeScript check
```

### Web Application (`apps/web`)

```bash
cd apps/web

# Development
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Generation
pnpm codegen          # Generate API client from OpenAPI spec

# Testing & Quality
pnpm lint             # Run ESLint
pnpm check-types      # TypeScript check
```

## 🚨 Troubleshooting

### Common Issues

#### Node.js Version Mismatch

```bash
# Ensure you're using the correct Node.js version
nvm use 22.19.0
node --version  # Should be v22.19.0
```

#### Dependency Issues

```bash
# Clear all caches and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install --frozen-lockfile
```

#### Build Failures

```bash
# Clean build artifacts and rebuild
pnpm clean  # If available
pnpm build
```

### Getting Help

1. Check existing issues in the repository
2. Run the troubleshooting commands above
3. Ensure all dependencies are correctly installed
4. Verify Node.js version matches requirements

## 🤝 Contributing

1. Follow the development workflow outlined above
2. Ensure all CI checks pass
3. Write clear, descriptive commit messages
4. Update documentation when necessary
5. Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
