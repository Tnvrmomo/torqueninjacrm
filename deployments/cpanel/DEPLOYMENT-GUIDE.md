# NinjaCRM cPanel Deployment Guide
**Subdomain**: cms.torquesticker.com

## ✅ What's Included

1. **Frontend**: React/Vite app built for production
2. **Backend**: PHP API with MySQL database
3. **Database**: Complete MySQL schema with admin user
4. **Security**: JWT authentication, bcrypt passwords, HTTPS redirect

## 📦 Deployment Files

- `ninjacrm.zip` - Frontend application
- `php-api.zip` - PHP backend API
- `ninjacrm.sql` - MySQL database schema

## 🚀 Deployment Steps

### 1. Database Setup
1. Create a MySQL database in cPanel named `torquest_cms`
2. Import `ninjacrm.sql` via PHPMyAdmin
3. Note the database credentials

### 2. Deploy PHP API
1. Create a subdomain or directory for the API (e.g., `api.cms.torquesticker.com` or `cms.torquesticker.com/api`)
2. Upload `php-api.zip` and extract
3. Update `php-api/.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_NAME=torquest_cms
   DB_USER=torquest_cms
   DB_PASS=k73k7WxLj1
   JWT_SECRET=ZtNr0DSVfuHxGuTbkaPCAWE62fQmEmAa0kJo1cIzYA=
   ```
4. Ensure PHP 7.4+ with PDO MySQL extension

### 3. Deploy Frontend
1. **Login to cPanel** at your hosting provider
2. **Navigate to File Manager**
3. **Go to**: `/public_html/cms/` (for subdomain cms.torquesticker.com)
4. **Backup existing files** (if any)
5. **Upload ZIP**: Click Upload → Select `ninjacrm.zip`
6. **Extract**: Right-click ZIP → Extract → Extract to `/public_html/cms/`
7. **Delete ZIP** after extraction
8. **Set Permissions**:
   - Folders: 755
   - Files: 644

### 4. Configure Frontend
Update the API URL in the frontend if needed (already configured for `https://cms.torquesticker.com/api`)

## 🔐 Admin Access

- **Email**: admin@ninjacrm.com
- **Password**: admin1234

## 🛠 Troubleshooting

- Ensure PHP API is accessible
- Check database connection in PHP logs
- Verify CORS headers if needed
- Test login with admin credentials
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
