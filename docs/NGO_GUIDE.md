# 📧 Mail Merge Assistant - NGO Guide

Simple guide for sending personalized emails to your beneficiaries, donors, volunteers, and partners.

---

## 🎯 What Can This Tool Do for Your NGO?

Send personalized emails to:
- **Beneficiaries**: Program updates, event invitations
- **Donors**: Thank you letters, impact reports
- **Volunteers**: Task assignments, appreciation messages
- **Partners**: Collaboration proposals, monthly updates
- **Community members**: Newsletters, announcements

**Key Benefits:**
- ✅ Free to use (just need Google Gemini API key - see costs below)
- ✅ Personalize hundreds of emails in minutes
- ✅ AI helps write better emails
- ✅ No email marketing subscription needed
- ✅ Works offline for drafting

---

## 💰 Cost Information (Important for NGO Budgets)

### Google Gemini API Costs
**Good news:** It's very affordable!

- **Free tier**: 15 requests per minute, 1500 per day
- **Paid tier**: $0.075 per 1000 requests (after free tier)

**What this means:**
- Writing 100 personalized emails with AI enhancement: ~$0.01 (1 cent!)
- Monthly usage for typical NGO (500 emails/month): **FREE** or ~$0.05
- Annual cost: **FREE** or under $1

**Recommendation for NGOs:**
- Start with free tier (plenty for most NGOs)
- Monitor usage at: https://aistudio.google.com/app/apikey
- Set quota limits to control costs

---

## 🚀 Quick Setup (10 Minutes)

### Step 1: Install the Tool

```bash
# Open Command Prompt or Terminal
cd path/to/ai-mail-merge-assistant

# Install dependencies (first time only)
npm install
```

### Step 2: Get Your Free API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (looks like: `AIza...`)

### Step 3: Add API Key to the Tool

```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local in any text editor (Notepad, VS Code, etc.)
# Replace PLACEHOLDER with your actual API key:
# GEMINI_API_KEY=AIzaYourActualKeyHere

# Save and close
```

### Step 4: Start the Tool

```bash
npm run dev
```

Open browser: http://localhost:3000

**That's it!** 🎉

---

## 📖 NGO Use Cases & Examples

### Use Case 1: Thank You Letters to Donors

**Scenario**: You have 50 donors who contributed last month. You want to thank them personally.

**CSV Data:**
```csv
Email,Name,Amount,Date,Project
john@example.com,John Smith,5000,Oct 2024,Education
mary@example.com,Mary Johnson,2000,Oct 2024,Healthcare
```

**Email Template:**
```
Subject: Thank you for supporting {{Project}}, {{Name}}

Dear {{Name}},

Thank you for your generous contribution of Rs. {{Amount}} to our
{{Project}} program in {{Date}}. Your support is making a real
difference in our community.

Because of donors like you, we've been able to:
- [Your impact here]

We will send you a detailed impact report next month.

With gratitude,
[Your NGO Name]
```

**AI Enhancement**:
"Make it more heartfelt and emotional"

**Result**: 50 personalized thank you emails in 5 minutes!

---

### Use Case 2: Program Updates to Beneficiaries

**Scenario**: You need to inform beneficiaries about upcoming workshops in different locations.

**CSV Data:**
```csv
Email,Name,Location,Date,Time,Topic
beneficiary1@example.com,Asha,Bihta,15 Nov 2024,10 AM,Skills Training
beneficiary2@example.com,Raj,Patna,15 Nov 2024,2 PM,Skills Training
```

**Email Template:**
```
Subject: Workshop Invitation - {{Topic}}

Namaste {{Name}},

We are happy to invite you to our {{Topic}} workshop:

📍 Location: {{Location}}
📅 Date: {{Date}}
⏰ Time: {{Time}}

Please confirm your attendance by replying to this email.

Best regards,
[Your NGO Team]
```

**Export as CSV**: Keep a record of who you contacted and when.

---

### Use Case 3: Volunteer Task Assignments

**Scenario**: You have 20 volunteers working on different tasks for an upcoming event.

**CSV Data:**
```csv
Email,Name,Task,Location,ContactPerson,Phone
volunteer1@example.com,Priya,Registration Desk,Main Gate,Amit,9876543210
volunteer2@example.com,Rahul,Food Distribution,Hall 2,Sunita,9876543211
```

**Email Template:**
```
Subject: Your Task for Community Event - {{Name}}

Hi {{Name}},

Thank you for volunteering! Here are your details:

🎯 Task: {{Task}}
📍 Location: {{Location}}
👤 Coordinator: {{ContactPerson}} ({{Phone}})

Please arrive 30 minutes early. Contact {{ContactPerson}} if you have questions.

See you there!
[Your NGO]
```

