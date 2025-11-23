# 🚀 Deploying TorqueNinja to cPanel

## Prerequisites
- cPanel hosting account with Node.js support (or build locally)
- FTP/File Manager access
- Domain or subdomain pointed to your hosting
- SSL certificate (Let's Encrypt recommended)

---

## Method 1: File Manager Upload (Recommended for Beginners)

### Step 1: Build Locally
On your local machine:

```bash
# Navigate to project directory
cd torqueninja

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with all compiled files.

### Step 2: Prepare Files
1. **Locate the `dist/` folder** on your computer
2. **Copy `.htaccess` file** from `public/.htaccess` into the `dist/` folder
3. **Create `.env.production`** file in `dist/` with:

```env
VITE_SUPABASE_URL=https://krphkpliaoitytorrpcv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=krphkpliaoitytorrpcv
```

### Step 3: Upload to cPanel

#### Option A: File Manager (Easier)
1. Login to cPanel
2. Open **File Manager**
3. Navigate to your target directory:
   - **Main domain:** `public_html/`
   - **Subdomain:** `public_html/subdomain_folder/`
   - **Your case:** `public_html/` (for cms.torquesticker.com)

4. **IMPORTANT:** Delete or backup existing files
5. Click **Upload** button
6. Select **all files from the `dist/` folder** (not the folder itself)
7. Upload all files and folders
8. Verify these files are present:
   - `index.html`
   - `.htaccess`
   - `assets/` folder
   - `logo.png` (or in assets/)

#### Option B: FTP Upload (Faster for many files)
1. Use FileZilla, WinSCP, or any FTP client
2. Connect to your hosting:
   - **Host:** ftp.yourdomain.com
   - **Username:** Your cPanel username
   - **Password:** Your cPanel password
   - **Port:** 21
3. Navigate to `public_html/`
4. Upload all contents of `dist/` folder

### Step 4: Set Proper Permissions
In File Manager:
1. Select all uploaded files
2. Click **Permissions** (or right-click → Change Permissions)
3. Set:
   - **Folders:** 755 (rwxr-xr-x)
   - **Files:** 644 (rw-r--r--)
   - `.htaccess`: 644

### Step 5: Verify .htaccess Configuration
Ensure `public_html/.htaccess` contains:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Step 6: Configure SSL (If Not Already)
1. Go to cPanel → **SSL/TLS Status**
2. Find your domain
3. Click **Run AutoSSL** (or install Let's Encrypt certificate)
4. Wait 5-10 minutes for certificate installation

### Step 7: Test Deployment
Visit your domain (e.g., `https://cms.torquesticker.com`) and check:
- [ ] Homepage loads without errors
- [ ] Click "Login" → Login page loads
- [ ] Click "Sign Up" → Signup page loads
- [ ] Create account and verify login works
- [ ] Test navigation between pages
- [ ] Refresh any page → No 404 error
- [ ] Check browser console for errors (F12)
- [ ] Verify logo and images load

---

## Method 2: cPanel Git Deployment (Advanced)

### Prerequisites
- Git Version Control enabled in cPanel
- SSH access (optional but helpful)

### Step 1: Create Repository in cPanel
1. cPanel → **Git Version Control**
2. Click **Create**
3. Enter repository details:
   - **Clone URL:** Your GitHub repository URL
   - **Repository Path:** `/home/yourusername/repositories/torqueninja`
   - **Repository Name:** torqueninja

### Step 2: Configure `.cpanel.yml`
Ensure `.cpanel.yml` is in your repository root with correct path (replace `yourusername`).

### Step 3: Build Before Push
```bash
# On your local machine
npm run build
git add dist/
git commit -m "Add production build"
git push origin main
```

### Step 4: Pull and Deploy in cPanel
1. Go to cPanel → **Git Version Control**
2. Click **Manage** next to your repository
3. Click **Pull or Deploy** → **Update from Remote**
4. Deployment runs automatically via `.cpanel.yml`

---

## Troubleshooting

### Blank Page or White Screen
**Causes:**
- Missing .htaccess file
- Environment variables not set
- Build errors

**Fix:**
1. Check if `.htaccess` exists in `public_html/`
2. Check browser console (F12) for errors
3. Enable error reporting in cPanel → **PHP Configuration**

### 404 Error on Page Refresh
**Cause:** .htaccess not configured  
**Fix:** Ensure `.htaccess` with rewrite rules is in place

### Assets Not Loading (Images, CSS)
**Causes:**
- Incorrect file permissions
- Assets not uploaded

**Fix:**
1. Set folder permissions to 755
2. Set file permissions to 644
3. Verify `assets/` folder exists and contains files

### "Mixed Content" Warning
**Cause:** Site loaded via HTTPS but assets via HTTP  
**Fix:** Ensure SSL is installed and force HTTPS in .htaccess:

```apache
# Add before RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Performance Optimization

### Enable Gzip Compression
Already included in `.htaccess` above.

### Enable Browser Caching
Already included in `.htaccess` above.

### Enable HTTP/2
1. cPanel → **MultiPHP Manager**
2. Ensure PHP version 7.4+ is selected
3. HTTP/2 is automatically enabled with SSL

---

## Monitoring

- **Error Logs:** cPanel → **Errors** (check for 500/404 errors)
- **Access Logs:** cPanel → **Raw Access** (see visitor traffic)
- **Metrics:** cPanel → **Metrics** → **Visitors**

---

## Updating Your Deployment

### When You Make Code Changes:
1. Build locally: `npm run build`
2. Upload new `dist/` contents via File Manager or FTP
3. Clear browser cache
4. Test changes

### Or Use Git Deployment:
1. Make changes locally
2. Build: `npm run build`
3. Commit: `git add . && git commit -m "Update"`
4. Push: `git push origin main`
5. cPanel → Git Version Control → Pull or Deploy
