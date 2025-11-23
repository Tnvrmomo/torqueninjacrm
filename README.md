# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a8f0bcd3-8769-487e-b9bd-a829b76e2dad

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a8f0bcd3-8769-487e-b9bd-a829b76e2dad) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Deployment Options

TorqueNinja can be deployed to multiple platforms. Choose the one that fits your needs:

### Quick Deploy Options

| Platform | Difficulty | Speed | Cost | Best For |
|----------|-----------|-------|------|----------|
| **[Vercel](deployments/vercel/README.md)** | Easy | ⚡ Fastest | Free tier | Quick deployments, automatic scaling |
| **[Netlify](deployments/netlify/README.md)** | Easy | ⚡ Fast | Free tier | GitHub Actions, CI/CD workflows |
| **[cPanel](deployments/cpanel/README.md)** | Medium | 🐢 Manual | Varies | Shared hosting, existing infrastructure |

### Detailed Deployment Guides

Each deployment option has a comprehensive guide in the `deployments/` folder:

- **📁 deployments/vercel/** - Vercel deployment via dashboard or CLI
- **📁 deployments/netlify/** - Netlify with GitHub Actions automation
- **📁 deployments/cpanel/** - cPanel File Manager and Git deployment

See [Deployment Test Checklist](deployments/TEST_CHECKLIST.md) for post-deployment verification.

---

## 🔧 Environment Variables

This project requires the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

**Local Development:**
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Never commit `.env` to Git!

**Production Deployment:**
- **Vercel/Netlify:** Set in dashboard under Environment Variables
- **cPanel:** Create `.env.production` file (see cPanel deployment guide)

---

## 🏗️ Build Commands

```bash
# Install dependencies
npm install

# Development server (localhost:8080)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Platform-specific builds
npm run build:vercel   # Build for Vercel
npm run build:netlify  # Build for Netlify
npm run build:cpanel   # Build for cPanel
```

---

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 🐛 Troubleshooting Deployment Issues

### Blank Page After Deployment
**Cause:** Missing environment variables or routing configuration  
**Fix:** 
1. Verify all environment variables are set
2. Check deployment logs for build errors
3. Ensure `.htaccess` (cPanel) or `vercel.json` exists

### 404 on Page Refresh
**Cause:** Missing SPA routing configuration  
**Fix:**
- **Vercel:** Ensure `vercel.json` is in repository
- **Netlify:** Ensure `netlify.toml` has `[[redirects]]` section
- **cPanel:** Ensure `.htaccess` has rewrite rules

### Authentication Doesn't Work
**Cause:** Incorrect Supabase credentials  
**Fix:** Double-check environment variables match your Supabase project

For more troubleshooting, see individual deployment guides.

---

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