---

### Use Case 4: Monthly Newsletter

**Scenario**: Send personalized newsletters to 200+ subscribers.

**CSV Data:**
```csv
Email,Name,MemberSince,LastDonation
subscriber1@example.com,John,Jan 2023,Oct 2024
subscriber2@example.com,Mary,Jun 2024,Never
```

**Email Template:**
```
Subject: November Newsletter - {{Name}}

Dear {{Name}},

Thank you for being with us since {{MemberSince}}!

This Month's Highlights:
- We reached 1000 beneficiaries
- New education center opened
- Healthcare camp in 5 villages

[Continue with your newsletter content...]

{{#if LastDonation != "Never"}}
Thank you for your last donation in {{LastDonation}}!
{{/if}}

With appreciation,
[Your NGO]
```

**AI Help**:
"Make this newsletter more engaging and add a call to action"

---

### Use Case 5: Impact Reports to Partners

**Scenario**: Quarterly reports to funding partners with specific data.

**CSV Data:**
```csv
Email,OrgName,ContactPerson,Project,Beneficiaries,Grant
partner1@example.com,ABC Foundation,Ms. Sharma,Education,250,5 Lakh
partner2@example.com,XYZ Trust,Mr. Kumar,Healthcare,180,3 Lakh
```

**Email Template:**
```
Subject: Q3 Impact Report - {{Project}} Program

Dear {{ContactPerson}},

We are pleased to share the progress of the {{Project}} program
funded by {{OrgName}} (Grant: Rs. {{Grant}}).

🎯 Beneficiaries Reached: {{Beneficiaries}}

Key Achievements:
[Your achievements here]

Detailed report attached.

Thank you for your continued support.

Best regards,
[Your name and role]
```

---

## 🎓 Step-by-Step Workflow for NGOs

### Basic Workflow

1. **Prepare Your Data**
   - Export from Excel/Google Sheets as CSV
   - Or enter manually in the tool
   - Include: Email, Name, and any custom fields

2. **Write Your Email**
   - Use `{{ColumnName}}` for personalization
   - Keep it clear and simple
   - Add your NGO branding/signature

3. **Use AI to Improve** (Optional)
   - Click magic wand icon ✨
   - Try: "Make it simpler for rural audience"
   - Or: "Make it more formal for government officials"

4. **Preview & Check**
   - Review first few emails
   - Check for spelling/formatting
   - Verify merge fields work correctly

5. **Export Your Choice**
   - **CSV**: Keep records for your database
   - **Text**: Copy into Gmail/Outlook
   - **HTML**: Use in email marketing tools

---

## 💡 NGO-Specific Tips

### Writing Emails for Different Audiences

**For Beneficiaries** (Simple & Clear):
```
Subject: New Program for You

Hi {{Name}},

We have a new program starting in {{Location}}.

When: {{Date}}
Where: {{Venue}}
What: {{Program}}

Please come! Call {{Phone}} if you have questions.

Thank you,
[NGO Name]
```
AI prompt: "Make this very simple, use short sentences"

**For Donors** (Professional & Appreciative):
```
Subject: Impact of Your {{Project}} Donation

Dear {{Name}},

Your contribution of Rs. {{Amount}} has created remarkable impact...
```
AI prompt: "Make this more professional and grateful"

**For Government Officials** (Formal):
```
Subject: Collaboration Proposal - {{Project}}

Respected {{Title}} {{Name}},

We write to present a proposal for collaboration on {{Project}}...
```
AI prompt: "Make this very formal and official"

**For Volunteers** (Friendly & Motivating):
```
Subject: You're Amazing, {{Name}}!

Hey {{Name}},

Thank you for volunteering last weekend! Your work on {{Task}}...
```
AI prompt: "Make this warm and appreciative"

---

## 📊 Managing Your Data

### Organizing Beneficiary Data

Create different CSV files for different programs:

```
ngo-data/
├── beneficiaries-education.csv
├── beneficiaries-health.csv
├── donors-2024.csv
├── volunteers-active.csv
└── partners-govt.csv
```

### Sample CSV Template for NGOs

```csv
Email,Name,Phone,Village,Program,Status,LastContact,Notes
person1@example.com,Asha Devi,9876543210,Bihta,Education,Active,Oct 2024,Interested in computer training
person2@example.com,Raj Kumar,9876543211,Patna,Healthcare,Active,Sep 2024,Needs follow-up
```

**Tips:**
- Keep one main database in Excel/Google Sheets
- Export specific groups as CSV when needed
- Always backup your data!

