#!/bin/bash

echo "🚀 FinMate GitHub'a push ediliyor..."

# GitHub repository URL'ini güncelleyin (repository oluşturduktan sonra)
GITHUB_USERNAME="atakanbattal"  # GitHub kullanıcı adınızı buraya yazın
REPO_NAME="FinMate"

echo "📡 GitHub remote güncelleniyor..."
git remote set-url origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "📤 GitHub'a push ediliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ GitHub'a push başarılı!"
    echo "🔗 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "🌐 Şimdi otomatik deployment için:"
    echo "1. Netlify: https://app.netlify.com/start"
    echo "2. Vercel: https://vercel.com/new"
    echo "3. Repository'yi seçin ve deploy edin!"
    echo ""
    echo "🔑 Environment Variable ekleyin:"
    echo "   REACT_APP_FINNHUB_API_KEY = d1vmvu9r01qqgeemevpgd1vmvu9r01qqgeemevq0"
else
    echo "❌ Push başarısız! GitHub repository'sini oluşturdunuz mu?"
fi
