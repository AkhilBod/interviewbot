const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DailyQuestionService = require('../services/DailyQuestionService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily-question')
        .setDescription('Get a behavioral interview question to practice with'),

    async execute(interaction) {
        const questionService = new DailyQuestionService();
        const question = questionService.getBehavioralQuestion();

        const embed = new EmbedBuilder()
            .setTitle('🎭 Practice Behavioral Question')
            .setDescription('Practice with the STAR method!')
            .setColor(0x00ff00)
            .addFields(
                { 
                    name: '❓ Question', 
                    value: `**${question.question}**`, 
                    inline: false 
                },
                { 
                    name: '🌟 STAR Method', 
                    value: '**S**ituation - **T**ask - **A**ction - **R**esult', 
                    inline: false 
                },
                { 
                    name: '💡 Tips', 
                    value: question.tips, 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'InterviewBot • Use /mock-interview for full practice sessions' });

        await interaction.reply({ embeds: [embed] });
    },
};
