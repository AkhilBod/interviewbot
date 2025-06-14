const { GoogleGenerativeAI } = require('@google/generative-ai');

class InterviewService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        this.activeSessions = new Map();
    }

    async startMockInterview(type, company = null) {
        const sessionId = this.generateSessionId();
        const questions = this.getQuestionsForType(type, company);
        
        const session = {
            sessionId,
            type,
            company,
            questions,
            currentQuestionIndex: 0,
            currentQuestion: questions[0],
            startTime: new Date(),
            responses: []
        };

        return session;
    }

    getQuestionsForType(type, company) {
        const questionSets = {
            behavioral: [
                {
                    question: "Tell me about a time when you had to work under pressure. How did you handle it?",
                    tips: "Use the STAR method: Situation, Task, Action, Result. Be specific about your actions.",
                    timeLimit: 3,
                    focusPoints: [
                        "🎯 Specific situation and context",
                        "⚡ Your specific actions and decisions",
                        "📊 Measurable results and outcomes",
                        "🧠 What you learned from the experience"
                    ]
                },
                {
                    question: "Describe a challenging project you worked on. What made it difficult and how did you overcome the obstacles?",
                    tips: "Focus on technical challenges and your problem-solving approach.",
                    timeLimit: 4,
                    focusPoints: [
                        "🔧 Technical complexity of the project",
                        "🤔 Specific obstacles you encountered",
                        "💡 Creative solutions you implemented",
                        "📈 Impact of your solutions"
                    ]
                }
            ],
            technical: [
                {
                    question: "How would you approach debugging a web application that's running slowly?",
                    tips: "Think systematically about performance bottlenecks and debugging tools.",
                    timeLimit: 5,
                    focusPoints: [
                        "🔍 Systematic debugging approach",
                        "🛠️ Tools and techniques you'd use",
                        "⚡ Common performance issues",
                        "📊 How you'd measure improvements"
                    ]
                },
                {
                    question: "Explain the difference between SQL and NoSQL databases. When would you use each?",
                    tips: "Compare structure, scalability, consistency, and use cases.",
                    timeLimit: 4,
                    focusPoints: [
                        "📊 Data structure differences",
                        "🔄 ACID vs BASE properties",
                        "📈 Scalability considerations",
                        "🎯 Real-world use case examples"
                    ]
                }
            ],
            system_design: [
                {
                    question: "Design a URL shortening service like bit.ly. What are the key components and considerations?",
                    tips: "Think about scale, database design, caching, and API endpoints.",
                    timeLimit: 8,
                    focusPoints: [
                        "🏗️ High-level architecture",
                        "💾 Database schema design",
                        "⚡ Caching strategy",
                        "📊 Scalability and performance"
                    ]
                }
            ],
            company: this.getCompanySpecificQuestions(company)
        };

        return questionSets[type] || questionSets.behavioral;
    }

    getCompanySpecificQuestions(company) {
        const companyQuestions = {
            google: [
                {
                    question: "Google values innovation and taking calculated risks. Tell me about a time you proposed or implemented an innovative solution.",
                    tips: "Focus on creative problem-solving and measured risk-taking.",
                    timeLimit: 4,
                    focusPoints: [
                        "💡 Innovation and creativity",
                        "📊 Data-driven decision making",
                        "🎯 User impact and value",
                        "🔄 Iteration and improvement"
                    ]
                }
            ],
            meta: [
                {
                    question: "Meta focuses on connecting people. How would you design a feature that brings people together?",
                    tips: "Think about user engagement, social dynamics, and technical implementation.",
                    timeLimit: 5,
                    focusPoints: [
                        "👥 Social interaction design",
                        "📱 User experience considerations",
                        "🔒 Privacy and safety measures",
                        "📈 Engagement metrics"
                    ]
                }
            ]
        };

        return companyQuestions[company?.toLowerCase()] || [
            {
                question: "Why do you want to work at this company, and how do you see yourself contributing to our mission?",
                tips: "Research the company's values, recent news, and connect your skills to their needs.",
                timeLimit: 3,
                focusPoints: [
                    "🎯 Company research and knowledge",
                    "💼 Alignment with company values",
                    "🚀 Your potential contributions",
                    "📈 Long-term career goals"
                ]
            }
        ];
    }

    async provideFeedback(sessionId, response) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const currentQuestion = session.currentQuestion;
            
            const prompt = `
You are an expert interview coach providing feedback on a candidate's response. Analyze this interview response and provide constructive feedback.

Question: ${currentQuestion.question}
Response: ${response}
Interview Type: ${session.type}

Provide feedback in JSON format:
{
    "score": number (1-10),
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "speakingTips": "advice on delivery and communication",
    "contentFeedback": "feedback on the substance of the answer",
    "nextSteps": "what to focus on for next question"
}

Focus on:
- Structure and clarity of response
- Use of specific examples
- Communication skills
- Technical accuracy (if applicable)
- STAR method usage (for behavioral questions)
`;

            const result = await this.model.generateContent(prompt);
            const feedbackText = await result.response.text();
            
            // Extract JSON from response
            const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const feedback = JSON.parse(jsonMatch[0]);
                
                // Store response and feedback
                session.responses.push({
                    question: currentQuestion.question,
                    response,
                    feedback,
                    timestamp: new Date()
                });

                return feedback;
            }

            return this.createFallbackFeedback();

        } catch (error) {
            console.error('Error providing feedback:', error);
            return this.createFallbackFeedback();
        }
    }

    createFallbackFeedback() {
        return {
            score: 7,
            strengths: [
                "✅ Engaged with the question",
                "✅ Provided a complete response"
            ],
            improvements: [
                "💡 Add more specific examples",
                "💡 Structure response using STAR method"
            ],
            speakingTips: "Speak clearly and at a measured pace. Use pauses effectively.",
            contentFeedback: "Good effort! Try to include more specific details and quantifiable results.",
            nextSteps: "Focus on being more specific in your next response."
        };
    }

    storeSession(userId, session) {
        this.activeSessions.set(`${userId}_${session.sessionId}`, session);
    }

    getSession(userId, sessionId) {
        return this.activeSessions.get(`${userId}_${sessionId}`);
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15);
    }

    nextQuestion(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return null;

        session.currentQuestionIndex++;
        if (session.currentQuestionIndex < session.questions.length) {
            session.currentQuestion = session.questions[session.currentQuestionIndex];
            return session.currentQuestion;
        }

        return null; // Interview complete
    }
}

module.exports = InterviewService;
