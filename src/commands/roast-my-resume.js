const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const ResumeAnalysisService = require('../services/ResumeAnalysisService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast-my-resume')
        .setDescription('Get brutally honest AI feedback to make your resume stand out')
        .addAttachmentOption(option =>
            option.setName('resume')
                .setDescription('Upload your resume (PDF format)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const attachment = interaction.options.getAttachment('resume');
            
            if (!attachment) {
                return await interaction.editReply({
                    content: '❌ Please attach your resume as a PDF file.',
                    ephemeral: true
                });
            }

            // Validate file type
            if (!attachment.name.toLowerCase().endsWith('.pdf')) {
                return await interaction.editReply({
                    content: '❌ Please upload a PDF file only.',
                    ephemeral: true
                });
            }

            // Validate file size (max 10MB)
            if (attachment.size > 10 * 1024 * 1024) {
                return await interaction.editReply({
                    content: '❌ File too large. Please upload a resume smaller than 10MB.',
                    ephemeral: true
                });
            }

            const resumeService = new ResumeAnalysisService();
            const analysis = await resumeService.analyzeResume(attachment.url);

            if (!analysis) {
                return await interaction.editReply({
                    content: '❌ Sorry, I couldn\'t analyze your resume. Please try again.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🔥 Resume Roast Session')
                .setDescription('Brutally honest AI feedback to make your resume stand out!')
                .setColor(0xff4500)
                .addFields(
                    {
                        name: '📊 Overall Score',
                        value: `**${analysis.score}/10**\n${analysis.scoreDescription}`,
                        inline: true
                    },
                    {
                        name: '⚡ Quick Assessment',
                        value: analysis.quickAssessment,
                        inline: true
                    },
                    {
                        name: '✅ Strengths',
                        value: analysis.strengths.join('\n'),
                        inline: false
                    },
                    {
                        name: '🚨 Critical Issues',
                        value: analysis.criticalIssues.join('\n'),
                        inline: false
                    },
                    {
                        name: '💡 Improvement Suggestions',
                        value: analysis.improvements.join('\n'),
                        inline: false
                    },
                    {
                        name: '🎯 Action Items',
                        value: analysis.actionItems.join('\n'),
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Roasted by InterviewBot • Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            // Add ATS optimization tips
            if (analysis.atsScore < 8) {
                embed.addFields({
                    name: '🤖 ATS Optimization',
                    value: `**ATS Score: ${analysis.atsScore}/10**\n${analysis.atsAdvice}`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in roast-my-resume command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while analyzing your resume. Please try again.',
                ephemeral: true
            });
        }
    },
};
