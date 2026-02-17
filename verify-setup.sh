#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 AI Content Studio - Setup Verification"
echo "=========================================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js NOT found. Install from https://nodejs.org"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm NOT found"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python3 installed: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python NOT found. Install from https://python.org"
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓${NC} Git installed: $GIT_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Git NOT found (optional). Install from https://git-scm.com"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} Docker installed: $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker NOT found (optional). Install from https://docker.com"
fi

echo ""
echo "=========================================="
echo "📂 Project Structure:"
echo "=========================================="

# Check project folders
if [ -d "frontend" ]; then
    echo -e "${GREEN}✓${NC} frontend/ folder exists"
else
    echo -e "${RED}✗${NC} frontend/ folder missing"
fi

if [ -d "backend" ]; then
    echo -e "${GREEN}✓${NC} backend/ folder exists"
else
    echo -e "${RED}✗${NC} backend/ folder missing"
fi

if [ -d "ml-models" ]; then
    echo -e "${GREEN}✓${NC} ml-models/ folder exists"
else
    echo -e "${RED}✗${NC} ml-models/ folder missing"
fi

echo ""
echo "=========================================="
echo "🚀 Next Steps:"
echo "=========================================="
echo "1. Open 3 terminal windows"
echo ""
echo "Terminal 1 (Frontend):"
echo "  cd frontend && npm install && npm run dev"
echo ""
echo "Terminal 2 (Backend):"
echo "  cd backend && npm install && npm start"
echo ""
echo "Terminal 3 (Python ML):"
echo "  cd ml-models && python -m venv venv"
echo "  venv\\Scripts\\activate  (Windows)"
echo "  source venv/bin/activate  (Mac/Linux)"
echo "  pip install -r requirements.txt && python app.py"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "=========================================="
