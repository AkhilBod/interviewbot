const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const InterviewService = require('../services/InterviewService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mock-interview')
        .setDescription('Practice mock interviews with real-time AI feedback')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of interview practice')
                .setRequired(true)
                .addChoices(
                    { name: 'Behavioral Questions', value: 'behavioral' },
                    { name: 'Technical Questions', value: 'technical' },
                    { name: 'System Design', value: 'system_design' },
                    { name: 'Company-Specific', value: 'company' }
                ))
        .addStringOption(option =>
            option.setName('company')
                .setDescription('Target company (for company-specific practice)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const interviewType = interaction.options.getString('type');
            const targetCompany = interaction.options.getString('company');

            const interviewService = new InterviewService();
            const session = await interviewService.startMockInterview(interviewType, targetCompany);

            const embed = new EmbedBuilder()
                .setTitle('🎤 Mock Interview Session Started')
                .setDescription('Real-time feedback on your responses and speaking patterns!')
                .setColor(0x9932cc)
                .addFields(
                    {
                        name: '📋 Interview Type',
                        value: this.getInterviewTypeDescription(interviewType),
                        inline: true
                    },
                    {
                        name: '🏢 Target Company',
                        value: targetCompany || 'General',
                        inline: true
                    },
                    {
                        name: '❓ First Question',
                        value: `**${session.currentQuestion.question}**`,
                        inline: false
                    },
                    {
                        name: '💡 Tips for This Question',
                        value: session.currentQuestion.tips,
                        inline: false
                    },
                    {
                        name: '⏱️ Recommended Time',
                        value: `${session.currentQuestion.timeLimit} minutes`,
                        inline: true
                    },
                    {
                        name: '🎯 What to Focus On',
                        value: session.currentQuestion.focusPoints.join('\n'),
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Session ID: ${session.sessionId} • Use /interview-feedback to get AI analysis`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

            // Store session for follow-up commands
            interviewService.storeSession(interaction.user.id, session);

        } catch (error) {
            console.error('Error in mock-interview command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while starting the mock interview. Please try again.',
                ephemeral: true
            });
        }
    },

    getInterviewTypeDescription(type) {
        const descriptions = {
            'behavioral': '🎭 Behavioral & Situational Questions',
            'technical': '💻 Technical & Problem-Solving',
            'system_design': '🏗️ System Design & Architecture',
            'company': '🏢 Company Culture & Values'
        };
        return descriptions[type] || '📝 General Interview Practice';
    }
};
