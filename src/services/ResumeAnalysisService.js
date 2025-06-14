const axios = require('axios');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ResumeAnalysisService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async analyzeResume(resumeUrl) {
        try {
            // Download and parse PDF
            const resumeText = await this.extractTextFromPDF(resumeUrl);
            
            if (!resumeText || resumeText.length < 100) {
                throw new Error('Could not extract meaningful text from resume');
            }

            // Analyze with AI
            const analysis = await this.getAIAnalysis(resumeText);
            return analysis;

        } catch (error) {
            console.error('Error analyzing resume:', error);
            return null;
        }
    }

    async extractTextFromPDF(url) {
        try {
            const response = await axios.get(url, { 
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            const data = await pdf(response.data);
            return data.text;
        } catch (error) {
            console.error('Error extracting PDF text:', error);
            throw error;
        }
    }

    async getAIAnalysis(resumeText) {
        try {
            const prompt = `
You are a brutal but constructive resume reviewer for new grad software engineers. Analyze this resume and provide specific, actionable feedback. Be honest but helpful.

Resume Text:
${resumeText}

Please provide a JSON response with the following structure:
{
    "score": number (1-10),
    "scoreDescription": "brief description of score",
    "quickAssessment": "one sentence brutal but fair assessment",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "criticalIssues": ["issue 1", "issue 2", "issue 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "actionItems": ["action 1", "action 2", "action 3"],
    "atsScore": number (1-10),
    "atsAdvice": "ATS optimization advice"
}

Focus on:
- Technical skills relevance
- Project descriptions and impact
- Formatting and readability
- ATS compatibility
- New grad specific advice
- Missing elements for software engineering roles

Be brutally honest but constructive. Use emojis sparingly in the feedback.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback if JSON parsing fails
            return this.createFallbackAnalysis(resumeText);

        } catch (error) {
            console.error('Error getting AI analysis:', error);
            return this.createFallbackAnalysis(resumeText);
        }
    }

    createFallbackAnalysis(resumeText) {
        const wordCount = resumeText.split(' ').length;
        const hasEmail = /@/.test(resumeText);
        const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(resumeText);
        const hasGitHub = /github/i.test(resumeText);
        const hasLinkedIn = /linkedin/i.test(resumeText);

        let score = 5;
        const issues = [];
        const strengths = [];

        if (!hasEmail) {
            issues.push("❌ Missing email address");
            score -= 1;
        }
        
        if (!hasPhone) {
            issues.push("❌ Missing phone number");
            score -= 0.5;
        }

        if (!hasGitHub) {
            issues.push("❌ Missing GitHub profile");
            score -= 1;
        } else {
            strengths.push("✅ GitHub profile included");
        }

        if (!hasLinkedIn) {
            issues.push("❌ Missing LinkedIn profile");
            score -= 0.5;
        } else {
            strengths.push("✅ LinkedIn profile included");
        }

        if (wordCount < 200) {
            issues.push("❌ Resume seems too short");
            score -= 1;
        }

        if (wordCount > 800) {
            issues.push("❌ Resume might be too long");
            score -= 0.5;
        }

        return {
            score: Math.max(1, Math.min(10, Math.round(score))),
            scoreDescription: score >= 7 ? "Strong resume!" : score >= 5 ? "Decent but needs work" : "Needs significant improvement",
            quickAssessment: "Your resume has potential but needs some tweaks to stand out in the competitive new grad market.",
            strengths: strengths.length > 0 ? strengths : [
                "✅ Resume uploaded successfully",
                "✅ Shows initiative by seeking feedback",
                "✅ Ready for improvement"
            ],
            criticalIssues: issues.length > 0 ? issues : [
                "⚠️ Could use more specific technical details",
                "⚠️ Consider adding more quantified achievements",
                "⚠️ Make sure format is ATS-friendly"
            ],
            improvements: [
                "💡 Add specific technologies and programming languages",
                "💡 Include metrics and impact for each project",
                "💡 Use action verbs to start bullet points",
                "💡 Tailor keywords to job descriptions"
            ],
            actionItems: [
                "🎯 Review job postings and match keywords",
                "🎯 Add 2-3 more technical projects",
                "🎯 Get resume reviewed by career services",
                "🎯 Practice explaining your projects in interviews"
            ],
            atsScore: hasGitHub && hasEmail ? 7 : 5,
            atsAdvice: "Use standard section headings, avoid graphics/tables, and include relevant keywords from job descriptions."
        };
    }
}

module.exports = ResumeAnalysisService;
