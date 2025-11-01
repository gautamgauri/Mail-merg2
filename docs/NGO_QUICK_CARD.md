# 📋 Mail Merge - Quick Reference Card for NGO Staff

**Print this and keep at your desk!** 📌

---

## 🚀 START THE TOOL

```
1. Open Command Prompt (Windows) or Terminal (Mac)
2. Type: cd [folder-path]
3. Type: npm run dev
4. Open browser: http://localhost:3000
```

---

## 📝 CREATE EMAILS (4 STEPS)

### STEP 1: Add Recipients
- **Upload CSV** from Excel, OR
- **Type manually** in table, OR
- **Import** from Google Contacts

### STEP 2: Write Template
```
Use {{ColumnName}} for personalization

Example:
Subject: Invitation for {{Name}}

Dear {{Name}},
Welcome to {{Program}} in {{Village}}.

Date: {{Date}}
Time: {{Time}}

Thanks,
[Your NGO]
```

### STEP 3: AI Help (Optional)
Click magic wand ✨, type:
- "Make it simpler"
- "Make it more formal"
- "Make it friendlier"

### STEP 4: Export
- **Text**: Copy all emails
- **CSV**: Download with data
- **HTML**: For email tools

---

## 💡 COMMON USE CASES

### 1. Thank You to Donors
```csv
Email,Name,Amount,Project
john@x.com,John,5000,Education
```

### 2. Workshop Invitation
```csv
Email,Name,Village,Date,Time
asha@x.com,Asha,Bihta,15 Nov,10 AM
```

### 3. Volunteer Tasks
```csv
Email,Name,Task,Location
priya@x.com,Priya,Registration,Gate 1
```

---

## 🎯 AI PROMPTS THAT WORK

**For Simple Language:**
"Make this very simple with short sentences"

**For Formal Tone:**
"Make this more professional and formal"

**For Donors:**
"Make this grateful and appreciative"

**For Government:**
"Make this very formal and official"

**For Volunteers:**
"Make this warm and friendly"

**For Rural Audience:**
"Simplify this for rural community"

---

## 📊 CSV FORMAT

### From Excel:
1. File → Save As
2. Choose "CSV (Comma delimited)"
3. Save

### Format:
```csv
Email,Name,Other,Fields
person@x.com,Name,Value,Value
```

**Must have "Email" column!**

---

## 🔧 TROUBLESHOOTING

### Tool won't start?
- Install Node.js from nodejs.org
- Restart Command Prompt
- Try again

### "API key not configured"?
- Open .env.local in Notepad
- Add: GEMINI_API_KEY=your_key
- Restart tool

### CSV not loading?
- Save as "CSV (Comma delimited)"
- Check for extra commas
- Use quotes for text with commas

### Emails look wrong?
- Check {{ColumnName}} spelling
- Match exact column names from CSV
- Preview before exporting

---

## 💰 COST TRACKING

- **Free tier**: 1500 requests/day
- **Typical use**: 100-500 emails/month
- **Cost**: Usually FREE!

**Check usage**: https://aistudio.google.com/app/apikey

---

## ✅ BEFORE SENDING CHECKLIST

- [ ] Preview first 3-5 emails
- [ ] Check all {{fields}} filled correctly
- [ ] Spelling and grammar checked
- [ ] Contact info included
- [ ] NGO name mentioned
- [ ] Tested with one test email

---

## 📞 HELP RESOURCES

| Issue | See File |
|-------|----------|
| Setup help | QUICK_START_SECURITY.md |
| NGO examples | NGO_GUIDE.md |
| All features | USAGE_GUIDE.md |
| Can't find file? | Ask your tech person |

---

## 🔒 SECURITY REMINDERS

✅ **DO:**
- Keep .env.local file private
- Delete exported CSVs after use
- Backup your data regularly

❌ **DON'T:**
- Don't share API key with anyone
- Don't commit sensitive CSVs to git
- Don't include Aadhar/sensitive data in CSVs

---

