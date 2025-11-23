# 🚀 Deploying TorqueNinja to Netlify

## Prerequisites
- GitHub repository with TorqueNinja code
- Netlify account (free tier works)
- Supabase project credentials

## Method 1: Automatic Deployment via GitHub Actions (Already Configured!)

Your project already has GitHub Actions configured! Here's how it works:

### Step 1: Add GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these two secrets:

| Secret Name | How to Get Value |
|-------------|------------------|
| `NETLIFY_AUTH_TOKEN` | Go to [Netlify](https://app.netlify.com) → User Settings → Applications → Personal Access Tokens → New Access Token |
| `NETLIFY_SITE_ID` | Go to Netlify → Your Site → Site Settings → Site Details → API ID |

### Step 2: Create Netlify Site
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. **Don't click Deploy yet!** Just save the site (it will deploy later via GitHub Actions)
5. Go to **Site Settings** → **Environment Variables**
6. Add these variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://krphkpliaoitytorrpcv.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `your_supabase_anon_key` |
| `VITE_SUPABASE_PROJECT_ID` | `krphkpliaoitytorrpcv` |

### Step 3: Deploy
1. Push any commit to your `main` branch
2. GitHub Actions will automatically:
   - Build your project
   - Run tests (if configured)
   - Deploy to Netlify
3. Check the **Actions** tab on GitHub to see deployment progress

### Step 4: Test Your Deployment
Visit your Netlify URL (e.g., `your-site-name.netlify.app`) and verify:
- [ ] Homepage loads
- [ ] Login/Signup work
- [ ] Dashboard accessible
- [ ] All navigation works
- [ ] No console errors
- [ ] Page refresh doesn't cause 404

---

## Method 2: Manual Deployment via Netlify Dashboard

### Step 1: Build Locally
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Deploy via Netlify UI
1. Go to [Netlify](https://app.netlify.com)
2. Drag and drop the `dist/` folder to the Netlify dashboard
3. Wait for deployment to complete

### Step 3: Configure Environment Variables
1. Go to **Site Settings** → **Environment Variables**
2. Add the Supabase variables (see table above)
3. Click **"Redeploy"** under Deploys

---

## Custom Domain Setup (Optional)

1. Go to Netlify → Your Site → **Domain Settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration:
   - **A Record:** Point to Netlify's load balancer IP
   - **CNAME:** Or point subdomain to `your-site-name.netlify.app`
5. SSL certificate is automatically provisioned (free)

---

## Troubleshooting

### GitHub Actions Deployment Fails
**Check:**
- GitHub Secrets are set correctly
- `NETLIFY_SITE_ID` matches your Netlify site
- `.github/workflows/deploy.yml` is in the repo

### Build Fails on Netlify
**Cause:** Missing environment variables  
**Fix:** Check Site Settings → Environment Variables

### Blank Page After Deployment
**Cause:** Build error or missing env vars  
**Fix:** Check Netlify Deploy Logs → Build Logs

### 404 on Direct Route Access
**Cause:** Missing SPA redirects  
**Fix:** Ensure `netlify.toml` has `[[redirects]]` section

---

## Monitoring

- **Deploy Logs:** Netlify Dashboard → Deploys → Click deployment
- **Function Logs:** Netlify Dashboard → Functions (if using)
- **Analytics:** Available on Pro plan

---

## Rollback

1. Go to Netlify → Deploys
2. Find previous working deployment
3. Click **"Publish deploy"**
