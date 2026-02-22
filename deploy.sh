#!/bin/bash
# deploy.sh
# A handy script to push everything to GitHub automatically,
# which triggers Vercel (frontend) and Render (backend) to automatically build and deploy.

# Navigate to the root directory
cd "$(dirname "$0")"

echo "======= 🚀 GHelper Auto-Deploy Script ======="

# Check for git unstaged/staged files
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Working directory clean, no new changes to publish."
else
  echo "📦 Adding new changes..."
  git add .
  
  echo "📝 Committing changes..."
  # Use the first argument as the commit message, or default to a timestamp
  COMMIT_MSG=${1:-"Auto-deploy update $(date +"%Y-%m-%d %H:%M:%S")"}
  git commit -m "$COMMIT_MSG"
  
  echo "☁️ Pushing to GitHub (which triggers Vercel/Render)..."
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo "🎉 Success! Code is pushed."
    echo "   - Frontend will deploy on Vercel"
    echo "   - Backend will deploy on Render"
  else
    echo "❌ Push failed. Please check your GitHub connection/authentication."
  fi
fi

echo "============================================="
