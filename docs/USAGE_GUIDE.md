# 📧 Mail Merge Assistant - Usage Guide

Simple guide for using your AI-powered mail merge tool.

---

## 🎯 What Does This Tool Do?

Create personalized emails for multiple recipients using:
- CSV data or manual entry
- AI-powered email templates
- Merge fields like {{Name}}, {{Company}}, etc.
- Export to text, CSV, or HTML

---

## 🚀 Getting Started

### First Time Setup (5 minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your API key**:
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and paste your API key
   # Get key from: https://aistudio.google.com/app/apikey
   ```

3. **Start the app**:
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:3000

---

## 📝 How to Use

### Step 1: Add Recipients

**Option A: Upload/Paste CSV**
```csv
Email,Name,Company
john@example.com,John Doe,Acme Inc
jane@example.com,Jane Smith,Tech Corp
```

**Option B: Manual Entry**
- Click "Manual Entry" tab
- Fill in the spreadsheet-style table
- Add/remove rows and columns as needed

**Option C: Import from Google Contacts**
- Click "Sign in with Google"
- Click "Import from Google Contacts"
- Select which contacts to use

### Step 2: Create Email Template

Write your email with merge fields:

```
Subject: Special offer for {{Name}}

Hi {{Name}},

I noticed you work at {{Company}}. We have a special offer
that might interest you...

Best regards,
Your Name
```

**Merge fields**: Use `{{ColumnName}}` to insert values from your data.

### Step 3: AI Enhancement (Optional)

Click the magic wand icon ✨ and tell the AI how to improve:
- "Make it more friendly and casual"
- "Make it more professional and formal"
- "Add urgency and a call to action"
- "Shorten it to 2-3 sentences"

The AI will rewrite your template while keeping all merge fields.

### Step 4: Preview & Export

**Preview**: See how your emails look for each recipient

**Export options**:
1. **Plain Text** - Copy all emails as text
2. **CSV** - Download spreadsheet with original data + generated emails
3. **HTML** - Copy HTML-formatted emails

---

## 💬 Using the AI Chat Assistant

Click the chat bubble in the bottom-right corner.

**What you can ask**:

### Get Statistics
```
"How many emails do I have?"
"Get stats"
"Show me the numbers"
```

### Preview Emails
```
"Show me the first 5 emails"
"Preview emails for the marketing team"
"Let me see unsent emails"
```

### Send Emails (requires Google Sign-In)
```
"Send all emails"
"Send emails to the field staff"
"Send unsent emails only"
```

### Draft/Rewrite Emails
```
"Draft a follow-up email"
"Rewrite this to be more casual"
"Make it sound more urgent"
```

**Configure Backend**: Click the gear icon to set your backend service URL for sending emails.

---

## 🔐 Security Features

This tool includes:

✅ **Email validation** - Warns about invalid email formats
✅ **CSV safety** - Prevents formula injection attacks
✅ **XSS protection** - Safely handles HTML output
✅ **API key protection** - Key not exposed in code

---

## 🛠️ Tips & Tricks

### Creating Good Templates

**Use descriptive merge fields**:
```
✅ Good: Hi {{FirstName}}, I noticed you're the {{JobTitle}} at {{Company}}
❌ Bad: Hi {{Field1}}, you work at {{Field2}}
```

**Test with sample data first**:
- Use 2-3 test recipients
- Preview to check formatting
- Test send to yourself

### CSV Data Tips

**Column names**:
- Use simple names: `Name`, `Email`, `Company`
- Avoid spaces if possible: `FirstName` not `First Name`
- Must have `Email` column for sending

**Data quality**:
- Check for valid email formats (tool will warn you)
- Avoid empty cells where possible
- Use quotes for fields with commas: `"Smith, John"`

### AI Prompts That Work Well

**For tone**:
- "More professional" / "More casual"
- "More friendly" / "More formal"
- "More persuasive" / "More informative"

**For length**:
- "Keep it under 100 words"
- "Expand with more details"
- "Just 2-3 sentences"

**For style**:
- "Add a personal touch"
- "Make it sound urgent"
- "Add a clear call to action"
- "Remove jargon"

---

## 📊 Export Formats Explained

### 1. Plain Text
```
To: john@example.com
Subject: Special offer for John
---
Hi John,

Your personalized message here...

====================
```
Best for: Copying into email clients one by one

### 2. CSV
```csv
Email,Name,Company,GeneratedSubject,GeneratedBody
john@example.com,John,Acme,Special offer for John,Hi John...
```
Best for: Importing into other tools, keeping records, bulk processing

### 3. HTML
```html
<!-- Email to: john@example.com -->
<p><strong>Subject:</strong> Special offer for John</p>
<div>Hi John,<br /><br />Your message...</div>
```
Best for: Using in HTML email tools, web pages

---

## ❓ Troubleshooting

### "API key not configured"

**Fix**:
1. Check `.env.local` exists in project root
2. Make sure it contains: `GEMINI_API_KEY=your_key_here`
3. Restart dev server: Press `Ctrl+C`, then `npm run dev`

### "Invalid API key"

**Fix**:
1. Get a new key: https://aistudio.google.com/app/apikey
2. Update `.env.local`
3. Restart dev server

### "Invalid email format" warnings

**Fix**:
- Check your CSV data for malformed emails
- Format should be: `user@domain.com`
- Fix the emails in your data
- The tool will still work, but sending might fail for invalid emails

### AI enhancement not working

**Check**:
1. API key is correct
2. Internet connection is working
3. Check browser console for errors (F12)

### Import from Google Contacts not working

**Check**:
1. You're signed in with Google (top right)
2. You granted contacts permission
3. Your Google account has contacts

---

## 🔒 Protecting Your API Key

### Set Up Restrictions (Highly Recommended)

Takes 5 minutes, prevents API key abuse:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key → "Edit"
3. **Application restrictions**:
   - Choose "HTTP referrers"
   - Add: `http://localhost:3000/*`
4. **API restrictions**:
   - Choose "Restrict key"
   - Select only: "Generative Language API"
5. Save

Now your key only works from your app!

### Monitor Usage

Occasionally check: https://aistudio.google.com/app/apikey
- See how many requests you've made
- Set quotas if desired
- Check for unexpected usage

---

## 🎓 Example Workflows

### Workflow 1: Simple Newsletter

1. Add recipients (CSV with Name, Email)
2. Write template:
   ```
   Subject: Monthly Newsletter - March 2024

   Hi {{Name}},

   Here's what's new this month...
   ```
3. Preview
4. Export to plain text
5. Copy into your email client

### Workflow 2: Personalized Outreach

1. Add detailed recipient data (Name, Company, Role, Interest)
2. Write template with multiple merge fields:
   ```
   Subject: {{Interest}} solution for {{Company}}

   Hi {{Name}},

   As {{Role}} at {{Company}}, you might be interested in...
   ```
3. Use AI to enhance: "Make it more persuasive"
4. Preview first few emails
5. Export to CSV for records
6. Send (or use exported data in another tool)

### Workflow 3: Follow-Up Campaign

1. Import previous recipients from CSV
2. Chat with AI: "Draft a follow-up email to our previous message"
3. AI generates new template
4. Preview and adjust
5. Export and send

---

## 📞 Need More Help?

- **Security questions**: See `SECURITY.md`
- **Setup issues**: See `README.md`
- **Quick reference**: See `QUICK_START_SECURITY.md`

---

**Happy mail merging! 📧✨**
