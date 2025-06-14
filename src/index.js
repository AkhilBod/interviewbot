const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
require('dotenv').config();

const DailyQuestionService = require('./services/DailyQuestionService');
const InternshipService = require('./services/InternshipService');

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Ready event
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    setupDailySchedules();
});

// Command interaction handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Setup daily schedules
function setupDailySchedules() {
    // Daily internships at 9 AM EST
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily internship scraper...');
        const internshipService = new InternshipService();
        await internshipService.postDailyInternships(client);
    }, {
        timezone: "America/New_York"
    });

    // Daily behavioral question at 10 AM EST
    cron.schedule('0 10 * * *', async () => {
        console.log('Posting daily behavioral question...');
        const questionService = new DailyQuestionService();
        await questionService.postDailyBehavioralQuestion(client);
    }, {
        timezone: "America/New_York"
    });

    // Daily LeetCode problem at 11 AM EST
    cron.schedule('0 11 * * *', async () => {
        console.log('Posting daily LeetCode problem...');
        const questionService = new DailyQuestionService();
        await questionService.postDailyLeetCodeProblem(client);
    }, {
        timezone: "America/New_York"
    });
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
