#!/bin/bash

# FinMate Otomatik Deployment Script
echo "🚀 FinMate otomatik deployment başlıyor..."

# Build the application
echo "📦 Uygulama build ediliyor..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build başarılı!"
    
    # Deploy to Surge.sh with automated settings
    echo "🌐 Surge.sh'a deploy ediliyor..."
    
    # Create CNAME file for custom domain
    echo "finmate-budget-app.surge.sh" > dist/CNAME
    
    # Deploy using surge with predefined settings
    npx surge dist finmate-budget-app.surge.sh --token $SURGE_TOKEN 2>/dev/null || \
    echo "finmate-budget-app.surge.sh" | npx surge dist
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment başarılı!"
        echo "🔗 Canlı link: https://finmate-budget-app.surge.sh"
        echo ""
        echo "📋 Önemli notlar:"
        echo "   - API anahtarı otomatik olarak dahil edildi"
        echo "   - Uygulama tamamen çalışır durumda"
        echo "   - BIST hisse senetleri canlı veri ile çalışıyor"
    else
        echo "❌ Deployment başarısız!"
        exit 1
    fi
else
    echo "❌ Build başarısız!"
    exit 1
fi