---

## 🔒 Security for NGO Context

### Protecting Beneficiary Data

**Important**: Beneficiary data is sensitive!

✅ **DO:**
- Keep CSV files on encrypted/password-protected computer
- Don't include sensitive info (Aadhar, bank details) in CSV
- Delete exported files after sending
- Use generic column names (avoid "HIV+", "Disability" etc.)

❌ **DON'T:**
- Don't save beneficiary emails on shared computers
- Don't email CSV files without encryption
- Don't commit CSV files to git (already protected)

### API Key Security

Your API key is like a password. Keep it safe:

1. **Set spending limits** (recommended for NGOs):
   - Go to: https://console.cloud.google.com/apis/credentials
   - Set daily quota: 100 requests (adjust as needed)
   - Set up billing alerts if using paid tier

2. **Don't share** your `.env.local` file with anyone

3. **Monitor usage** monthly: https://aistudio.google.com/app/apikey

---

## 🆘 Common NGO Scenarios & Solutions

### Scenario: "I have data in Excel"

**Solution:**
1. Open your Excel file
2. File → Save As → CSV (Comma delimited)
3. Upload CSV in the tool

### Scenario: "I don't have email addresses for all beneficiaries"

**Solution:**
- Filter your data to only include people with emails
- Or use the tool to draft messages, then send via WhatsApp/SMS manually
- Export as text and copy content

### Scenario: "I need to send to 500+ people"

**Solution:**
1. Use the tool to generate all emails (export as CSV)
2. Use Gmail's mail merge add-on (free for up to 50/day)
3. Or send in batches: 50 today, 50 tomorrow

**Free bulk email options for NGOs:**
- Gmail: 50/day with free add-ons
- Outlook: 300/day
- Mailchimp: 500 contacts free (nonprofit discount available)

### Scenario: "Emails are in Hindi/regional language"

**Solution:**
The tool works with any language! Just:
1. Write your template in Hindi/regional language
2. AI can still help: "Make this more formal" (works in Hindi too)
3. CSV data can be in any language

Example:
```csv
Email,Name,Village
test@example.com,आशा देवी,बिहटा
```

### Scenario: "I'm not technical, this seems complicated"

**Solution:**
Don't worry! You only need to know:
1. How to open Notepad (for editing `.env.local`)
2. How to open Command Prompt
3. How to copy-paste

Everything else is point-and-click in the web interface.

---

## 📱 Mobile-Friendly Workflow

While the tool runs on your computer, you can:

1. **Prepare data on mobile**: Google Sheets app → Export as CSV
2. **Run tool on computer**: Generate emails
3. **Review on mobile**: Check preview on phone
4. **Send from mobile**: Copy text, send via Gmail app

---

## 🎯 Best Practices for NGOs

### Email Content

✅ **DO:**
- Keep subject lines clear and specific
- Use local language if appropriate
- Include clear call-to-action
- Add contact information
- Mention your NGO name clearly

❌ **DON'T:**
- Don't use all caps (LOOKS LIKE SPAM)
- Don't overuse emojis (unprofessional)
- Don't forget to proofread
- Don't send without testing first

### Timing

**Best times to send:**
- Weekday mornings (9-11 AM): For professional contacts
- Evening (6-8 PM): For beneficiaries/volunteers
- Avoid: Late night, very early morning, weekends (for official communication)

### Follow-up

Keep track of sent emails:
1. Export as CSV (includes generated emails)
2. Add "Sent Date" column
3. Track responses in your main database

---

## 💻 Technical Requirements

**Minimum Requirements:**
- Windows/Mac/Linux computer
- Internet connection (for AI features)
- Web browser (Chrome, Firefox, Edge)
- 2GB free disk space

**Recommended:**
- 8GB RAM (for smooth operation)
- Stable internet (for AI enhancement)

**Data Limits:**
- Can handle 1000+ recipients
- Tested with CSV files up to 5MB
- No limit on email length

---

## 📞 Troubleshooting for NGOs

### "npm is not recognized"

**Solution:**
You need to install Node.js first:
1. Go to: https://nodejs.org
2. Download LTS version (free)
3. Install (click Next repeatedly)
4. Restart Command Prompt
5. Try again

### "My CSV isn't parsing correctly"

**Common issues:**
- Extra commas in data → Use quotes: `"Smith, John"`
- Excel formatting → Save as "CSV (Comma delimited)" not "CSV UTF-8"
- Special characters → Save as "CSV UTF-8" if you have Hindi/regional text

### "AI enhancement is slow"

