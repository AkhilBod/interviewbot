const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('goals')
        .setDescription('Set and track your career goals')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new career goal')
                .addStringOption(option =>
                    option.setName('goal')
                        .setDescription('Your career goal')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('deadline')
                        .setDescription('Target deadline (e.g., "3 months", "by June 2025")')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your current goals'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('complete')
                .setDescription('Mark a goal as completed')
                .addStringOption(option =>
                    option.setName('goal_id')
                        .setDescription('Goal ID to mark complete')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'set':
                await this.setGoal(interaction);
                break;
            case 'view':
                await this.viewGoals(interaction);
                break;
            case 'complete':
                await this.completeGoal(interaction);
                break;
        }
    },

    async setGoal(interaction) {
        const goal = interaction.options.getString('goal');
        const deadline = interaction.options.getString('deadline') || 'No deadline set';

        // In a real implementation, you'd save this to a database
        const goalId = Math.random().toString(36).substring(2, 8);

        const embed = new EmbedBuilder()
            .setTitle('🎯 Goal Set Successfully!')
            .setDescription('Your career goal has been added to your tracker.')
            .setColor(0x00ff00)
            .addFields(
                {
                    name: '🎯 Goal',
                    value: goal,
                    inline: false
                },
                {
                    name: '📅 Deadline',
                    value: deadline,
                    inline: true
                },
                {
                    name: '🆔 Goal ID',
                    value: goalId,
                    inline: true
                },
                {
                    name: '💡 Next Steps',
                    value: '• Break this goal into smaller tasks\n• Set weekly milestones\n• Use `/goals view` to check progress\n• Celebrate small wins along the way!',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'InterviewBot • Goal Tracker' });

        await interaction.reply({ embeds: [embed] });
    },

    async viewGoals(interaction) {
        // In a real implementation, you'd fetch from database
        const sampleGoals = [
            {
                id: 'abc123',
                goal: 'Land a software engineering role at a top tech company',
                deadline: 'by June 2025',
                status: 'In Progress',
                progress: '60%'
            },
            {
                id: 'def456',
                goal: 'Complete 100 LeetCode problems',
                deadline: 'in 2 months',
                status: 'In Progress',
                progress: '35%'
            }
        ];

        const embed = new EmbedBuilder()
            .setTitle('🎯 Your Career Goals')
            .setDescription('Track your progress toward landing your dream job!')
            .setColor(0x0066cc)
            .setTimestamp()
            .setFooter({ text: 'InterviewBot • Stay focused on your goals!' });

        if (sampleGoals.length === 0) {
            embed.addFields({
                name: '📝 No Goals Set',
                value: 'Use `/goals set` to add your first career goal!',
                inline: false
            });
        } else {
            sampleGoals.forEach((goal, index) => {
                embed.addFields({
                    name: `${index + 1}. ${goal.goal}`,
                    value: `**Deadline:** ${goal.deadline}\n**Status:** ${goal.status}\n**Progress:** ${goal.progress}\n**ID:** ${goal.id}`,
                    inline: false
                });
            });

            embed.addFields({
                name: '🚀 Keep Going!',
                value: 'Use `/goals complete <goal_id>` when you achieve a goal!',
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async completeGoal(interaction) {
        const goalId = interaction.options.getString('goal_id');

        // In a real implementation, you'd update the database
        const embed = new EmbedBuilder()
            .setTitle('🎉 Goal Completed!')
            .setDescription('Congratulations on achieving your goal!')
            .setColor(0x00ff00)
            .addFields(
                {
                    name: '✅ Completed Goal',
                    value: `Goal ID: ${goalId}`,
                    inline: false
                },
                {
                    name: '🎊 Celebration Time!',
                    value: 'You\'re one step closer to your dream career!\n\n• Share your success with the community\n• Set your next goal\n• Keep the momentum going!',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'InterviewBot • Celebrating your success!' });

        await interaction.reply({ embeds: [embed] });
    }
};
