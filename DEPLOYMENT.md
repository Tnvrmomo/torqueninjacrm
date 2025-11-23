# Deployment Instructions for cms.torquesticker.com

This document provides complete instructions for deploying the Torque Stickers Invoice Management System to cPanel.

## Prerequisites

- cPanel access to torquesticker.com
- Node.js 18+ installed locally (for building)
- FTP/File Manager access
- Domain/Subdomain configured
- Resend API key for email functionality

## Pre-Deployment Checklist

Before building and deploying, verify:

- [ ] All environment variables are configured in Lovable Cloud
- [ ] Resend email domain is verified at https://resend.com/domains
- [ ] Test all CRUD operations locally
- [ ] Verify email sending works
- [ ] Test PDF generation and download
- [ ] Verify authentication flows (signup, login, logout)
- [ ] Test on mobile devices
- [ ] Check browser console for errors

## Building the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This will create optimized production files in the `dist/` folder with:
- Minified JavaScript and CSS
- Code splitting for optimal loading
- Asset optimization
- Source maps disabled for security

### 3. Verify Build

Check that `dist/` folder contains:
- `index.html`
- `assets/` folder with JS and CSS files
- `.htaccess` file
- `logo.png`

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
   - ⚠️ **WARNING**: Back up current files before deleting
5. **Upload all files from `dist/` folder:**
   - Select all files in your local `dist/` folder
   - Drag and drop or use the Upload button
   - Wait for upload to complete
6. **Verify `.htaccess` is present** (should be in `dist/` folder)
7. **Set correct permissions:**
   - Files: 644
   - Directories: 755

### Option 2: FTP Upload

1. **Connect via FTP client** (FileZilla, Cyberduck, etc.)
   - Host: `ftp.torquesticker.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21
2. **Navigate to `/public_html/cms/`**
3. **Delete old files** (backup first!)
4. **Upload all files from `dist/` folder**
5. **Set permissions:**
   - Files: 644
   - Directories: 755

### Option 3: Terminal/SSH (If available)

```bash
# Connect via SSH
ssh username@torquesticker.com

# Navigate to directory
cd /public_html/cms

# Backup old files
tar -czf backup-$(date +%Y%m%d).tar.gz *

# Remove old files (be careful!)
rm -rf *

# Upload new files (use SFTP or git)
# Then extract if uploaded as archive
```

## SSL Certificate Setup

### In cPanel → SSL/TLS Status:

1. Find `cms.torquesticker.com` in the list
2. Click "Run AutoSSL" or "Install Let's Encrypt Certificate"
3. Wait for certificate installation (can take 5-10 minutes)
4. Verify HTTPS works: `https://cms.torquesticker.com`
5. If issues, check:
   - DNS records are correct
   - Domain is fully propagated
   - cPanel SSL settings

## Environment Variables

The application uses Lovable Cloud (Supabase) for backend functionality:

- **VITE_SUPABASE_URL**: Pre-configured in build
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Pre-configured in build
- **Backend functions**: Deployed automatically via Supabase
- **RESEND_API_KEY**: Configured in Lovable Cloud secrets

**No additional environment configuration needed on the server.**

## Post-Deployment Testing

### Critical Path Testing:

1. **Visit** `https://cms.torquesticker.com`
2. **Test Authentication:**
   - [ ] Signup with new account
   - [ ] Login with existing account
   - [ ] Logout functionality
   - [ ] Session persistence
3. **Test Database Connections:**
   - [ ] View clients list
   - [ ] Create new client
   - [ ] Edit existing client
   - [ ] Delete client (with confirmation)
4. **Test Invoice Management:**
   - [ ] Create new invoice
   - [ ] Add line items
   - [ ] Calculate totals correctly
   - [ ] Generate PDF
   - [ ] Download PDF
   - [ ] Send email (verify receipt)
