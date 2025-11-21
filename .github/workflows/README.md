# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for the Himo project's CI/CD pipeline.

## Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint

- Runs ESLint on all TypeScript/JavaScript files
- Ensures code style consistency

#### Type Check

- Runs TypeScript compiler in check mode
- Validates type safety across the monorepo

#### Build

- Builds all packages (api, client, bot, commons)
- Uploads build artifacts for later use
- Artifacts retained for 7 days

#### Test

- Sets up PostgreSQL with PostGIS extension
- Runs test suite (currently configured to skip if not set up)
- Uses test database for isolation

#### Docker Build

- Builds Docker images for all services (api, client, bot)
- Uses matrix strategy for parallel builds
- Implements Docker layer caching for faster builds

### 2. CD Workflow (`cd.yml`)

**Triggers:**

- Push to `main` branch
- Version tags (e.g., `v1.0.0`)
- Manual workflow dispatch with environment selection

**Jobs:**

#### Deploy

- Builds production Docker images
- Pushes images to Docker registry
- Includes deployment step (requires configuration)
- Environment-specific deployments (staging/production)

#### Notify

- Sends deployment status notifications
- Runs regardless of deployment success/failure

**Required Secrets:**

- `DOCKER_REGISTRY`: Your Docker registry URL
- `DOCKER_USERNAME`: Docker registry username
- `DOCKER_PASSWORD`: Docker registry password/token
- Additional secrets for your deployment method

### 3. Code Quality Workflow (`code-quality.yml`)

**Triggers:**

- Pull requests to `main` or `develop` branches

**Jobs:**

#### Prettier

- Checks code formatting consistency
- Validates all `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` files

#### Complexity

- Placeholder for code complexity analysis
- Ready to integrate tools like SonarQube

#### Size Check

- Analyzes client bundle size
- Reports total bundle size
- Can enforce size limits

### 4. Security Workflow (`security.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Mondays at 9 AM)

**Jobs:**

#### Dependency Audit

- Runs `pnpm audit` to check for vulnerable dependencies
- Generates audit reports
- Uploads reports as artifacts (30-day retention)

#### CodeQL Analysis

- Performs static code analysis
- Detects security vulnerabilities
- Uploads results to GitHub Security tab

#### Secret Scan

- Scans for accidentally committed secrets
- Uses TruffleHog for detection
- Checks entire git history

#### Docker Scan

- Scans Docker images for vulnerabilities
- Uses Trivy scanner
- Uploads results to GitHub Security tab

## Dependabot Configuration

The `dependabot.yml` file configures automatic dependency updates:

- **NPM Packages**: Monitors all workspace packages (root, api, client, bot, commons)
- **GitHub Actions**: Keeps workflow actions up to date
- **Docker**: Updates base images in Dockerfiles
- **Schedule**: Weekly updates on Mondays at 9 AM
- **Pull Request Limits**:
  - 5 PRs max for NPM dependencies
  - 3 PRs max for GitHub Actions and Docker

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your repository settings and add the following secrets:

#### Required for CD Workflow:

```
DOCKER_REGISTRY=your-registry.example.com
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password-or-token
```

#### Optional (based on deployment method):

```
SSH_HOST=your-server.example.com
SSH_USERNAME=deploy-user
SSH_PRIVATE_KEY=<your-private-key>
```

### 2. Configure GitHub Environments

Create environments for deployment:

1. Go to Settings → Environments
2. Create `staging` and `production` environments
3. Configure protection rules:
   - Required reviewers for production
   - Branch restrictions
   - Environment secrets

### 3. Update Dependabot Reviewers

Edit `.github/dependabot.yml` and replace `cycha` with your GitHub username:

```yaml
reviewers:
  - 'your-github-username'
```

### 4. Configure Deployment

Update the deployment step in `cd.yml` based on your infrastructure:

#### For SSH Deployment:

Uncomment the SSH deployment example and configure it.

#### For Kubernetes:

Uncomment the Kubernetes deployment example and add manifests.

#### For Cloud Providers:

Add appropriate deployment actions for AWS, GCP, Azure, etc.

## Testing the Pipeline

### Test CI Workflow:

```bash
# Create a feature branch
git checkout -b test-ci

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: CI pipeline"
git push origin test-ci

# Create a pull request and watch the CI run
```

### Test CD Workflow:

```bash
# Manual trigger via GitHub UI:
# 1. Go to Actions tab
# 2. Select "CD" workflow
# 3. Click "Run workflow"
# 4. Select environment and confirm
```

## Monitoring and Debugging

### View Workflow Runs

- Go to the **Actions** tab in your repository
- Click on a workflow run to see details
- Expand job steps to view logs

### Security Reports

- Go to **Security** tab
- Check **Code scanning alerts** for CodeQL results
- Check **Dependabot alerts** for dependency issues

### Artifacts

- Build artifacts are available for 7 days
- Security audit reports are available for 30 days
- Download from the workflow run page

## Optimization Tips

### 1. Cache Optimization

The workflows use pnpm store caching to speed up dependency installation. Cache is invalidated when `pnpm-lock.yaml` changes.

### 2. Parallel Jobs

Jobs run in parallel when possible to reduce total pipeline time:

- Lint, Type Check, Build, and Test run concurrently
- Docker builds use matrix strategy for parallel execution

### 3. Conditional Execution

Some jobs are conditional:

- Docker scan only runs on push (not PRs)
- Secret scan checks the diff between base and head
- Deployment only runs for specific events

## Troubleshooting

### Common Issues

#### 1. pnpm Cache Miss

If you see slow dependency installation:

- Check that `pnpm-lock.yaml` is committed
- Verify cache key in workflow file

#### 2. Docker Build Failures

If Docker builds fail:

- Check Dockerfile syntax
- Verify all required files are included in build context
- Review Docker build logs for specific errors

#### 3. Test Failures

If tests fail:

- Ensure PostgreSQL service is running
- Check DATABASE_URL environment variable
- Verify test database schema is up to date

#### 4. Deployment Issues

If deployment fails:

- Verify all required secrets are configured
- Check deployment logs for specific errors
- Ensure target environment is accessible

## Future Enhancements

- [ ] Add E2E testing with Playwright
- [ ] Implement automatic rollback on deployment failure
- [ ] Add performance testing
- [ ] Configure SonarQube for code quality metrics
- [ ] Add release automation
- [ ] Implement canary deployments
- [ ] Add notification integrations (Slack, Discord, etc.)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
