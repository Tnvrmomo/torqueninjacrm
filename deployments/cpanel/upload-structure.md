# 📁 cPanel File Manager Upload Structure Guide

## What You're Uploading

After running `npm run build`, you'll have a `dist/` folder. Here's what's inside:

```
dist/
├── index.html           # Main HTML file (entry point)
├── assets/
│   ├── index-abc123.js  # Main JavaScript bundle (hashed filename)
│   ├── index-xyz789.css # Main CSS bundle (hashed filename)
│   ├── vendor-def456.js # React, React Router libraries
│   ├── supabase-ghi789.js # Supabase client
│   └── ...other chunks
├── logo.png             # Your logo (or in assets/)
├── favicon.ico          # Browser tab icon
└── .htaccess            # Apache configuration (MUST include!)
```

---

## Step-by-Step Upload to cPanel File Manager

### **Before You Upload:**

1. **Build the project:**
   ```bash
   cd torqueninja
   npm install
   npm run build
   ```

2. **Verify the build succeeded:**
   - Check that `dist/` folder exists
   - Check that `dist/index.html` exists
   - Check that `dist/assets/` folder has `.js` and `.css` files

3. **Copy .htaccess into dist/:**
   - Copy `public/.htaccess` to `dist/.htaccess`

---

### **Upload to cPanel:**

#### **Step 1: Login to cPanel**
- Go to your hosting provider's cPanel login page
- Enter username and password

#### **Step 2: Open File Manager**
- Find **File Manager** icon
- Click to open

#### **Step 3: Navigate to Target Directory**

**For main domain (e.g., torquesticker.com):**
- Navigate to: `public_html/`

**For subdomain (e.g., cms.torquesticker.com):**
- Navigate to: `public_html/` 

**Important:** If files already exist in this directory, either:
- Delete them (select all → Delete), OR
- Move them to a backup folder (select all → Move → `public_html/backup_old/`)

#### **Step 4: Upload Files**

**Method A: Upload All at Once (Recommended)**
1. Click **Upload** button (top menu)
2. In the upload interface, click **Select Files**
3. Navigate to your `dist/` folder on your computer
4. Select **ALL files and folders** inside `dist/`:
   - `index.html`
   - `.htaccess`
   - `logo.png` (if present)
   - `favicon.ico`
   - `assets/` folder (entire folder)
   - Any other files
5. Click **Open** to start upload
6. Wait for upload to complete (progress bar shows 100%)
7. Click **Back to /public_html/**

**Method B: Upload Folder, Then Extract**
1. Compress `dist/` folder on your computer (create `dist.zip`)
2. Upload `dist.zip` to cPanel File Manager
3. Select `dist.zip` → **Extract** → Extract to `/public_html/dist/`
4. Move all files from `/public_html/dist/` to `/public_html/`
5. Delete empty `dist/` folder and `dist.zip`

#### **Step 5: Verify Upload**

Your `/public_html/` should now look like:

```
/public_html/
├── index.html          ✓ MUST EXIST
├── .htaccess           ✓ MUST EXIST (might be hidden - enable "Show Hidden Files")
├── favicon.ico         ✓
├── logo.png           ✓ (or in assets/)
└── assets/
    ├── index-abc123.js ✓
    ├── index-xyz789.css ✓
    ├── vendor-def456.js ✓
    └── ... other files
```

**To show hidden files (.htaccess):**
- File Manager → **Settings** (top-right)
- Check **"Show Hidden Files (dotfiles)"**
- Click **Save**

#### **Step 6: Set File Permissions**

1. Select **all uploaded files and folders**
2. Click **Permissions** button (top menu)
3. Set permissions:
   - **Folders:** `755`
   - **Files:** `644`
4. Check **"Recurse into subdirectories"**
5. Click **Change Permissions**

---

## **Final Verification Checklist**

### Before Testing:
- [ ] `index.html` is in the root of `public_html/`
- [ ] `.htaccess` exists and has correct content
- [ ] `assets/` folder exists with `.js` and `.css` files
- [ ] `logo.png` or `favicon.ico` exists
- [ ] All file permissions are correct (644 for files, 755 for folders)
- [ ] SSL certificate is active (lock icon in browser)

### Test Your Deployment:
1. **Visit your domain** (e.g., `https://cms.torquesticker.com`)
2. **Check homepage loads** - should see TorqueNinja landing page
3. **Click "Login"** - should navigate to `/login`
4. **Click "Sign Up"** - should navigate to `/signup`
5. **Create an account** - test signup flow
6. **Login** - test authentication
7. **Access dashboard** - should load after login
8. **Refresh any page** - should NOT show 404
9. **Check browser console** - press F12, check for errors
10. **Test on mobile** - responsive design should work

---

## Common Upload Mistakes to Avoid

❌ **Don't upload the `dist/` folder itself** - upload its **contents**  
❌ **Don't forget `.htaccess`** - critical for routing  
❌ **Don't set wrong permissions** - causes blank pages  
❌ **Don't skip SSL certificate** - browser will warn users  

✅ **Do upload all files from inside dist/**  
✅ **Do include `.htaccess` in the root**  
✅ **Do set correct permissions (755/644)**  
✅ **Do enable SSL certificate**  
✅ **Do test thoroughly after deployment**
