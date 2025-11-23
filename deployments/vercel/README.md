# 🚀 Deploying TorqueNinja to Vercel

## Prerequisites
- GitHub repository with your TorqueNinja code
- Vercel account (free tier works)
- Supabase project credentials

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Authorize Vercel to access your GitHub account
5. Select your TorqueNinja repository

### Step 2: Configure Build Settings
Vercel will auto-detect the settings, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://krphkpliaoitytorrpcv.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `your_supabase_anon_key` |
| `VITE_SUPABASE_PROJECT_ID` | `krphkpliaoitytorrpcv` |

**Important:** Select **"Production", "Preview", and "Development"** for all variables.

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Click on the deployment URL to test

### Step 5: Test Your Deployment
- [ ] Homepage loads (/)
- [ ] Click "Login" button → /login loads
- [ ] Click "Start Free Trial" → /signup loads
- [ ] Create account and login
- [ ] Dashboard loads (/dashboard)
- [ ] Navigation between pages works
- [ ] No console errors
- [ ] Refresh any page → page loads (not 404)

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From your project root
vercel

# For production deployment
vercel --prod
```

### Step 4: Add Environment Variables via CLI
```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://krphkpliaoitytorrpcv.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste your anon key

vercel env add VITE_SUPABASE_PROJECT_ID
# Paste: krphkpliaoitytorrpcv
```

---

## Custom Domain Setup (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, ~10 minutes)

---

## Troubleshooting

### Blank Page After Deployment
**Cause:** Missing environment variables or build error  
**Fix:** Check Vercel deployment logs → Functions → Build Logs

### 404 on Page Refresh
**Cause:** Missing SPA routing configuration  
**Fix:** Ensure `vercel.json` is in your repository root

### "Internal Error" on Login
**Cause:** AuthContext navigation issue  
**Fix:** Ensure you've applied the AuthContext fix (using window.location.href)

### Assets Not Loading
**Cause:** Incorrect asset paths  
**Fix:** Check that `/public/logo.png` exists and is committed to Git

---

## Monitoring

- **Analytics:** Vercel provides built-in analytics
- **Logs:** Vercel Dashboard → Your Project → Deployments → View Logs
- **Error Tracking:** Check Functions tab for runtime errors

---

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find a previous working deployment
3. Click **"..."** → **"Promote to Production"**