## 📝 SAMPLE TEMPLATES

### Template 1: Simple Invitation
```
Subject: Invitation - {{Name}}

Hi {{Name}},

Event: {{Event}}
Date: {{Date}}
Place: {{Place}}

Please come!

Thanks,
[NGO Name]
```

### Template 2: Thank You
```
Subject: Thank You {{Name}}

Dear {{Name}},

Thank you for {{Contribution}} to {{Project}}.

Your support helps {{Impact}}.

With gratitude,
[NGO Name]
```

### Template 3: Reminder
```
Subject: Reminder: {{Event}}

Hi {{Name}},

This is a reminder for {{Event}}.

When: {{Date}} {{Time}}
Where: {{Place}}

See you there!
[NGO Name]
```

---

## 🎓 TRAINING NEW STAFF (5 MIN)

**Show them:**
1. How to start tool (2 min)
2. Upload CSV / type data (1 min)
3. Write template with {{fields}} (1 min)
4. Preview and export (1 min)

**Practice:** Send 3 test emails together

---

## 💻 KEYBOARD SHORTCUTS

- **Ctrl+C**: Copy
- **Ctrl+V**: Paste
- **Ctrl+S**: Save (in editor)
- **Ctrl+F**: Find text
- **Ctrl+Z**: Undo

---

## 📅 MONTHLY CHECKLIST

- [ ] Check API usage (should be free)
- [ ] Backup your CSV files
- [ ] Update templates library
- [ ] Train new staff if needed
- [ ] Clean up old exported files

---

## 🌟 PRO TIPS

1. **Save templates**: Keep successful emails for reuse
2. **Test first**: Always send test email to yourself
3. **Batch send**: Use Gmail 50/day limit, spread over days
4. **Track results**: Note response rates for improvement
5. **Keep it simple**: Short emails get better responses

---

## 📈 MEASURE SUCCESS

**Track monthly:**
- Emails sent: ______
- Time saved: ______ hours
- Cost: ₹ ______ (should be ~0)
- Response rate: ______%

**Goal**: Save time, reach more people, better communication

---

## 🎯 COMMON MISTAKES TO AVOID

❌ Forgetting to preview before exporting
❌ Using wrong column names in {{fields}}
❌ Not testing with small batch first
❌ Including sensitive data in CSV
❌ Sending without proofreading
❌ All caps subject lines (looks like spam)

---

## 🚨 EMERGENCY CONTACTS

**Technical issues?**
→ Contact: [Your IT person's name/number]

**API key problems?**
→ Visit: https://aistudio.google.com/app/apikey

**Can't access tool?**
→ Check: Is computer connected to internet?
→ Check: Is npm installed? (type: npm --version)

---

## ✨ YOU'RE READY!

**Remember**:
- Start small (test with 10 emails)
- Use AI to improve writing
- Keep data secure
- Help is available in guide files

**You've got this!** 💪

---

**Questions? See NGO_GUIDE.md for detailed help**

---

*Last updated: Nov 2024 | For internal NGO use*

---

## 📌 STICK THIS ON YOUR WALL!

```
╔══════════════════════════════════════════╗
║   MAIL MERGE - DAILY USE                 ║
╠══════════════════════════════════════════╣
║ 1. START:    npm run dev                 ║
║ 2. BROWSER:  localhost:3000              ║
║ 3. ADD DATA: CSV or manual               ║
║ 4. WRITE:    Use {{FieldName}}           ║
║ 5. AI HELP:  Click ✨ icon               ║
║ 6. EXPORT:   Choose format               ║
║                                          ║
║ HELP FILES:                              ║
║ • NGO_GUIDE.md (examples)                ║
║ • USAGE_GUIDE.md (features)              ║
║ • QUICK_START_SECURITY.md (setup)        ║
║                                          ║
║ COST: FREE for NGO use! 🎉               ║
╚══════════════════════════════════════════╝
```

---

**Print this page → Keep at desk → Send better emails!** 📧✨