5. **Test Other Entities:**
   - [ ] Products (CRUD operations)
   - [ ] Quotes (create, view, edit)
   - [ ] Expenses (add, categorize)
   - [ ] Projects (create, track)
   - [ ] Payments (record, view)
6. **Test UI/UX:**
   - [ ] All pages load correctly
   - [ ] Navigation works
   - [ ] Mobile responsive design
   - [ ] Loading states display
   - [ ] Error messages show correctly
7. **Test Security:**
   - [ ] Protected routes require authentication
   - [ ] Users only see their company data
   - [ ] RLS policies are enforced
   - [ ] XSS protection works

## File Structure After Deployment

```
/public_html/cms/
├── assets/
│   ├── index-[hash].js         # Main application bundle
│   ├── vendor-[hash].js        # React, React Router
│   ├── supabase-[hash].js      # Supabase client
│   ├── ui-[hash].js            # UI components
│   └── index-[hash].css        # Styles
├── .htaccess                   # SPA routing + optimizations
├── index.html                  # Main entry point
└── logo.png                    # Application logo
```

## Common Issues & Solutions

### Issue: 404 Errors on Routes

**Symptoms:**
- Direct URL access shows 404
- Refresh on any route shows 404
- Only homepage works

**Solution:** Ensure `.htaccess` file is present with correct content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /cms/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /cms/index.html [L]
</IfModule>
```

If still not working:
1. Check if `mod_rewrite` is enabled in Apache
2. Verify `.htaccess` files are allowed (AllowOverride All)
3. Contact hosting provider

### Issue: White Screen / Blank Page

**Symptoms:**
- Page loads but shows nothing
- No error message visible

**Solutions:**

1. **Check browser console** (F12):
   - Look for JavaScript errors
   - Check for CORS errors
   - Verify asset loading

2. **Check cPanel Error Logs:**
   - Go to cPanel → Error Logs
   - Look for recent errors
   - Check for permission issues

3. **Verify file upload:**
   - Ensure all files uploaded correctly
   - Check file permissions (644 for files, 755 for directories)
   - Verify no corruption during upload

4. **Check base URL:**
   - Verify `basename="/cms"` in router
   - Check `base: "/cms/"` in vite config
   - Ensure `.htaccess` has correct RewriteBase

### Issue: Database Connection Errors

**Symptoms:**
- "Failed to fetch" errors
- Data not loading
- Blank tables

**Solutions:**

1. **Verify Supabase credentials:**
   - Check Lovable Cloud is active
   - Verify environment variables are correct
   - Test API connection from browser

2. **Check RLS policies:**
   - Ensure user is authenticated
   - Verify policies allow access
   - Check company_id associations

3. **Network tab debugging:**
   - Open browser DevTools
   - Go to Network tab
   - Look for failed API calls
   - Check response details

### Issue: Email Not Sending

**Symptoms:**
- "Send Email" button doesn't work
- No email received
- Email errors in console

**Solutions:**

1. **Verify Resend configuration:**
   - Check RESEND_API_KEY is configured in Lovable secrets
   - Verify API key is active at https://resend.com/api-keys
   - Check API key permissions

2. **Verify domain:**
   - Go to https://resend.com/domains
   - Ensure cms.torquesticker.com domain is verified
   - Check DNS records are correct

3. **Check edge function logs:**
   - Open Lovable Cloud dashboard
   - Go to Functions → send-invoice-email
   - Check logs for errors

4. **Verify recipient email:**
   - Ensure email address is valid
   - Check spam folder
   - Test with different email provider

### Issue: Slow Loading

**Symptoms:**
- Pages take long to load
- Sluggish performance
- Timeouts

**Solutions:**

1. **Verify optimizations active:**
   - Check `.htaccess` compression is enabled
   - Verify browser caching headers
   - Check if gzip is working (browser DevTools)

2. **Check cPanel resources:**
   - Go to cPanel → Resource Usage
   - Look for CPU/memory limits
   - Consider upgrading plan if maxed out

3. **Optimize database queries:**
   - Check Lovable Cloud dashboard
   - Look for slow queries
   - Add indexes if needed

4. **CDN consideration:**
   - Consider using Cloudflare
   - Free plan includes caching and SSL

### Issue: PDF Generation Fails

**Symptoms:**
- Download button doesn't work
- PDF is blank or corrupted
- Browser errors

**Solutions:**

1. **Check browser console** for errors
2. **Verify jsPDF library** loaded correctly
3. **Test in different browser** (Chrome recommended)
4. **Check invoice data** is complete

### Issue: Authentication Problems

**Symptoms:**
- Can't login
- Session expires immediately
- Redirect loops

**Solutions:**

1. **Clear browser cache** and cookies
2. **Verify Supabase auth** is configured:
   - Auto-confirm email should be enabled
   - Check user exists in database
3. **Check localStorage** is enabled in browser
4. **Test in incognito mode**

## Updating the Application

### For Code Changes:

1. Make changes locally
2. Test thoroughly in development
3. Run `npm run build`
4. **Backup current production files:**
   ```bash
   # In cPanel File Manager, create zip of /cms folder
   # Or via FTP, download entire /cms folder
   ```
5. Upload only changed files from `dist/` folder
6. **Clear browser cache** on all devices:
   - Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Safari: Cmd+Option+R (Mac)
7. Test all affected functionality
8. Monitor for errors in first 24 hours

### For Database Changes:

1. Database changes are managed through Lovable Cloud
2. Migrations are applied automatically
3. **Always backup before major schema changes**
4. No manual database updates needed

## Security Best Practices

- ✅ SSL certificate active (HTTPS enforced)
- ✅ Backend protected by Supabase RLS policies
- ✅ API keys stored securely in Lovable secrets
- ✅ No sensitive data in frontend code
- ✅ Input validation on all forms
- ✅ XSS protection implemented
- ✅ CORS properly configured
- ✅ Password strength requirements enforced
- ✅ Leaked password protection enabled
- ✅ Regular security audits via Supabase linter

### Regular Security Checks:

1. **Monthly:**
   - Review user access logs
   - Check for suspicious activity
   - Update dependencies

2. **Quarterly:**
   - Run security audit
   - Review RLS policies
   - Test authentication flows
   - Backup verification

3. **Annually:**
   - Full security assessment
   - Update SSL certificate (auto with Let's Encrypt)
   - Review and update documentation

## Performance Optimization

The build includes:

- ✅ Code splitting for faster initial load
- ✅ Asset optimization and minification
- ✅ Tree shaking to remove unused code
- ✅ Browser caching headers (1 year for images, 1 month for JS/CSS)
- ✅ Gzip compression (text-based files)
- ✅ Lazy loading of routes
- ✅ Optimized bundle sizes:
  - Vendor (React, Router): ~150KB
  - Supabase client: ~80KB
  - UI components: ~100KB
  - Main app: ~200KB

### Performance Monitoring:

Use browser DevTools to monitor:
- Page load time (should be < 3 seconds)
- Time to interactive (should be < 5 seconds)
- Bundle sizes
- Network requests

**Targets:**
- Initial page load: < 2s on 4G
- Time to interactive: < 4s
- Lighthouse score: > 90

## Backup Recommendations

### Before Each Deployment:

1. **Download current `cms/` folder** as ZIP
2. **Export database** via Lovable Cloud:
   - Go to Cloud → Database
   - Export all tables as CSV
3. **Store backup** with date in filename:
   - `cms-backup-2024-01-15.zip`
   - `database-backup-2024-01-15/`

### Regular Backups:

1. **Weekly automated backups:**
   - Use cPanel's backup wizard
   - Schedule weekly full backups
   - Store on external server/cloud

2. **Monthly off-site backups:**
   - Download from cPanel
   - Upload to Google Drive/Dropbox
   - Keep last 3 months

3. **Before major changes:**
   - Full backup (files + database)
   - Document what's changing
   - Test restore procedure

### Backup Verification:

- Test restore quarterly
- Verify backups are not corrupted
- Document restore steps
- Time the restore process

## Monitoring

### Daily Checks:

- Visit site to ensure it loads
- Check email functionality works
- Monitor cPanel resource usage

### Weekly Checks:

- Review error logs
- Check Lovable Cloud dashboard
- Monitor edge function logs
- Review user activity logs

### Monthly Checks:

- Full functionality test
- Performance benchmarking
- Security audit
- Backup verification

### Application Health Checklist:

1. **Frontend:** Visit https://cms.torquesticker.com
   - [ ] Loads in < 3 seconds
   - [ ] No console errors
   - [ ] All pages accessible

2. **Backend:** Check Lovable Cloud dashboard
   - [ ] Database queries responding
   - [ ] Edge functions running
   - [ ] No error spikes

3. **Edge Functions:** Check logs in Lovable Cloud
   - [ ] send-invoice-email: No errors
   - [ ] Response times < 2 seconds

4. **Database:** Monitor in Lovable Cloud → Database
   - [ ] Query performance acceptable
   - [ ] No connection issues
   - [ ] Storage within limits

### Performance Monitoring Tools:

- **Lighthouse** (Chrome DevTools): Run monthly audits
- **GTmetrix** (https://gtmetrix.com): Monitor page speed
- **Pingdom** (https://tools.pingdom.com): Check uptime
- **cPanel Resource Usage**: Monitor server resources

## Rollback Procedure

If deployment fails or issues are discovered:

### Immediate Rollback:

1. **Stop new traffic** (optional: add maintenance page)
2. **Restore previous backup:**
   - Via cPanel File Manager: Extract previous ZIP
   - Via FTP: Upload previous version
3. **Clear CDN cache** if using one
4. **Test restored version** works
5. **Notify users** if any data loss occurred

### Steps for Safe Rollback:

```bash
# Via SSH (if available)
cd /public_html/cms
rm -rf *
# Restore from backup
unzip cms-backup-[date].zip
# Set permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### Post-Rollback:

