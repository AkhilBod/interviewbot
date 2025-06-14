const { spawn } = require('child_process');

function startBot() {
    console.log('Starting InterviewBot...');
    
    const bot = spawn('npm', ['start'], {
        stdio: 'inherit',
        cwd: __dirname
    });

    bot.on('close', (code) => {
        console.log(`Bot exited with code ${code}. Restarting in 5 seconds...`);
        setTimeout(startBot, 5000);
    });

    bot.on('error', (error) => {
        console.error('Error starting bot:', error);
        setTimeout(startBot, 5000);
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    process.exit(0);
});

startBot();