**Reasons:**
- Slow internet connection
- API quota reached
- Too many people using at once

**Solution:**
- Check internet speed
- Check API usage: https://aistudio.google.com/app/apikey
- Try again in a few minutes

### "I accidentally closed the tool"

**Don't worry!**
- Your CSV data is NOT saved automatically
- Your template is NOT saved automatically
- Just reopen and start again
- **Tip**: Keep your CSV and template in a text file as backup

---

## 🎓 Training Resources for Your Team

### For Non-Technical Staff

Share these simple steps:
1. "Open the app" (`npm run dev`)
2. "Add your recipient list" (upload CSV or type)
3. "Write your email" (use `{{Name}}` for personalization)
4. "Click Preview" (check if it looks good)
5. "Export" (download or copy)

### Video Tutorial Idea

If you're creating training materials, cover:
1. Starting the app (30 sec)
2. Uploading CSV (1 min)
3. Writing template with merge fields (2 min)
4. Using AI enhancement (1 min)
5. Exporting results (1 min)

Total: 5-minute video

---

## 📋 Quick Reference Card

Print this for your desk:

```
╔════════════════════════════════════════╗
║     MAIL MERGE QUICK REFERENCE         ║
╠════════════════════════════════════════╣
║ START:           npm run dev           ║
║ URL:             localhost:3000        ║
║ MERGE FIELD:     {{ColumnName}}        ║
║ AI HELP:         Click magic wand ✨   ║
║ EXPORT:          Click Preview & Export║
║                                        ║
║ API KEY:         In .env.local file    ║
║ CHECK USAGE:     aistudio.google.com   ║
║ COST:            ~FREE for NGO use     ║
║                                        ║
║ HELP:            See USAGE_GUIDE.md    ║
╚════════════════════════════════════════╝
```

---

## 🌟 Success Stories (Example Use)

**Education NGO**: Sent 300 personalized workshop invitations in 20 minutes. 60% attendance rate.

**Healthcare NGO**: Monthly health camp reminders to 500 villagers. Reduced no-shows by 40%.

**Donor Relations**: Quarterly thank you emails to 150 donors. Increased recurring donations by 25%.

---

## 📝 Sample Templates Library

### Template 1: Event Invitation
```
Subject: You're Invited: {{EventName}} on {{Date}}

Dear {{Name}},

We are organizing {{EventName}} on {{Date}} at {{Venue}}.

Time: {{Time}}
Address: {{Address}}

Please RSVP by {{RSVPDate}}.

Looking forward to seeing you!

Best regards,
{{OrganizerName}}
{{NGOName}}
```

### Template 2: Donation Receipt
```
Subject: Thank You for Your Donation - Receipt Enclosed

Dear {{DonorName}},

Thank you for your generous donation of Rs. {{Amount}} on {{Date}}.

Donation ID: {{ReceiptNumber}}
Project: {{ProjectName}}
Tax Exemption: 80G Certificate Attached

Your support helps us serve {{Beneficiaries}} people.

With gratitude,
{{NGOName}}
```

### Template 3: Program Enrollment
```
Subject: Welcome to {{ProgramName}}!

Hi {{StudentName}},

Congratulations! You've been selected for {{ProgramName}}.

Start Date: {{StartDate}}
Center: {{CenterName}}
Timings: {{ClassTime}}

Required Documents:
- ID Proof
- 2 Passport Photos

Contact: {{CoordinatorName}} at {{Phone}}

See you soon!
{{NGOName}}
```

---

## 🎯 Next Steps for Your NGO

### This Week:
1. [ ] Set up the tool (10 minutes)
2. [ ] Test with 5-10 test emails
3. [ ] Set API spending limits

### This Month:
1. [ ] Use for one real campaign
2. [ ] Train one colleague
3. [ ] Create 3-5 template library

### This Quarter:
1. [ ] Integrate into regular workflow
2. [ ] Track time saved
3. [ ] Measure response rates

---

## 💬 Community Support

**NGO-specific help:**
- Document your use case
- Share templates that work
- Help other NGOs learn

**Questions?**
- Check `USAGE_GUIDE.md` for technical details
- See `QUICK_START_SECURITY.md` for setup help

---

## 🎉 You're Ready!

This tool will save your NGO hours of work and help you communicate better with your community.

**Remember:**
- Start small (test with 10 emails)
- Use AI to improve your writing
- Keep beneficiary data secure
- Monitor costs (it's very cheap!)

**Your impact will grow with better communication!** 💪

---

**Questions? Need help? Check the other guide files or reach out to your technical contact.**

---

*Made with ❤️ for NGOs making a difference*
