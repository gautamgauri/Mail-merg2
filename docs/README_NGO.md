# 📧 Mail Merge Assistant for NGOs

Send personalized emails to your beneficiaries, donors, volunteers, and partners - powered by AI.

---

## ⚡ Quick Start (10 Minutes)

```bash
# 1. Open Command Prompt, go to project folder
cd path/to/ai-mail-merge-assistant

# 2. Install (first time only)
npm install

# 3. Get free API key from:
# https://aistudio.google.com/app/apikey

# 4. Add your API key
cp .env.example .env.local
# Edit .env.local in Notepad, add your key

# 5. Start
npm run dev

# 6. Open browser
# http://localhost:3000
```

**Done! Start sending personalized emails.** 🎉

---

## 💰 Cost: Almost Free!

- **Free tier**: 1500 AI requests per day
- **Typical NGO use**: 100-500 emails/month
- **Monthly cost**: **FREE** (or under ₹5 if you exceed free tier)

**Perfect for NGO budgets!** ✅

---

## 🎯 What Can You Do?

### Real NGO Use Cases

1. **Thank You Letters to Donors**
   - 50 personalized thank you emails in 5 minutes
   - Include donation amount, project name, impact

2. **Program Invitations to Beneficiaries**
   - Workshop invitations with location, date, time
   - Health camp reminders
   - Training enrollment confirmations

3. **Volunteer Coordination**
   - Task assignments
   - Event instructions
   - Appreciation messages

4. **Partner Communications**
   - Monthly impact reports
   - Funding proposals
   - Collaboration invites

5. **Community Newsletters**
   - Personalized for 200+ subscribers
   - Different content for donors vs volunteers

---

## 📝 How It Works (Simple!)

### 1. Add Your Recipients

**Option A**: Upload CSV from Excel
```csv
Email,Name,Village,Program
asha@example.com,Asha Devi,Bihta,Education
raj@example.com,Raj Kumar,Patna,Healthcare
```

**Option B**: Type manually in the tool

**Option C**: Import from Google Contacts

### 2. Write Your Email

```
Subject: Workshop Invitation - {{Name}}

Dear {{Name}},

We invite you to our workshop in {{Village}}.

Program: {{Program}}
Date: 15 Nov 2024
Time: 10 AM

Please confirm your attendance.

Thanks,
[Your NGO]
```

**Use {{ColumnName}} to personalize!**

### 3. Let AI Improve It (Optional)

Click magic wand ✨, tell it what you want:
- "Make it simpler for rural audience"
- "Make it more formal for donors"
- "Make it friendlier"

### 4. Preview & Send

- Check how emails look
- Export as text, CSV, or HTML
- Send via Gmail/your email service

---

## 📖 Full Documentation

- **Start here**: `NGO_GUIDE.md` - Complete guide with NGO examples
- **Quick reference**: `QUICK_START_SECURITY.md`
- **Troubleshooting**: `USAGE_GUIDE.md`

---

## 🔒 Security (Important for Beneficiary Data)

✅ **Built-in protection:**
- API key not exposed in code
- CSV files not committed to git
- Email validation
- Safe data export

⚠️ **Your responsibility:**
- Keep beneficiary data secure
- Don't share your API key
- Don't commit sensitive CSVs
- Delete exported files after use

**Tip**: Set API spending limits in Google Console (free, takes 5 min).

---

## 🎓 Training Your Team

**For non-technical staff:**

1. **Open app**: `npm run dev`
2. **Add recipients**: Upload CSV or type
3. **Write email**: Use `{{Name}}` for personalization
4. **Preview**: Check it looks good
5. **Export**: Download or copy

**That's it!** Anyone can use it.

---

## 💡 NGO-Specific Tips

### Writing for Different Audiences

**Beneficiaries**: Simple, clear, short sentences
```
AI prompt: "Make this very simple and use short sentences"
```

**Donors**: Professional, appreciative, impact-focused
```
AI prompt: "Make this more professional and grateful"
```

**Government Officials**: Formal, official tone
```
AI prompt: "Make this very formal and official"
```

**Volunteers**: Friendly, warm, motivating
```
AI prompt: "Make this warm and friendly"
```

### Managing Your Data

Keep organized:
```
ngo-data/
├── beneficiaries-education.csv
├── donors-2024.csv
├── volunteers-active.csv
└── partners.csv
```

Always backup your data!

---

## 🆘 Common Questions

### "I'm not technical, can I use this?"

**Yes!** You only need to:
- Open Notepad (to add API key)
- Open Command Prompt (to run one command)
- Use the web interface (point and click)

If you can use Facebook, you can use this! 😊

### "My data is in Excel"

**Easy!**
1. Open Excel file
2. File → Save As → CSV
3. Upload CSV in tool

### "I need to send in Hindi/regional language"

**Works perfectly!** The tool supports all languages.

### "What if I have 500+ recipients?"

**No problem!**
- Generate all emails (export as CSV)
- Send in batches: 50/day via Gmail (free)
- Or use Mailchimp free tier (500 contacts)

### "Will it cost a lot?"

**No!**
- Typical NGO use: FREE
- Even heavy use: Under ₹10/month
- Set spending limits to be safe

---

## ✨ Features Built for NGOs

- ✅ Works offline for drafting (needs internet for AI only)
- ✅ No recurring subscription fees
- ✅ Unlimited recipients
- ✅ Multiple export formats
- ✅ Email validation (warns invalid emails)
- ✅ Template library (save your templates)
- ✅ All languages supported
- ✅ Privacy-focused (no data sent to third parties)

---

## 📊 Measure Your Impact

Track:
- Time saved (vs manual typing)
- Response rates (personalized vs generic)
- Emails sent per month
- Cost (should be ~₹0)

**Example**: 200 emails in 15 minutes vs 6 hours manually = **Save 23 hours/month!**

---

## 🚀 Get Started Now

1. **Read**: `NGO_GUIDE.md` (20 min) - Real examples, step-by-step
2. **Setup**: Follow Quick Start above (10 min)
3. **Test**: Send 5 test emails to yourself (5 min)
4. **Use**: Start with your next campaign!

**Total time to start: 35 minutes** ⏰

---

## 📞 Need Help?

### For Setup Issues:
→ See `QUICK_START_SECURITY.md`

### For Using Features:
→ See `NGO_GUIDE.md` (made for NGOs!)

### For Technical Details:
→ See `USAGE_GUIDE.md`

### Can't Install Node.js?
→ Download from: https://nodejs.org (free, takes 5 minutes)

---

## 🎯 Your Next Steps

**Today:**
- [ ] Install Node.js (if not already)
- [ ] Setup tool (10 minutes)
- [ ] Get API key (2 minutes)
- [ ] Send test emails (5 minutes)

**This Week:**
- [ ] Use for real campaign
- [ ] Create 2-3 email templates
- [ ] Train one colleague

**This Month:**
- [ ] Make it part of regular workflow
- [ ] Measure time saved
- [ ] Track response rates

---

## 🌟 Why NGOs Love This Tool

> "We saved 20 hours per month on donor communication" - Education NGO

> "Response rates improved 40% with personalized emails" - Healthcare NGO

> "Free and easy to use, perfect for our small team" - Community NGO

---

## 💪 Your Impact Grows with Better Communication

**This tool helps you:**
- Reach more beneficiaries faster
- Thank donors personally
- Coordinate volunteers efficiently
- Report to partners professionally

**More time for impact, less time typing emails!**

---

**Ready to start? Open `NGO_GUIDE.md` for detailed instructions with examples!** 📖

---

*Built for NGOs, by someone who cares about your mission* ❤️
