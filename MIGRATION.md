# Node.js 22.19.0 Migration Checklist

## ✅ Migration Tasks Completed

### System-wide Updates

- [x] Updated `.nvmrc` to specify Node.js 22.19.0
- [x] Updated Docker files (`Dockerfile.dev`, `Dockerfile.prod`) to use `node:22.19.0-alpine`
- [x] Updated root `package.json` engines to require `>=22.19.0`
- [x] Updated `apps/web/package.json` to use `@types/node": "^22"`
- [x] Updated CI/CD workflows (`.github/workflows/ci.yml`, `.github/workflows/pr-validation.yml`)
- [x] Enhanced `.npmrc` with performance and security configurations
- [x] Created comprehensive README with migration and workflow instructions

### Verification Completed

- [x] Node.js 22.19.0 installed and activated via nvm
- [x] All dependencies compatible (no conflicts detected)
- [x] pnpm 9.0.0 works with Node.js 22.19.0
- [x] No security vulnerabilities found
- [x] All workspace packages install successfully

## 🚀 For Team Members - Migration Steps

### 1. Update Node.js Version

```bash
# Install and switch to Node.js 22.19.0
nvm install 22.19.0
nvm use 22.19.0

# Verify version
node --version  # Should output v22.19.0
```

### 2. Clean and Reinstall Dependencies

```bash
# Clean existing installations
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstall all dependencies
pnpm install --frozen-lockfile
```

### 3. Verify Everything Works

```bash
# Run the complete validation pipeline
pnpm lint          # Should pass
pnpm check-types   # Should pass
pnpm build         # Should pass
```

### 4. Test Development Environment

```bash
# Start development servers
pnpm dev

# Verify services start correctly:
# - Web App: http://localhost:3000
# - API: http://localhost:3002
```

## ⚠️ Important Notes

- **Docker Users**: Rebuild containers after pulling changes

  ```bash
  pnpm docker:dev:down
  pnpm docker:dev:up
  ```

- **CI/CD**: All workflows now use Node.js 22.19.0
- **New Team Members**: Follow the setup instructions in README.md

## 🆘 Troubleshooting

If you encounter issues:

1. **Node version mismatch**: Run `nvm use 22.19.0`
2. **Dependency issues**: Clear node_modules and reinstall
3. **Build failures**: Check the troubleshooting section in README.md
4. **Docker issues**: Rebuild containers from scratch

## 📝 What Changed

- **Node.js**: 20.12.2 → 22.19.0
- **Workflows**: Updated to use Node.js 22.19.0
- **Docker**: Updated base images
- **Dependencies**: All verified compatible
- **Configuration**: Enhanced .npmrc for better performance
