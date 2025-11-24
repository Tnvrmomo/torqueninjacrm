# Quick Deployment Guide - TorqueNinja to cPanel

**Target**: cms.torquesticker.com  
**Upload Path**: `/public_html/cms/`

## 🚀 Quick Start (3 Steps)

### Step 1: Build Production Package

**Mac/Linux:**
```bash
chmod +x build-production.sh
./build-production.sh
```

**Windows:**
```bash
build-production.bat
```

**Manual Build:**
```bash
# Copy production environment
cp deployments/cpanel/.env.production .env

# Install and build
npm install
npm run build

# Copy deployment files
cp deployments/cpanel/.htaccess dist/.htaccess

# Create ZIP (Mac/Linux)
cd dist && zip -r ../torqueninja-production.zip * .htaccess && cd ..

# Create ZIP (Windows PowerShell)
Compress-Archive -Path .\dist\* -DestinationPath .\torqueninja-production.zip -Force
```

### Step 2: Upload to cPanel

1. **Login** to cPanel at your hosting provider
2. **Navigate**: File Manager → `/public_html/cms/`
3. **Backup** existing files (if any):
   - Select all → Compress → Download
   - Then delete old files
4. **Upload**: Click Upload → Select `torqueninja-production.zip`
5. **Extract**: Right-click ZIP → Extract → `/public_html/cms/`
6. **Delete** the ZIP file after extraction
7. **Set Permissions**:
   - Select all files/folders
   - Change Permissions
   - Folders: `755`
   - Files: `644`
   - Check "Recurse into subdirectories"

### Step 3: Verify Deployment

Visit: **https://cms.torquesticker.com**

**Quick Test Checklist:**
- [ ] ✅ Page loads without errors
- [ ] ✅ HTTPS lock icon appears
- [ ] ✅ Can navigate to /login
- [ ] ✅ Can login with test account
- [ ] ✅ Dashboard loads after login
- [ ] ✅ No console errors (Press F12)

## 📁 Expected File Structure

After extraction, `/public_html/cms/` should contain:

```
/public_html/cms/
├── index.html           ✓
├── .htaccess           ✓ (may be hidden)
├── favicon.ico         ✓
├── logo.png            ✓
├── manifest.json       ✓
├── robots.txt          ✓
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    ├── vendor-[hash].js
    └── [other chunks]
```

## 🔐 Security Features Applied

✅ All critical security fixes from audit are implemented:
- API keys use bcrypt hashing
- Stripe webhook signature validation
- Server-side input validation (database constraints)
- Redundant RLS policies removed
- HTTPS forced via .htaccess

## 🧪 Test Accounts

**Super Admin:**
- torquestickers@gmail.com

**Regular User:**
- tukitcno@gmail.com

## ⚠️ Common Issues

### Blank Page
- Check browser console (F12)
- Verify `.env` production values are correct
- Ensure `.htaccess` is present

### 404 on Page Refresh
- Ensure `.htaccess` is extracted
- Check Apache mod_rewrite is enabled on server

### "Show Hidden Files" to See .htaccess
1. File Manager → Settings (top-right)
2. Check "Show Hidden Files (dotfiles)"
3. Click Save

## 📊 Post-Deployment

**Monitor First 24 Hours:**
- cPanel → Errors (check error logs)
- Browser console for client errors
- Test all major features

**Performance:**
- Run Google PageSpeed Insights
- Target: 90+ score

**Backups:**
- Setup automated weekly backups in cPanel
- Download manual backup after successful deployment

## 🆘 Need Help?

1. Check browser console (F12 → Console)
2. Check cPanel error logs
3. Verify file permissions
4. Ensure SSL certificate is active
5. See full guide: `DEPLOYMENT-GUIDE.md`

## 📞 Quick Reference

**Domain**: https://cms.torquesticker.com  
**cPanel Path**: /public_html/cms/  
**Build Script**: `./build-production.sh` or `build-production.bat`  
**Package**: torqueninja-production.zip  
**SSL**: Auto (Let's Encrypt via cPanel)  
**Permissions**: Folders 755, Files 644
