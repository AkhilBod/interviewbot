const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands and features'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 InterviewBot - Your New Grad Career Coach')
            .setDescription('Everything you need to land your dream job!')
            .setColor(0x0066cc)
            .addFields(
                {
                    name: '📈 Daily Features (Automated)',
                    value: '🎯 **Daily Fresh Internships** - Curated opportunities delivered every morning\n' +
                           '🎭 **Daily Behavioral Questions** - Practice STAR method scenarios\n' +
                           '💻 **Daily LeetCode Problems** - Coding challenges with AI coaching',
                    inline: false
                },
                {
                    name: '🔧 Interactive Commands',
                    value: '`/roast-my-resume` - Get brutally honest AI feedback on your resume\n' +
                           '`/mock-interview` - Practice interviews with real-time feedback\n' +
                           '`/interview-feedback` - Get AI analysis of your responses\n' +
                           '`/daily-question` - Get a behavioral question anytime\n' +
                           '`/pitch` - Practice your elevator pitch\n' +
                           '`/goals` - Set and track your career goals\n' +
                           '`/insights` - Get personalized career insights',
                    inline: false
                },
                {
                    name: '🎯 Resume Roasting Sessions',
                    value: '• Upload your resume as PDF\n' +
                           '• Get detailed scoring (1-10)\n' +
                           '• Identify critical issues\n' +
                           '• Receive ATS optimization tips\n' +
                           '• Get specific action items',
                    inline: true
                },
                {
                    name: '🎤 Mock Interview Practice',
                    value: '• Behavioral questions\n' +
                           '• Technical interviews\n' +
                           '• System design practice\n' +
                           '• Company-specific prep\n' +
                           '• Real-time AI feedback',
                    inline: true
                },
                {
                    name: '💡 What Makes InterviewBot Special',
                    value: '✅ **Daily Fresh Content** - Never run out of practice material\n' +
                           '✅ **AI-Powered Feedback** - Instant, detailed analysis\n' +
                           '✅ **New Grad Focused** - Tailored for entry-level positions\n' +
                           '✅ **Community Support** - Learn together with peers\n' +
                           '✅ **Comprehensive Prep** - Resume, interviews, coding, and more',
                    inline: false
                },
                {
                    name: '🚀 Getting Started',
                    value: '1. Use `/roast-my-resume` to optimize your resume\n' +
                           '2. Practice daily with `/mock-interview`\n' +
                           '3. Solve daily LeetCode problems\n' +
                           '4. Answer behavioral questions using STAR method\n' +
                           '5. Stay updated with daily internship opportunities',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: 'InterviewBot • Your path to landing that dream job!',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    },
};
