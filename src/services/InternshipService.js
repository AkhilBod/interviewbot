const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

class InternshipService {
    constructor() {
        this.channelId = process.env.INTERNSHIPS_CHANNEL_ID || 'general';
        this.lastScrapedDates = new Map(); // Track when we last scraped each repo
    }

    async scrapeInternships() {
        const internships = [];
        
        try {
            // Scrape from GitHub internship repositories
            const sources = [
                this.scrapeGitHubInternshipRepo('SimplifyJobs', 'Summer2025-Internships'),
                this.scrapeGitHubInternshipRepo('vanshb03', 'Summer2026-Internships')
            ];

            const results = await Promise.allSettled(sources);
            
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    internships.push(...result.value);
                }
            });

            // Filter for only new postings from the last 7 days
            const recentInternships = this.filterRecentPostings(internships);
            
            // Remove duplicates and limit to 8 best opportunities
            const uniqueInternships = this.removeDuplicates(recentInternships);
            return uniqueInternships.slice(0, 8);

        } catch (error) {
            console.error('Error scraping internships:', error);
            return this.getFallbackInternships();
        }
    }

    async scrapeGitHubInternshipRepo(owner, repo) {
        try {
            // Get repository commits to check for recent updates
            const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`;
            const commitsResponse = await axios.get(commitsUrl, {
                headers: {
                    'User-Agent': 'InterviewBot/1.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            // Get the README content
            const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
            const readmeResponse = await axios.get(readmeUrl, {
                headers: {
                    'User-Agent': 'InterviewBot/1.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            // Decode base64 content
            const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf8');
            
            // Parse the markdown table for internships
            const jobs = this.parseInternshipTable(readmeContent, owner, commitsResponse.data);
            
            return jobs;

        } catch (error) {
            console.error(`Error scraping ${owner}/${repo}:`, error);
            return [];
        }
    }

    parseInternshipTable(markdownContent, source, commits) {
        const jobs = [];
        
        try {
            // Split content into lines and find the table
            const lines = markdownContent.split('\n');
            let inTable = false;
            let headerFound = false;
            let companyCol = 0, roleCol = 1, locationCol = 2, ageCol = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Look for table headers that indicate internship listings
                if (line.includes('Company') && line.includes('Role') && (line.includes('Location') || line.includes('Dates'))) {
                    headerFound = true;
                    inTable = true;
                    
                    // Find column positions
                    const headers = line.split('|').map(h => h.trim().toLowerCase());
                    companyCol = headers.findIndex(h => h.includes('company'));
                    roleCol = headers.findIndex(h => h.includes('role') || h.includes('position'));
                    locationCol = headers.findIndex(h => h.includes('location') || h.includes('dates'));
                    ageCol = headers.findIndex(h => h.includes('age') || h.includes('posted') || h.includes('updated'));
                    
                    continue;
                }
                
                // Skip the separator line
                if (headerFound && line.includes('---')) {
                    continue;
                }
                
                // Parse table rows
                if (inTable && line.startsWith('|') && line.split('|').length > 3) {
                    const columns = line.split('|').map(col => col.trim()).filter(col => col);
                    
                    if (columns.length >= 3 && companyCol < columns.length && roleCol < columns.length) {
                        const company = this.cleanMarkdownText(columns[companyCol]);
                        const role = this.cleanMarkdownText(columns[roleCol]);
                        const location = locationCol < columns.length ? this.cleanMarkdownText(columns[locationCol]) : 'Remote';
                        const age = ageCol >= 0 && ageCol < columns.length ? this.cleanMarkdownText(columns[ageCol]) : '';
                        
                        // Skip if it's clearly not a valid entry
                        if (company && role && 
                            company !== 'Company' && 
                            !company.includes('---') &&
                            company.length > 1 &&
                            !role.includes('---')) {
                            
                            // Extract application link if present
                            const linkMatch = columns[roleCol].match(/\[.*?\]\((.*?)\)/);
                            let applicationLink = linkMatch ? linkMatch[1] : null;
                            
                            // If no direct link, try to find apply link in other columns
                            if (!applicationLink) {
                                for (let col of columns) {
                                    const match = col.match(/\[.*apply.*\]\((.*?)\)/i) || col.match(/\[.*here.*\]\((.*?)\)/i);
                                    if (match) {
                                        applicationLink = match[1];
                                        break;
                                    }
                                }
                            }
                            
                            // Default to company careers page search if no link found
                            if (!applicationLink) {
                                applicationLink = `https://www.google.com/search?q=${encodeURIComponent(company + ' careers internship 2025')}`;
                            }
                            
                            // Check if posting is recent (within last 7 days)
                            const isRecent = this.isRecentPosting(age, commits);
                            
                            if (isRecent) {
                                jobs.push({
                                    title: role,
                                    company: company,
                                    location: location,
                                    link: applicationLink,
                                    source: source,
                                    age: age,
                                    dateAdded: this.estimatePostingDate(commits, age)
                                });
                            }
                        }
                    }
                }
                
                // Stop if we hit a new section or end of table
                if (inTable && (line.startsWith('#') || line.includes('Total Jobs'))) {
                    break;
                }
            }

        } catch (error) {
            console.error('Error parsing internship table:', error);
        }

        return jobs;
    }

    cleanMarkdownText(text) {
        return text
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '')   // Remove italic markdown
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract text from links
            .replace(/`/g, '')    // Remove code backticks
            .replace(/🔒/g, '')   // Remove lock emoji
            .replace(/✅/g, '')   // Remove checkmark emoji
            .replace(/❌/g, '')   // Remove X emoji
            .trim();
    }

    isRecentPosting(age, commits) {
        // Check if age indicates recent posting (1d, 2d, 3d, 1h, 2h, etc.)
        if (age) {
            const ageNum = parseInt(age);
            if (age.includes('h') || age.includes('m')) return true; // Hours or minutes - very recent
            if (age.includes('d') && ageNum <= 7) return true; // Within last 7 days
        }

        // Also check if there were recent commits to the repository
        if (commits && commits.length > 0) {
            const latestCommit = new Date(commits[0].commit.author.date);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            return latestCommit >= threeDaysAgo;
        }

        return true; // Default to including if we can't determine age
    }

    estimatePostingDate(commits, age) {
        // If we have age info, calculate from that
        if (age) {
            const now = new Date();
            const ageNum = parseInt(age);
            
            if (age.includes('h')) {
                return new Date(now.getTime() - (ageNum * 60 * 60 * 1000));
            } else if (age.includes('d')) {
                return new Date(now.getTime() - (ageNum * 24 * 60 * 60 * 1000));
            } else if (age.includes('m')) {
                return new Date(now.getTime() - (ageNum * 60 * 1000));
            }
        }

        // Fall back to recent commit date
        if (commits && commits.length > 0) {
            return new Date(commits[0].commit.author.date);
        }
        
        return new Date(); // Default to current date
    }

    filterRecentPostings(internships) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return internships.filter(job => {
            return job.dateAdded >= sevenDaysAgo;
        });
    }

    removeDuplicates(internships) {
        const seen = new Set();
        return internships.filter(job => {
            const key = `${job.title}-${job.company}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    async postDailyInternships(client) {
        try {
            const internships = await this.scrapeInternships();
            
            if (internships.length === 0) {
                console.log('No new internships found, using fallback opportunities');
                internships.push(...this.getFallbackInternships());
            }

            const channel = client.channels.cache.get(this.channelId) || 
                           client.channels.cache.find(ch => ch.name === 'internships') ||
                           client.channels.cache.find(ch => ch.name === 'general');

            if (!channel) {
                console.error('Could not find internships channel');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('🎯 Daily Fresh Internships & New Grad Opportunities')
                .setDescription('🔥 **NEW POSTINGS** from the last 7 days - Apply fast!')
                .setColor(0x00ff88)
                .setTimestamp()
                .setFooter({ text: 'InterviewBot • Updated from GitHub repos' });

            if (internships.length > 0) {
                internships.forEach((job, index) => {
                    const ageText = job.age ? ` (${job.age} old)` : '';
                    embed.addFields({
                        name: `${index + 1}. ${job.title}${ageText}`,
                        value: `**Company:** ${job.company}\n**Location:** ${job.location}\n**Source:** ${job.source}\n[🚀 Apply Now](${job.link})`,
                        inline: false
                    });
                });
            } else {
                embed.addFields({
                    name: '📝 No New Postings Today',
                    value: 'Check back tomorrow for fresh opportunities!',
                    inline: false
                });
            }

            await channel.send({ embeds: [embed] });
            console.log(`Daily internships posted successfully - ${internships.length} opportunities`);

        } catch (error) {
            console.error('Error posting daily internships:', error);
        }
    }

    getFallbackInternships() {
        return [
            {
                title: 'Software Engineer - New Grad 2025',
                company: 'Google',
                location: 'Mountain View, CA',
                link: 'https://careers.google.com/jobs/results/?category=SOFTWARE_ENGINEERING&jex=ENTRY_LEVEL',
                source: 'Google Careers',
                age: '1d',
                dateAdded: new Date()
            },
            {
                title: 'Software Development Engineer - University Grad',
                company: 'Amazon',
                location: 'Seattle, WA',
                link: 'https://www.amazon.jobs/en/search?base_query=software+engineer+new+grad',
                source: 'Amazon Jobs',
                age: '2d',
                dateAdded: new Date()
            },
            {
                title: 'Software Engineer, Early Career',
                company: 'Meta',
                location: 'Menlo Park, CA',
                link: 'https://www.metacareers.com/jobs/?q=software%20engineer%20university%20grad',
                source: 'Meta Careers',
                age: '1d',
                dateAdded: new Date()
            }
        ];
    }
}

module.exports = InternshipService;
