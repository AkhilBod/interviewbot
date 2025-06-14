const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pitch')
        .setDescription('Practice your elevator pitch with AI feedback')
        .addStringOption(option =>
            option.setName('pitch')
                .setDescription('Your elevator pitch (30-60 seconds when spoken)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const pitch = interaction.options.getString('pitch');
            const wordCount = pitch.split(' ').length;
            const estimatedTime = Math.round((wordCount / 150) * 60); // 150 words per minute average

            // Simple analysis
            const analysis = this.analyzePitch(pitch);

            const embed = new EmbedBuilder()
                .setTitle('🎤 Elevator Pitch Feedback')
                .setDescription('AI analysis of your elevator pitch!')
                .setColor(analysis.score >= 7 ? 0x00ff00 : analysis.score >= 5 ? 0xffa500 : 0xff0000)
                .addFields(
                    {
                        name: '📊 Quick Stats',
                        value: `**Words:** ${wordCount}\n**Est. Speaking Time:** ${estimatedTime} seconds\n**Score:** ${analysis.score}/10`,
                        inline: true
                    },
                    {
                        name: '🎯 Target Length',
                        value: '30-60 seconds\n(75-150 words)',
                        inline: true
                    },
                    {
                        name: '✅ Strengths',
                        value: analysis.strengths.join('\n'),
                        inline: false
                    },
                    {
                        name: '💡 Improvements',
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
                .setFooter({ text: 'InterviewBot • Perfect your pitch!' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in pitch command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while analyzing your pitch. Please try again.',
                ephemeral: true
            });
        }
    },

    analyzePitch(pitch) {
        const wordCount = pitch.split(' ').length;
        const sentences = pitch.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let score = 5;
        const strengths = [];
        const improvements = [];
        const actionItems = [];

        // Length analysis
        if (wordCount >= 75 && wordCount <= 150) {
            score += 2;
            strengths.push('✅ Good length for elevator pitch');
        } else if (wordCount < 75) {
            score -= 1;
            improvements.push('💡 Pitch is too short - add more details');
            actionItems.push('🎯 Expand on your key achievements');
        } else {
            score -= 1;
            improvements.push('💡 Pitch is too long - be more concise');
            actionItems.push('🎯 Focus on 2-3 key points maximum');
        }

        // Content analysis
        const hasName = /my name is|i'm|i am/i.test(pitch);
        const hasExperience = /experience|background|work|project/i.test(pitch);
        const hasSkills = /skill|technology|language|framework/i.test(pitch);
        const hasGoal = /looking for|seeking|interested in|goal/i.test(pitch);

        if (hasName) {
            strengths.push('✅ Includes self-introduction');
        } else {
            improvements.push('💡 Start with your name and role');
            actionItems.push('🎯 Begin with "Hi, I\'m [name] and I\'m a..."');
        }

        if (hasExperience) {
            score += 1;
            strengths.push('✅ Mentions relevant experience');
        } else {
            improvements.push('💡 Add your background/experience');
            actionItems.push('🎯 Include 1-2 key projects or experiences');
        }

        if (hasSkills) {
            score += 1;
            strengths.push('✅ Highlights technical skills');
        } else {
            improvements.push('💡 Mention key technical skills');
            actionItems.push('🎯 Include 2-3 relevant technologies');
        }

        if (hasGoal) {
            score += 1;
            strengths.push('✅ States career objectives');
        } else {
            improvements.push('💡 Clarify what you\'re looking for');
            actionItems.push('🎯 End with your career goal or ask');
        }

        // Ensure minimum content
        if (strengths.length === 0) {
            strengths.push('✅ You\'ve taken the first step!');
        }

        return {
            score: Math.max(1, Math.min(10, score)),
            strengths,
            improvements,
            actionItems
        };
    }
};
