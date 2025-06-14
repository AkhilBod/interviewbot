const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const InterviewService = require('../services/InterviewService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interview-feedback')
        .setDescription('Get AI feedback on your interview response')
        .addStringOption(option =>
            option.setName('response')
                .setDescription('Your answer to the current interview question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('session')
                .setDescription('Your session ID from the mock interview')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = interaction.options.getString('response');
            const sessionId = interaction.options.getString('session');

            const interviewService = new InterviewService();
            
            // Try to find active session
            const userSessionId = sessionId || `${interaction.user.id}_latest`;
            const feedback = await interviewService.provideFeedback(userSessionId, response);

            if (!feedback) {
                return await interaction.editReply({
                    content: '❌ Could not find your interview session. Please start a new mock interview with `/mock-interview`.',
                    ephemeral: true
                });
            }

            const scoreColor = feedback.score >= 8 ? 0x00ff00 : feedback.score >= 6 ? 0xffa500 : 0xff0000;
            const scoreEmoji = feedback.score >= 8 ? '🌟' : feedback.score >= 6 ? '👍' : '📈';

            const embed = new EmbedBuilder()
                .setTitle('🎯 Interview Response Feedback')
                .setDescription('Real-time AI analysis of your interview performance!')
                .setColor(scoreColor)
                .addFields(
                    {
                        name: `${scoreEmoji} Overall Score`,
                        value: `**${feedback.score}/10**`,
                        inline: true
                    },
                    {
                        name: '📊 Response Length',
                        value: `${response.split(' ').length} words`,
                        inline: true
                    },
                    {
                        name: '⭐ Strengths',
                        value: feedback.strengths.join('\n'),
                        inline: false
                    },
                    {
                        name: '🎯 Areas for Improvement',
                        value: feedback.improvements.join('\n'),
                        inline: false
                    },
                    {
                        name: '🎤 Speaking & Delivery Tips',
                        value: feedback.speakingTips,
                        inline: false
                    },
                    {
                        name: '💭 Content Feedback',
                        value: feedback.contentFeedback,
                        inline: false
                    },
                    {
                        name: '🚀 Next Steps',
                        value: feedback.nextSteps,
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Feedback by InterviewBot • Keep practicing!`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            // Add next question if available
            const nextQuestion = interviewService.nextQuestion(userSessionId);
            if (nextQuestion) {
                embed.addFields({
                    name: '❓ Next Question',
                    value: `**${nextQuestion.question}**\n\n💡 ${nextQuestion.tips}`,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '🎉 Interview Complete!',
                    value: 'Great job! Use `/mock-interview` to practice more questions.',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in interview-feedback command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while analyzing your response. Please try again.',
                ephemeral: true
            });
        }
    },
};
