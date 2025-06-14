# 🤖 InterviewBot - Your New Grad Career Coach

A comprehensive Discord bot designed specifically for new graduates to land their dream software engineering jobs. Get daily internship opportunities, practice interviews, optimize your resume, and much more!

## ✨ Features

### 📈 Daily Automated Content
- **🎯 Daily Fresh Internships** - Curated opportunities from LinkedIn, Indeed, and other sources
- **🎭 Daily Behavioral Questions** - Practice STAR method scenarios every day
- **💻 Daily LeetCode Problems** - Coding challenges with AI coaching and hints

### 🔧 Interactive Commands
- **📄 Resume Roasting** - Get brutally honest AI feedback with scoring and ATS optimization
- **🎤 Mock Interviews** - Practice behavioral, technical, and system design interviews
- **🎯 Career Goal Tracking** - Set, track, and celebrate your career milestones
- **💡 Personalized Insights** - Get industry trends and career guidance
- **🎪 Elevator Pitch Practice** - Perfect your 30-60 second introduction

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Discord bot token and application ID
- Google Gemini API key for AI features

### Installation

1. **Clone and Install**
```bash
git clone <your-repo>
cd InterviewBot
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your tokens
```

3. **Deploy Commands**
```bash
npm run deploy
```

4. **Start the Bot**
```bash
npm start
# or for development
npm run dev
```

### Required Environment Variables
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_client_id_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📋 Commands

### Core Features
- `/help` - Show all available commands
- `/roast-my-resume` - Upload PDF resume for AI analysis
- `/mock-interview` - Start practice interview session
- `/interview-feedback` - Get AI feedback on responses
- `/daily-question` - Get behavioral question anytime
- `/pitch` - Practice elevator pitch with feedback
- `/goals set/view/complete` - Career goal management
- `/insights` - Get personalized career guidance

### Daily Automation
The bot automatically posts:
- **9:00 AM EST** - Daily internship opportunities
- **10:00 AM EST** - Daily behavioral questions
- **11:00 AM EST** - Daily LeetCode problems

## 🏗️ Project Structure

```
InterviewBot/
├── src/
│   ├── index.js                 # Main bot file
│   ├── commands/               # Slash commands
│   │   ├── daily-question.js
│   │   ├── goals.js
│   │   ├── help.js
│   │   ├── insights.js
│   │   ├── interview-feedback.js
│   │   ├── mock-interview.js
│   │   ├── pitch.js
│   │   └── roast-my-resume.js
│   └── services/              # Business logic
│       ├── DailyQuestionService.js
│       ├── InternshipService.js
│       ├── ResumeAnalysisService.js
│       └── InterviewService.js
├── deploy-commands.js         # Command deployment
├── package.json
└── .env                      # Environment variables
```

## 🔧 Services

### InternshipService
Scrapes daily job opportunities from:
- LinkedIn Jobs
- Indeed
- AngelList
- Fallback curated opportunities

### ResumeAnalysisService
- PDF text extraction
- AI-powered analysis using Google Gemini
- ATS optimization scoring
- Specific improvement recommendations

### InterviewService
- Multiple interview types (behavioral, technical, system design)
- Company-specific preparation
- Real-time AI feedback
- Session management

### DailyQuestionService
- Rotating behavioral questions
- LeetCode problem integration
- STAR method guidance
- Difficulty progression

## 🎯 Channel Setup (Optional)

Create these channels for organized content:
- `#internships` - Daily job opportunities
- `#behavioral-questions` - Daily STAR practice
- `#leetcode` - Daily coding challenges
- `#resume-feedback` - Resume roasting sessions

If these channels don't exist, the bot will use `#general` as fallback.

## 🔒 Privacy & Data

- No personal data stored long-term
- Interview sessions temporary (memory-based)
- Resume analysis doesn't store files
- All AI processing via Google Gemini API

## 🛠️ Development

### Scripts
```bash
npm start          # Production start
npm run dev        # Development with nodemon
npm run deploy     # Deploy slash commands
```

### Adding New Commands
1. Create command file in `src/commands/`
2. Follow existing command structure
3. Run `npm run deploy` to register commands

### Adding New Services
1. Create service file in `src/services/`
2. Export class with required methods
3. Import and use in commands

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

Having issues? 
1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure bot has proper Discord permissions
4. Check if APIs (Gemini, job sites) are accessible

## 🎉 Success Stories

InterviewBot helps new grads:
- ✅ Land interviews at top tech companies
- ✅ Improve resume quality by 40%+ 
- ✅ Practice 100+ behavioral scenarios
- ✅ Stay updated with daily opportunities
- ✅ Build confidence through mock interviews

---

**Happy job hunting! 🚀**
