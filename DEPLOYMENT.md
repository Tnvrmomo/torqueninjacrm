# Deployment Instructions for cms.torquesticker.com

This document provides complete instructions for deploying the Torque Stickers Invoice Management System to cPanel.

## Prerequisites

- cPanel access to torquesticker.com
- Node.js 18+ installed locally (for building)
- FTP/File Manager access
- Domain/Subdomain configured

## Building the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This will create optimized production files in the `dist/` folder.

## Subdomain Setup (One-time)

### In cPanel → Subdomains:

1. Create subdomain: `cms`
2. Document Root: `/public_html/cms`
3. Click "Create"
4. Wait for DNS propagation (2-24 hours)

## Deployment Methods

### Option 1: File Manager Upload (Recommended for cPanel)

1. **Login to cPanel**
2. **Navigate to File Manager**
3. **Go to `/public_html/cms/` directory**
4. **Delete old files** (keep `.htaccess` if you have custom rules)
5. **Upload all files from `dist/` folder:**
   - Select all files in your local `dist/` folder
   - Drag and drop or use the Upload button
   - Wait for upload to complete
6. **Verify `.htaccess` is present** (should be in `public/` folder in your build)

### Option 2: FTP Upload

1. **Connect via FTP client** (FileZilla, Cyberduck, etc.)
   - Host: `ftp.torquesticker.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21
2. **Navigate to `/public_html/cms/`**
3. **Upload all files from `dist/` folder**
4. **Set permissions:**
   - Files: 644
   - Directories: 755

### Option 3: Terminal/SSH (If available)

```bash
# Connect via SSH
ssh username@torquesticker.com

# Navigate to directory
cd /public_html/cms

# Remove old files (be careful!)
rm -rf *

# Upload new files (use SFTP or git)
```

## SSL Certificate Setup

### In cPanel → SSL/TLS Status:

1. Find `cms.torquesticker.com` in the list
2. Click "Run AutoSSL" or "Install Let's Encrypt Certificate"
3. Wait for certificate installation
4. Verify HTTPS works: `https://cms.torquesticker.com`

## Environment Variables

The application uses Lovable Cloud (Supabase) for backend functionality:

- **VITE_SUPABASE_URL**: Pre-configured in build
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Pre-configured in build
- **Backend functions**: Deployed automatically via Supabase

**No additional environment configuration needed on the server.**

## Post-Deployment Checklist

- [ ] Visit `https://cms.torquesticker.com`
- [ ] Test login functionality
- [ ] Verify database connections work
- [ ] Test invoice creation
- [ ] Test PDF generation and download
- [ ] Test email sending (requires Resend API key configured)
- [ ] Check all pages load correctly
- [ ] Test on mobile devices
- [ ] Verify SSL certificate is active

## File Structure After Deployment

```
/public_html/cms/
├── assets/           # JS, CSS, and other assets
├── .htaccess         # SPA routing rules
├── index.html        # Main entry point
└── logo.png          # Application logo
```

## Common Issues & Solutions

### Issue: 404 Errors on Routes

**Solution:** Ensure `.htaccess` file is present with correct rules.

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Issue: White Screen / Blank Page

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify all files uploaded correctly
3. Check cPanel error logs: `Error Log` in cPanel
4. Ensure base URL is correct in build

### Issue: Database Connection Errors

**Solutions:**
1. Verify Supabase credentials are correct
2. Check Lovable Cloud backend is running
3. Verify RLS policies allow access
4. Check browser network tab for API errors

### Issue: Email Not Sending

**Solutions:**
1. Verify Resend API key is configured in Lovable secrets
2. Check edge function logs in Lovable Cloud
3. Verify sender email is verified in Resend
4. Check recipient email address is valid

### Issue: Slow Loading

**Solutions:**
1. Enable compression in `.htaccess` (already included)
2. Verify browser caching is working
3. Check cPanel resource usage
4. Consider upgrading hosting plan if needed

## Updating the Application

### For Code Changes:

1. Make changes locally
2. Run `npm run build`
3. Upload only changed files from `dist/` folder
4. Clear browser cache: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)

### For Database Changes:

1. Database changes are managed through Lovable Cloud
2. Migrations are applied automatically
3. No manual database updates needed

## Security Best Practices

- ✅ SSL certificate active (HTTPS)
- ✅ Backend protected by Supabase RLS
- ✅ API keys stored securely in Lovable secrets
- ✅ No sensitive data in frontend code
- ✅ Regular backups (use cPanel backup feature)

## Performance Optimization

The build includes:
- Code splitting for faster initial load
- Asset optimization and minification
- Browser caching headers
- Gzip compression
- Lazy loading of routes

## Backup Recommendations

1. **Before each deployment:**
   - Download current `cms/` folder as backup
   - Export database via Lovable Cloud

2. **Regular backups:**
   - Use cPanel's backup wizard (weekly)
   - Store backups off-server

## Support & Resources

- **Lovable Documentation**: https://docs.lovable.dev
- **cPanel Documentation**: Check your hosting provider
- **Supabase Documentation**: https://supabase.com/docs
- **Resend Documentation**: https://resend.com/docs

## Monitoring

### Check Application Health:

1. **Frontend**: Visit https://cms.torquesticker.com
2. **Backend**: Check Lovable Cloud dashboard
3. **Database**: Monitor in Lovable Cloud > Database
4. **Edge Functions**: Check logs in Lovable Cloud > Functions

### Performance Monitoring:

- Use browser DevTools Network tab
- Check cPanel resource usage
- Monitor Supabase dashboard for query performance

## Rollback Procedure

If deployment fails:

1. Restore previous backup from cPanel backups
2. Or re-upload previous `dist/` folder
3. Clear browser cache
4. Verify application works

---

## Quick Reference

### Build Command
```bash
npm run build
```

### Deployment Directory
```
/public_html/cms/
```

### Application URL
```
https://cms.torquesticker.com
```

### Need Help?

Contact your hosting provider for cPanel-specific issues or refer to Lovable documentation for application-specific questions.
