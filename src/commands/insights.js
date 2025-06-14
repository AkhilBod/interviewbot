const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insights')
        .setDescription('Get personalized career insights and industry trends')
        .addStringOption(option =>
            option.setName('focus')
                .setDescription('What area would you like insights on?')
                .setRequired(false)
                .addChoices(
                    { name: 'Job Market Trends', value: 'market' },
                    { name: 'Skill Development', value: 'skills' },
                    { name: 'Interview Preparation', value: 'interview' },
                    { name: 'Resume Optimization', value: 'resume' },
                    { name: 'Salary Negotiation', value: 'salary' }
                )),

    async execute(interaction) {
        const focus = interaction.options.getString('focus') || 'general';
        const insights = this.getInsights(focus);

        const embed = new EmbedBuilder()
            .setTitle(`💡 Career Insights: ${insights.title}`)
            .setDescription(insights.description)
            .setColor(0x9932cc)
            .setTimestamp()
            .setFooter({ text: 'InterviewBot • Personalized Career Guidance' });

        insights.sections.forEach(section => {
            embed.addFields({
                name: section.name,
                value: section.value,
                inline: section.inline || false
            });
        });

        await interaction.reply({ embeds: [embed] });
    },

    getInsights(focus) {
        const insightData = {
            market: {
                title: 'Job Market Trends',
                description: 'Current trends and opportunities in the tech job market for new grads',
                sections: [
                    {
                        name: '📈 Hot Technologies 2025',
                        value: '• **AI/ML:** High demand for Python, TensorFlow, PyTorch\n• **Cloud:** AWS, Azure, GCP certifications valuable\n• **Full-Stack:** React, Node.js, TypeScript trending\n• **Mobile:** Flutter, React Native growing\n• **DevOps:** Docker, Kubernetes, CI/CD essential'
                    },
                    {
                        name: '🏢 Top Hiring Companies',
                        value: '• **Big Tech:** Google, Meta, Amazon, Microsoft\n• **Unicorns:** Stripe, Discord, Figma, OpenAI\n• **Traditional:** Banks, Healthcare, Government\n• **Startups:** Y Combinator companies actively hiring'
                    },
                    {
                        name: '💰 Salary Ranges (New Grad)',
                        value: '• **SF Bay Area:** $140k-180k total comp\n• **Seattle:** $120k-160k total comp\n• **NYC:** $130k-170k total comp\n• **Austin/Denver:** $100k-140k total comp\n• **Remote:** $90k-130k base salary'
                    }
                ]
            },
            skills: {
                title: 'Skill Development',
                description: 'Focus areas to make yourself more competitive',
                sections: [
                    {
                        name: '🎯 Essential Skills 2025',
                        value: '• **Programming:** Master 2-3 languages deeply\n• **System Design:** Learn scalability basics\n• **Databases:** SQL + one NoSQL (MongoDB/Redis)\n• **Version Control:** Git workflow mastery\n• **Testing:** Unit testing, integration testing'
                    },
                    {
                        name: '📚 Learning Path Recommendations',
                        value: '1. **Foundations:** Data structures & algorithms\n2. **Web Development:** Full-stack project\n3. **Cloud Basics:** Deploy something to AWS/GCP\n4. **Open Source:** Contribute to projects\n5. **Soft Skills:** Communication, teamwork'
                    },
                    {
                        name: '⏰ Time Investment',
                        value: '• **Daily:** 2-3 hours coding practice\n• **Weekly:** 1 new concept or technology\n• **Monthly:** Complete one substantial project\n• **Quarterly:** Learn one new framework/tool'
                    }
                ]
            },
            interview: {
                title: 'Interview Preparation',
                description: 'Strategies to ace your technical and behavioral interviews',
                sections: [
                    {
                        name: '💻 Technical Interview Prep',
                        value: '• **LeetCode:** 150+ problems (focus on mediums)\n• **System Design:** Grokking the System Design\n• **Mock Interviews:** Pramp, InterviewBit\n• **Code Reviews:** Practice explaining your code\n• **Time Management:** 45-min problem solving'
                    },
                    {
                        name: '🎭 Behavioral Interview Strategy',
                        value: '• **STAR Method:** Situation, Task, Action, Result\n• **Story Bank:** 5-7 prepared stories\n• **Company Research:** Mission, values, recent news\n• **Questions Ready:** Always ask thoughtful questions\n• **Practice Out Loud:** Record yourself'
                    },
                    {
                        name: '📅 Timeline (8-12 weeks)',
                        value: '• **Weeks 1-4:** Algorithm practice daily\n• **Weeks 5-6:** System design basics\n• **Weeks 7-8:** Mock interviews weekly\n• **Weeks 9-12:** Company-specific preparation'
                    }
                ]
            },
            resume: {
                title: 'Resume Optimization',
                description: 'Make your resume stand out in the applicant tracking system',
                sections: [
                    {
                        name: '📋 Resume Structure',
                        value: '• **Header:** Name, email, phone, LinkedIn, GitHub\n• **Summary:** 2-3 lines highlighting key skills\n• **Education:** GPA if >3.5, relevant coursework\n• **Projects:** 3-4 substantial projects\n• **Experience:** Internships, part-time work\n• **Skills:** Technologies organized by category'
                    },
                    {
                        name: '🎯 ATS Optimization',
                        value: '• **Keywords:** Match job description language\n• **Format:** Use standard fonts, no graphics\n• **File Type:** PDF preferred over Word\n• **Length:** 1 page for new grads\n• **Sections:** Use standard headings'
                    },
                    {
                        name: '✨ Impact Statements',
                        value: '• Use action verbs (Built, Implemented, Optimized)\n• Include metrics when possible (20% faster)\n• Focus on outcomes, not just tasks\n• Highlight technologies used\n• Show progression and growth'
                    }
                ]
            },
            salary: {
                title: 'Salary Negotiation',
                description: 'Maximize your compensation package as a new grad',
                sections: [
                    {
                        name: '💰 Total Compensation Components',
                        value: '• **Base Salary:** Your annual guaranteed pay\n• **Signing Bonus:** One-time payment ($5k-25k)\n• **Stock Options/RSUs:** Equity in the company\n• **Benefits:** Health, 401k, PTO, perks\n• **Relocation:** Moving expenses coverage'
                    },
                    {
                        name: '🎯 Negotiation Strategy',
                        value: '• **Research:** Use Levels.fyi, Glassdoor data\n• **Multiple Offers:** Create competition\n• **Total Package:** Focus on 4-year value\n• **Non-Salary:** Negotiate start date, vacation\n• **Professional:** Be grateful but advocate'
                    },
                    {
                        name: '📈 Negotiation Timeline',
                        value: '1. **Receive offer:** Thank them, ask for time\n2. **Research:** Gather market data (24-48 hours)\n3. **Counter:** Professional email with rationale\n4. **Discuss:** Phone call to work through details\n5. **Accept:** Written confirmation of final terms'
                    }
                ]
            },
            general: {
                title: 'General Career Guidance',
                description: 'Comprehensive insights for new grad success',
                sections: [
                    {
                        name: '🚀 Career Success Framework',
                        value: '• **Technical Excellence:** Strong coding foundation\n• **Communication:** Explain complex ideas simply\n• **Continuous Learning:** Stay current with trends\n• **Network Building:** Connect with peers and mentors\n• **Personal Branding:** LinkedIn, GitHub, portfolio'
                    },
                    {
                        name: '⚡ Quick Wins This Week',
                        value: '• Update LinkedIn with recent projects\n• Solve 3 LeetCode problems\n• Apply to 5 positions\n• Reach out to 2 industry professionals\n• Practice one behavioral answer'
                    },
                    {
                        name: '🎯 90-Day Action Plan',
                        value: '• **Month 1:** Resume optimization, skill assessment\n• **Month 2:** Interview preparation, networking\n• **Month 3:** Active applications, practice interviews\n• **Ongoing:** Daily coding, weekly applications'
                    }
                ]
            }
        };

        return insightData[focus] || insightData.general;
    }
};
