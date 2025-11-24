#!/bin/bash

# TorqueNinja Production Build Script for cPanel Deployment
# Target: cms.torquesticker.com

echo "🚀 Building TorqueNinja for Production (cms.torquesticker.com)"
echo "================================================================"

# Step 1: Clean previous builds
echo ""
echo "📁 Cleaning previous builds..."
rm -rf dist
rm -f torqueninja-production.zip

# Step 2: Copy production environment
echo ""
echo "⚙️  Setting up production environment..."
cp deployments/cpanel/.env.production .env

# Step 3: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 4: Run production build
echo ""
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Step 5: Copy deployment files to dist
echo ""
echo "📋 Copying deployment files..."
cp deployments/cpanel/.htaccess dist/.htaccess
cp public/logo.png dist/logo.png 2>/dev/null || echo "⚠️  logo.png not found, skipping..."
cp public/favicon.ico dist/favicon.ico 2>/dev/null || echo "⚠️  favicon.ico not found, skipping..."

# Step 6: Create deployment ZIP
echo ""
echo "📦 Creating deployment package..."
cd dist

# Create ZIP with all files (not the dist folder itself)
if command -v zip &> /dev/null; then
    zip -r ../torqueninja-production.zip * .*htaccess
    cd ..
    echo "✅ ZIP created using zip command"
elif command -v tar &> /dev/null; then
    tar -czf ../torqueninja-production.tar.gz *
    cd ..
    mv torqueninja-production.tar.gz torqueninja-production.zip
    echo "✅ Archive created using tar command"
else
    cd ..
    echo "⚠️  No zip or tar command found. Please manually compress the dist folder contents."
    echo "   Make sure to compress the FILES inside dist/, not the dist folder itself!"
fi

# Step 7: Verify package
echo ""
echo "🔍 Verifying package contents..."
if [ -f "torqueninja-production.zip" ]; then
    SIZE=$(du -h torqueninja-production.zip | cut -f1)
    echo "   Package size: $SIZE"
    echo "   Location: $(pwd)/torqueninja-production.zip"
fi

# Step 8: Show deployment checklist
echo ""
echo "================================================================"
echo "✅ Production build complete!"
echo "================================================================"
echo ""
echo "📦 Deployment Package: torqueninja-production.zip"
echo "🌐 Target Domain: cms.torquesticker.com"
echo "📂 cPanel Upload Path: /public_html/cms/"
echo ""
echo "Next Steps:"
echo "1. Login to your cPanel"
echo "2. Go to File Manager → /public_html/cms/"
echo "3. Backup existing files (if any)"
echo "4. Upload torqueninja-production.zip"
echo "5. Extract the ZIP file"
echo "6. Set permissions (755 for folders, 644 for files)"
echo "7. Visit https://cms.torquesticker.com to test"
echo ""
echo "📖 Full guide: deployments/cpanel/DEPLOYMENT-GUIDE.md"
echo "🔒 Security fixes: SECURITY-FIXES.md"
echo ""
