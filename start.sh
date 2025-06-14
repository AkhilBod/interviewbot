#!/bin/bash

echo "🤖 InterviewBot Setup Script"
echo "=========================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and add your tokens:"
    echo "  - DISCORD_TOKEN"
    echo "  - CLIENT_ID" 
    echo "  - GEMINI_API_KEY"
    exit 1
fi

# Check for required environment variables
source .env
if [ -z "$DISCORD_TOKEN" ] || [ -z "$CLIENT_ID" ] || [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Missing required environment variables in .env file"
    echo "Please ensure you have:"
    echo "  - DISCORD_TOKEN=your_discord_bot_token"
    echo "  - CLIENT_ID=your_application_id"
    echo "  - GEMINI_API_KEY=your_gemini_api_key"
    exit 1
fi

echo "✅ Environment variables found"

# Deploy commands
echo "📤 Deploying slash commands..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Commands deployed successfully!"
    echo "🚀 Starting InterviewBot..."
    npm start
else
    echo "❌ Failed to deploy commands. Please check your Discord token and client ID."
    exit 1
fi
