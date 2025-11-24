# TorqueNinja cPanel Deployment Guide
**Subdomain**: cms.torquesticker.com

## ✅ Security Fixes Applied

1. **API Keys**: Now hashed with bcrypt before storage
2. **Stripe Webhook**: Added explicit signature validation
3. **Database Validation**: Server-side constraints for emails, URLs, lengths
4. **RLS Policies**: Removed redundant auth-only policies
5. **HTTPS**: Force HTTPS redirect in .htaccess

## 📦 Deployment Steps

### 1. Build for Production
```bash
# Copy production environment
cp deployments/cpanel/.env.production .env

# Install dependencies
npm install

# Build
npm run build
```

### 2. Prepare Deployment Package
```bash
# Copy .htaccess to dist
cp deployments/cpanel/.htaccess dist/.htaccess

# Create ZIP (from within dist folder)
cd dist
zip -r ../torqueninja-production.zip *
cd ..
```

### 3. Upload to cPanel

1. **Login to cPanel** at your hosting provider
2. **Navigate to File Manager**
3. **Go to**: `/public_html/cms/` (for subdomain cms.torquesticker.com)
4. **Backup existing files** (if any):
   - Select all → Compress → Download
   - Delete old files
5. **Upload ZIP**: Click Upload → Select `torqueninja-production.zip`
6. **Extract**: Right-click ZIP → Extract → Extract to `/public_html/cms/`
7. **Delete ZIP** after extraction
8. **Set Permissions**:
   - Folders: 755
   - Files: 644
   - Check "Recurse into subdirectories"

### 4. SSL Certificate

1. **cPanel → SSL/TLS Status**
2. **Find domain**: cms.torquesticker.com
3. **Run AutoSSL** or install Let's Encrypt
4. **Verify**: Green checkmark appears

### 5. Test Deployment

Visit: `https://cms.torquesticker.com`

**Test Checklist**:
- ✅ Homepage loads
- ✅ HTTPS lock icon shows
- ✅ Login page works
- ✅ Dashboard accessible after login
- ✅ No console errors (F12)
- ✅ All routes work (refresh on any page)
- ✅ Data loads from database

## 🔐 Production Accounts

- **torquestickers@gmail.com** - Super Admin, Lifetime Plan
- **tnvrmomo@gmail.com** - Super Admin, Professional Plan
- **tukitcno@gmail.com** - Regular User, Professional Plan
- **demo@torqueninja.com** - Demo Account

## 📊 File Structure After Deployment

```
/public_html/cms/
├── index.html
├── .htaccess           (Force HTTPS + SPA routing)
├── favicon.ico
├── logo.png
├── manifest.json
├── robots.txt
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    ├── vendor-[hash].js
    └── [other chunks]
```

## 🔍 Troubleshooting

### Blank Page
- Check browser console for errors
- Verify .env variables are correct
- Check .htaccess is present

### 404 on Refresh
- Ensure .htaccess is in place
- Check Apache mod_rewrite is enabled

### Database Connection Issues
- Verify VITE_SUPABASE_URL in .env
- Check CORS settings in Supabase
- Verify RLS policies are applied

### Assets Not Loading
- Check file permissions (644 for files, 755 for folders)
- Verify asset paths in index.html
- Clear browser cache

## 🚀 Post-Deployment

1. **Monitor Logs**: cPanel → Errors
2. **Performance**: Run Google PageSpeed Insights
3. **Backups**: Set up automated weekly backups
4. **Updates**: Keep dependencies updated monthly

## 🔒 Security Notes

- API keys are now securely hashed (bcrypt)
- All traffic forced to HTTPS
- Server-side validation active
- RLS policies optimized
- Webhook signatures validated

## 📞 Support

For issues, check:
1. Browser console (F12)
2. cPanel error logs
3. Supabase Edge Function logs
4. Database RLS policies