1. **Document what went wrong**
2. **Fix issues locally**
3. **Test thoroughly**
4. **Plan redeployment**

## Troubleshooting Tools

### Browser Developer Tools (F12):

- **Console:** JavaScript errors
- **Network:** API calls and responses
- **Application:** LocalStorage, session data
- **Performance:** Page load metrics

### cPanel Tools:

- **Error Logs:** Apache/PHP errors
- **Resource Usage:** CPU, memory, I/O
- **File Manager:** Verify files are correct
- **phpMyAdmin:** Database inspection (if needed)

### Lovable Cloud Tools:

- **Database:** View tables, run queries
- **Functions:** Check edge function logs
- **Authentication:** Monitor user sessions
- **Storage:** Check file uploads (if used)

## Support & Resources

- **Lovable Documentation**: https://docs.lovable.dev
- **cPanel Documentation**: Check your hosting provider
- **Supabase Documentation**: https://supabase.com/docs
- **Resend Documentation**: https://resend.com/docs
- **Project Repository**: [Your GitHub/GitLab URL]

## Emergency Contacts

Maintain a list of contacts for:
- Hosting provider support
- DNS provider support  
- Domain registrar support
- Development team contacts

## Changelog

Keep a deployment log:

```
## [2024-01-15]
- Deployed initial version
- Configured SSL certificate
- Set up email functionality

## [2024-01-20]
- Fixed routing issues
- Added loading skeletons
- Improved error handling
```

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

### Key Configuration Files
- `vite.config.ts` - Build configuration
- `public/.htaccess` - Server routing
- `src/App.tsx` - Router basename

### Support Channels
- Lovable Docs: https://docs.lovable.dev
- Lovable Discord: https://discord.gg/lovable

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0  
**Maintained by:** Torque Stickers Development Team
