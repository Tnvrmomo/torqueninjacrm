# ✅ Deployment Testing Checklist

Use this checklist after deploying to **any platform** (Vercel, Netlify, or cPanel).

---

## Pre-Deployment Checks

Before deploying:
- [ ] All code changes committed to Git
- [ ] Build runs successfully locally: `npm run build`
- [ ] Preview works locally: `npm run preview`
- [ ] Environment variables are ready
- [ ] Logo and assets exist in `/public/`

---

## Post-Deployment Testing

### 1. Homepage (Landing Page)
Visit: `https://yourdomain.com/`

- [ ] Page loads without errors
- [ ] Logo displays correctly
- [ ] "Login" button works
- [ ] "Start Free Trial" button works
- [ ] All feature cards display
- [ ] Pricing section displays
- [ ] Footer displays

### 2. Authentication
- [ ] **/login** page loads
- [ ] **/signup** page loads
- [ ] Can create new account
- [ ] Email validation works
- [ ] Password validation works
- [ ] Can login with new account
- [ ] Redirects to dashboard after login
- [ ] Logout works (returns to login)

### 3. Protected Routes
After logging in:
- [ ] **/dashboard** loads
- [ ] **/clients** loads
- [ ] **/products** loads
- [ ] **/invoices** loads
- [ ] **/quotes** loads
- [ ] **/payments** loads
- [ ] **/reports** loads
- [ ] **/settings** loads
- [ ] **/profile** loads

### 4. Navigation
- [ ] Sidebar navigation works
- [ ] All menu items clickable
- [ ] Breadcrumbs display correctly
- [ ] Back button works
- [ ] Logo click returns to dashboard

### 5. Routing & Refresh
For each protected route:
- [ ] Direct URL access works (e.g., paste `/dashboard` in browser)
- [ ] Page refresh doesn't cause 404
- [ ] Browser back/forward buttons work
- [ ] No infinite redirect loops

### 6. CRUD Operations
Test creating, reading, updating, deleting:

**Clients:**
- [ ] Create new client
- [ ] View client details
- [ ] Edit client
- [ ] Delete client

**Products:**
- [ ] Create new product
- [ ] View product details
- [ ] Edit product
- [ ] Delete product

**Invoices:**
- [ ] Create new invoice
- [ ] View invoice details
- [ ] Generate PDF
- [ ] Edit invoice
- [ ] Delete invoice

### 7. Features
- [ ] CSV export works
- [ ] CSV import works
- [ ] PDF generation works
- [ ] Search functionality works
- [ ] Filtering works
- [ ] Pagination works
- [ ] Notifications display

### 8. Browser Console
Press **F12** → **Console** tab:
- [ ] No red errors
- [ ] No missing asset errors (404s)
- [ ] No CORS errors
- [ ] No Supabase authentication errors

### 9. Network Tab
Press **F12** → **Network** tab:
- [ ] All assets load (200 status)
- [ ] API calls succeed
- [ ] No failed requests (except expected 401 for unauthenticated)

### 10. Mobile Testing
Test on mobile device or Chrome DevTools mobile emulation:
- [ ] Homepage responsive
- [ ] Login page responsive
- [ ] Dashboard responsive
- [ ] Sidebar toggles on mobile
- [ ] All pages display correctly
- [ ] Touch interactions work

### 11. Performance
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages feels instant
- [ ] No long loading spinners
- [ ] Images load quickly
- [ ] No layout shift (CLS)

### 12. Security
- [ ] HTTPS works (lock icon in browser)
- [ ] Mixed content warnings absent
- [ ] Unauthenticated users cannot access dashboard
- [ ] Protected routes redirect to login
- [ ] Session persists after refresh
- [ ] Logout clears session

### 13. SEO & Meta Tags
- [ ] Page titles display correctly
- [ ] Favicon displays in browser tab
- [ ] Meta description exists (view source)
- [ ] Open Graph tags present (for social sharing)

### 14. Error Handling
- [ ] 404 page displays for invalid routes
- [ ] Form validation shows errors
- [ ] API errors display user-friendly messages
- [ ] No uncaught exceptions in console

---

## Platform-Specific Checks

### Vercel
- [ ] Deployment shows "Ready" status
- [ ] Build logs show no errors
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)

### Netlify
- [ ] Deployment shows "Published" status
- [ ] Build logs show no errors
- [ ] Environment variables set correctly
- [ ] GitHub Actions triggered successfully

### cPanel
- [ ] All files uploaded correctly
- [ ] `.htaccess` in place
- [ ] File permissions correct (755/644)
- [ ] SSL certificate active
- [ ] Error logs empty

---

## If Any Test Fails

1. **Check browser console** for error messages
2. **Check deployment logs** on hosting platform
3. **Verify environment variables** are set correctly
4. **Clear browser cache** and test again
5. **Check `.htaccess`** (cPanel) or routing config
6. **Review this checklist** for missed steps
7. **Rollback to previous deployment** if critical issue

---

## Sign-Off

**Tested by:** _____________  
**Date:** _____________  
**Platform:** [ ] Vercel [ ] Netlify [ ] cPanel  
**Deployment URL:** _____________  
**Status:** [ ] All tests passed [ ] Issues found (see notes)  

**Notes:**
___________________________________________
___________________________________________
