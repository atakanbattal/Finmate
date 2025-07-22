#!/bin/bash

# FinMate Deployment Script
echo "🚀 Starting FinMate deployment..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "🌐 Deployment Options:"
    echo "1. Netlify: Drag and drop the 'dist' folder to https://app.netlify.com/drop"
    echo "2. Vercel: Run 'npx vercel --prod' and follow prompts"
    echo "3. GitHub Pages: Push to GitHub and enable Pages"
    echo ""
    echo "📋 Your app is ready for deployment!"
    echo "🔑 Don't forget to set your environment variables on the hosting platform:"
    echo "   - REACT_APP_FINNHUB_API_KEY=d1vmvu9r01qqgeemevpgd1vmvu9r01qqgeemevq0"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
