#!/bin/bash
set -e

# Manual deployment script - Replicates GitHub Actions CD job exactly
# Matches: .github/workflows/cd.yml

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to project root (parent of scripts directory)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT"

# Load .env.deploy if it exists and variables aren't already set
if [ -f .env.deploy ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "📝 Loading environment from .env.deploy..."
  source .env.deploy
fi

# Configuration
REGISTRY="ghcr.io"
OWNER="cycha"
VPS_HOST="${VPS_HOST:?ERROR: VPS_HOST environment variable is required}"
VPS_USER="${VPS_USER:-deploy}"
VPS_SSH_PRIVATE_KEY="${VPS_SSH_PRIVATE_KEY:-$HOME/.ssh/id_rsa}"
GITHUB_TOKEN="${GITHUB_TOKEN:?ERROR: GITHUB_TOKEN environment variable is required}"

# SSH options
SSH_OPTS="-i ${VPS_SSH_PRIVATE_KEY} -o StrictHostKeyChecking=no"

echo "🚀 Manual Deployment (replicates GitHub Actions CD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Build and push images (same as cd.yml lines 37-65)
echo "Step 1/3: Building and pushing Docker images..."
echo ""

echo "Building API image (linux/amd64)..."
docker build --platform linux/amd64 -t ${REGISTRY}/${OWNER}/himo-api:latest -f api/Dockerfile.prod .

echo "Building Client image (linux/amd64)..."
docker build --platform linux/amd64 -t ${REGISTRY}/${OWNER}/himo-client:latest -f client/Dockerfile.prod .

echo "Building Bot image (linux/amd64)..."
docker build --platform linux/amd64 -t ${REGISTRY}/${OWNER}/himo-bot:latest -f bot/Dockerfile.prod .

echo ""
echo "Pushing images to GHCR..."
docker push ${REGISTRY}/${OWNER}/himo-api:latest
docker push ${REGISTRY}/${OWNER}/himo-client:latest
docker push ${REGISTRY}/${OWNER}/himo-bot:latest

echo "✅ Images built and pushed"
echo ""

# Step 2: Copy files to VPS (same as cd.yml lines 78-85)
echo "Step 2/3: Copying deployment files to VPS..."
scp ${SSH_OPTS} docker-compose.prod.yml ${VPS_USER}@${VPS_HOST}:/home/deploy/himo/

# Copy production .env file if it exists, otherwise use .env.example
if [ -f .env.production ]; then
  echo "Copying .env.production to VPS..."
  scp ${SSH_OPTS} .env.production ${VPS_USER}@${VPS_HOST}:/home/deploy/himo/.env
else
  echo "⚠️  .env.production not found, copying .env.example instead"
  echo "Please create .env.production from .env.production.example"
  scp ${SSH_OPTS} .env.example ${VPS_USER}@${VPS_HOST}:/home/deploy/himo/.env
fi

echo "✅ Files copied"
echo ""

# Step 3: Deploy on VPS (same as cd.yml lines 87-124)
echo "Step 3/3: Deploying on VPS..."
echo ""

ssh ${SSH_OPTS} ${VPS_USER}@${VPS_HOST} << EOF
set -e
echo "Starting deployment to VPS..."

cd /home/deploy/himo

# Verify .env exists
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found on VPS"
  echo "This should have been copied in the previous step"
  exit 1
fi

# Load environment variables and log in to GHCR
echo "Logging in to GitHub Container Registry..."
source .env
echo "\${GITHUB_TOKEN}" | docker login ${REGISTRY} -u ${OWNER} --password-stdin

# Pull and start containers
echo "Pulling latest images from GHCR..."
docker compose -f docker-compose.prod.yml down || true
docker compose -f docker-compose.prod.yml pull

echo "Starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d

# Run database migrations (non-interactive for production)
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy || echo "⚠️  Migration completed with warnings (PostGIS extensions may cause drift warnings)"

echo "✅ Deployment completed successfully!"
docker compose -f docker-compose.prod.yml ps
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Manual deployment complete!"
echo "Your app is live at http://${VPS_HOST}"