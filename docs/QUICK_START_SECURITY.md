# 🚀 Quick Start Guide

## Setup Your Mail Merge Assistant

### ⚡ 5-Minute Secure Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd ai-mail-merge-assistant
   npm install
   ```

2. **Configure API Key** (Required)
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and add your API key
   # Get your key from: https://aistudio.google.com/app/apikey
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   ```
   http://localhost:3000
   ```

---

## ⚠️ IMPORTANT Security Rules

### ✅ DO:
- ✅ Keep `.env.local` file secure (already in `.gitignore`)
- ✅ Enable API key restrictions (see below)
- ✅ Check API usage occasionally

### ❌ DON'T:
- ❌ Commit `.env.local` to git (already prevented)
- ❌ Share your API key in screenshots/chat/forums
- ❌ Share your `.env.local` file with anyone

---

## 🔑 API Key Restrictions (Recommended)

Set these up in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Application restrictions**
   - Set HTTP referrer restrictions:
     ```
     https://yourdomain.com/*
     http://localhost:3000/*  (for development)
     ```

2. **API restrictions**
   - Restrict to "Generative Language API" only

3. **Usage quotas**
   - Set daily/monthly limits
   - Enable billing alerts

---

## 🛡️ Security Features Included

This project includes:

- ✅ Environment variable protection
- ✅ XSS prevention (HTML escaping)
- ✅ CSV injection prevention
- ✅ Email validation
- ✅ Enhanced error handling
- ✅ Secure CSV exports
- ✅ Input sanitization

---

## 📖 More Information

- **Full security guidelines**: See `SECURITY.md`
- **Detailed improvements**: See `SECURITY_IMPROVEMENTS.md`
- **Setup instructions**: See `README.md`

---

## 🆘 Troubleshooting

### "API key not configured" error

**Solution**:
1. Check that `.env.local` exists
2. Verify `GEMINI_API_KEY=your_actual_key` (not placeholder)
3. Restart dev server: `Ctrl+C` then `npm run dev`

### "Invalid API key" error

**Solution**:
1. Get a new key from https://aistudio.google.com/app/apikey
2. Update `.env.local`
3. Restart dev server

### "API quota exceeded" error

**Solution**:
1. Check usage in Google Cloud Console
2. Wait for quota reset (usually daily)
3. Or upgrade your quota

### Invalid email warnings

**Solution**:
- Fix email formats in your CSV data
- Ensure emails match: `user@domain.com`
- Warning won't block sending, just alerts you

---

## 🌐 Using Online (Optional)

If you want to deploy this online (e.g., Vercel, Netlify):

1. **Don't commit** `.env.local` (already protected)
2. **Add environment variable** in your hosting dashboard:
   - Variable: `GEMINI_API_KEY`
   - Value: Your API key
3. **Update API restrictions** to include your deployed URL:
   - Example: `https://yourapp.vercel.app/*`
4. **Deploy and test**

---

**That's it! You're ready to go. 🎉**

For questions, see the full documentation in `README.md` and `SECURITY.md`.
