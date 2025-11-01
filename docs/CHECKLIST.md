# ✅ Security Setup Checklist

Quick checklist to make sure everything is secure.

---

## ✅ Already Done (Automatic)

These are already implemented and working:

- [x] API key moved to `.env.local`
- [x] `.env.local` excluded from git
- [x] API key validation on startup
- [x] Email format validation
- [x] CSV injection prevention
- [x] XSS protection in HTML output
- [x] Better error messages
- [x] Security utilities created
- [x] Documentation written

**You don't need to do anything for these!**

---

## 🎯 Recommended Actions (5-10 minutes)

### 1. Set Up API Key Restrictions ⭐ HIGH PRIORITY

**Why?** Prevents others from using your API key even if they find it.

**How?** (5 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key and click "Edit"
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Click "Add an item"
   - Add: `http://localhost:3000/*`
4. Under "API restrictions":
   - Select "Restrict key"
   - Check only: "Generative Language API"
5. Click "Save"

**Status**: [ ] Done / [ ] Skipped

---

### 2. Test the Application

**Why?** Make sure everything still works after security changes.

**How?** (3 minutes)
```bash
npm install  # If not already done
npm run dev
```

Then test:
- [ ] App opens at http://localhost:3000
- [ ] Can add recipients (CSV or manual)
- [ ] Can write/edit templates
- [ ] AI enhancement works (magic wand icon)
- [ ] Preview shows emails correctly
- [ ] Export works (text/CSV/HTML)
- [ ] No errors in browser console (F12)

**Status**: [ ] Done / [ ] Skipped

---

### 3. Bookmark Usage Guide

**Why?** Quick reference for features and troubleshooting.

**How?** (1 minute)
- Open `USAGE_GUIDE.md` in your editor
- Bookmark or pin it for quick access

**Status**: [ ] Done / [ ] Skipped

---

## 📚 Optional Reading

### For Understanding What Changed
- [ ] Read `WHAT_CHANGED.md` - Summary of security fixes
- [ ] Skim `SECURITY_IMPROVEMENTS.md` - Technical details

### For Using the Tool
- [ ] Read `USAGE_GUIDE.md` - Complete usage instructions
- [ ] Bookmark `QUICK_START_SECURITY.md` - Quick reference

### For Technical Details
- [ ] Read `SECURITY.md` - Deep dive into security
- [ ] Review `utils/security.ts` - Security utilities

---

## 🔒 Security Habits

Going forward, remember to:

### ✅ DO:
- [ ] Keep `.env.local` file private (never share)
- [ ] Check API usage occasionally: https://aistudio.google.com/app/apikey
- [ ] Update npm packages periodically: `npm update`

### ❌ DON'T:
- [ ] Don't commit `.env.local` (already prevented)
- [ ] Don't share API key in screenshots/forums
- [ ] Don't share `.env.local` file with anyone

---

## 🚀 If Deploying Online

Only if you want to deploy to Vercel/Netlify/etc:

- [ ] Add `GEMINI_API_KEY` environment variable in hosting dashboard
- [ ] Update API restrictions to include deployed URL (e.g., `https://yourapp.vercel.app/*`)
- [ ] Test deployed version thoroughly
- [ ] Verify API key is NOT in deployed source code

---

## 🐛 Troubleshooting Checklist

If something doesn't work:

- [ ] Check `.env.local` exists and has your API key
- [ ] Verify API key is correct (no extra spaces)
- [ ] Restart dev server (Ctrl+C, then `npm run dev`)
- [ ] Check browser console for errors (F12)
- [ ] Verify internet connection is working
- [ ] Check API usage hasn't exceeded quota

---

## 📞 Need Help?

**Setup issues:**
→ See `README.md` or `QUICK_START_SECURITY.md`

**How to use features:**
→ See `USAGE_GUIDE.md`

**Technical questions:**
→ See `SECURITY.md` or `SECURITY_IMPROVEMENTS.md`

**API key problems:**
→ Get new key: https://aistudio.google.com/app/apikey

---

## ✨ You're Done!

Once you've completed the recommended actions:

1. ✅ Set up API key restrictions
2. ✅ Test the application
3. ✅ Bookmark usage guide

Your mail merge assistant is secure and ready to use! 🎉

---

**Current Status:**

- Security: ✅ Implemented
- API Key: ✅ Protected
- Testing: [ ] Pending
- API Restrictions: [ ] Pending (recommended)
- Ready to Use: ⏳ After testing

**Next:** Start the app with `npm run dev` and test it out!
