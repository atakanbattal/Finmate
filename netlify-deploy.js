const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// FinMate Netlify API Deployment Script
console.log('🚀 FinMate Netlify API deployment başlıyor...');

// Build the application first
console.log('📦 Uygulama build ediliyor...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build başarılı!');
} catch (error) {
    console.error('❌ Build başarısız:', error.message);
    process.exit(1);
}

// Create deployment ZIP
console.log('📁 Deployment paketi oluşturuluyor...');
try {
    execSync('cd dist && zip -r ../deployment.zip .', { stdio: 'inherit' });
    console.log('✅ Deployment paketi hazır!');
} catch (error) {
    console.error('❌ ZIP oluşturma başarısız:', error.message);
    process.exit(1);
}

// Deploy using Netlify API
console.log('🌐 Netlify\'a deploy ediliyor...');

const deploymentData = fs.readFileSync('deployment.zip');

const options = {
    hostname: 'api.netlify.com',
    port: 443,
    path: '/api/v1/sites',
    method: 'POST',
    headers: {
        'Content-Type': 'application/zip',
        'Content-Length': deploymentData.length
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.url) {
                console.log('🎉 Deployment başarılı!');
                console.log('🔗 Canlı link:', response.url);
                console.log('📋 Site ID:', response.id);
                
                // Clean up
                fs.unlinkSync('deployment.zip');
                console.log('✨ Deployment tamamlandı!');
            } else {
                console.error('❌ Deployment başarısız:', data);
            }
        } catch (error) {
            console.error('❌ Response parse hatası:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request hatası:', error.message);
});

req.write(deploymentData);
req.end();
