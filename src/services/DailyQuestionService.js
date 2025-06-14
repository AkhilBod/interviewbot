const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

class DailyQuestionService {
    constructor() {
        this.behavioralChannelId = process.env.BEHAVIORAL_CHANNEL_ID || 'general';
        this.leetcodeChannelId = process.env.LEETCODE_CHANNEL_ID || 'general';
    }

    async postDailyBehavioralQuestion(client) {
        try {
            const question = this.getBehavioralQuestion();
            
            const channel = client.channels.cache.get(this.behavioralChannelId) || 
                           client.channels.cache.find(ch => ch.name === 'behavioral-questions') ||
                           client.channels.cache.find(ch => ch.name === 'general');

            if (!channel) {
                console.error('Could not find behavioral questions channel');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('🎭 Daily Behavioral Question')
                .setDescription('Practice with new scenarios every day using the STAR method!')
                .setColor(0x00ff00)
                .addFields(
                    { 
                        name: '❓ Today\'s Question', 
                        value: `**${question.question}**`, 
                        inline: false 
                    },
                    { 
                        name: '🌟 STAR Method Reminder', 
                        value: '**S**ituation - **T**ask - **A**ction - **R**esult\n\nStructure your answer using this framework!', 
                        inline: false 
                    },
                    { 
                        name: '💡 Tips', 
                        value: question.tips, 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'InterviewBot • Daily Behavioral Questions' });

            await channel.send({ embeds: [embed] });
            console.log('Daily behavioral question posted successfully');

        } catch (error) {
            console.error('Error posting behavioral question:', error);
        }
    }

    async postDailyLeetCodeProblem(client) {
        try {
            const problem = await this.getLeetCodeProblem();
            
            const channel = client.channels.cache.get(this.leetcodeChannelId) || 
                           client.channels.cache.find(ch => ch.name === 'leetcode') ||
                           client.channels.cache.find(ch => ch.name === 'coding-practice') ||
                           client.channels.cache.find(ch => ch.name === 'general');

            if (!channel) {
                console.error('Could not find LeetCode channel');
                return;
            }

            const difficultyColor = {
                'Easy': 0x00ff00,
                'Medium': 0xffa500,
                'Hard': 0xff0000
            };

            const embed = new EmbedBuilder()
                .setTitle('💻 Daily LeetCode Challenge')
                .setDescription('Daily coding challenges with instant AI coaching!')
                .setColor(difficultyColor[problem.difficulty] || 0x0066cc)
                .addFields(
                    { 
                        name: '🧩 Problem', 
                        value: `**${problem.title}**`, 
                        inline: false 
                    },
                    { 
                        name: '📊 Difficulty', 
                        value: problem.difficulty, 
                        inline: true 
                    },
                    { 
                        name: '🏷️ Topics', 
                        value: problem.topics.join(', '), 
                        inline: true 
                    },
                    { 
                        name: '📝 Description', 
                        value: problem.description, 
                        inline: false 
                    },
                    { 
                        name: '💡 Hint', 
                        value: problem.hint, 
                        inline: false 
                    },
                    { 
                        name: '🔗 Solve It', 
                        value: `[LeetCode Link](${problem.link})`, 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'InterviewBot • Daily LeetCode Practice' });

            await channel.send({ embeds: [embed] });
            console.log('Daily LeetCode problem posted successfully');

        } catch (error) {
            console.error('Error posting LeetCode problem:', error);
        }
    }

    getBehavioralQuestion() {
        const questions = [
            {
                question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
                tips: "Focus on communication, empathy, and finding common ground. Show how you maintained professionalism."
            },
            {
                question: "Describe a situation where you had to learn a new technology or skill quickly. What was your approach?",
                tips: "Highlight your learning process, resources used, and how you applied the new knowledge effectively."
            },
            {
                question: "Tell me about a time when you failed at something. What did you learn from it?",
                tips: "Be honest about the failure, focus on lessons learned, and demonstrate growth mindset."
            },
            {
                question: "Describe a time when you had to meet a tight deadline. How did you manage your time and priorities?",
                tips: "Show your time management skills, prioritization methods, and ability to work under pressure."
            },
            {
                question: "Tell me about a project you're particularly proud of. What made it special?",
                tips: "Choose a project that showcases relevant skills and explain your specific contributions."
            },
            {
                question: "Describe a time when you had to give constructive feedback to a peer or team member.",
                tips: "Focus on your communication approach, being respectful, and the positive outcome."
            },
            {
                question: "Tell me about a time when you disagreed with your manager or supervisor. How did you handle it?",
                tips: "Show respect for authority while demonstrating your ability to voice concerns professionally."
            },
            {
                question: "Describe a situation where you had to adapt to a significant change at work or school.",
                tips: "Highlight your flexibility, positive attitude, and ability to thrive in changing environments."
            }
        ];

        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return questions[dayOfYear % questions.length];
    }

    async getLeetCodeProblem() {
        try {
            // Try to get daily LeetCode problem from their API
            const response = await axios.get('https://leetcode.com/api/problems/all/');
            const problems = response.data.stat_status_pairs;
            
            // Filter for appropriate difficulty and randomly select
            const easyProblems = problems.filter(p => p.difficulty.level === 1 && !p.paid_only);
            const mediumProblems = problems.filter(p => p.difficulty.level === 2 && !p.paid_only);
            
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // Alternate between easy and medium problems
            const selectedProblems = dayOfYear % 2 === 0 ? easyProblems : mediumProblems;
            const problem = selectedProblems[dayOfYear % selectedProblems.length];
            
            return {
                title: problem.stat.question__title,
                difficulty: problem.difficulty.level === 1 ? 'Easy' : 'Medium',
                topics: ['Array', 'Hash Table'], // Simplified topics
                description: `Problem #${problem.stat.frontend_question_id}`,
                hint: "Think about the time and space complexity of your solution!",
                link: `https://leetcode.com/problems/${problem.stat.question__title_slug}/`
            };
            
        } catch (error) {
            console.error('Error fetching LeetCode problem:', error);
            return this.getFallbackLeetCodeProblem();
        }
    }

    getFallbackLeetCodeProblem() {
        const problems = [
            {
                title: "Two Sum",
                difficulty: "Easy",
                topics: ["Array", "Hash Table"],
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                hint: "Consider using a hash map to store the complement of each number.",
                link: "https://leetcode.com/problems/two-sum/"
            },
            {
                title: "Valid Parentheses",
                difficulty: "Easy",
                topics: ["String", "Stack"],
                description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                hint: "Use a stack data structure to keep track of opening brackets.",
                link: "https://leetcode.com/problems/valid-parentheses/"
            },
            {
                title: "Merge Two Sorted Lists",
                difficulty: "Easy",
                topics: ["Linked List", "Recursion"],
                description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted fashion.",
                hint: "Compare the values of the current nodes and choose the smaller one.",
                link: "https://leetcode.com/problems/merge-two-sorted-lists/"
            }
        ];

        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return problems[dayOfYear % problems.length];
    }
}

module.exports = DailyQuestionService;
