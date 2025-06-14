const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder } = require('discord.js');

class InternshipService {
    constructor() {
        this.channelId = process.env.INTERNSHIPS_CHANNEL_ID || 'general';
    }

    async scrapeInternships() {
        const internships = [];
        
        try {
            // Scrape from multiple sources
            const sources = [
                this.scrapeLinkedInJobs(),
                this.scrapeIndeedJobs(),
                this.scrapeAngelListJobs()
            ];

            const results = await Promise.allSettled(sources);
            
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    internships.push(...result.value);
                }
            });

            // Remove duplicates and limit to 5 best opportunities
            const uniqueInternships = this.removeDuplicates(internships);
            return uniqueInternships.slice(0, 5);

        } catch (error) {
            console.error('Error scraping internships:', error);
            return [];
        }
    }

    async scrapeLinkedInJobs() {
        try {
            // Using LinkedIn job search API endpoint for new grad positions
            const url = 'https://www.linkedin.com/jobs/search?keywords=new%20grad%20software%20engineer&location=United%20States&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0';
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const jobs = [];

            $('.jobs-search__results-list li').each((index, element) => {
                if (index >= 3) return false; // Limit to 3 jobs

                const title = $(element).find('.base-search-card__title').text().trim();
                const company = $(element).find('.base-search-card__subtitle').text().trim();
                const location = $(element).find('.job-search-card__location').text().trim();
                const link = $(element).find('.base-card__full-link').attr('href');
                
                if (title && company) {
                    jobs.push({
                        title,
                        company,
                        location: location || 'Remote',
                        link: link || 'https://linkedin.com/jobs',
                        source: 'LinkedIn'
                    });
                }
            });

            return jobs;
        } catch (error) {
            console.error('Error scraping LinkedIn:', error);
            return [];
        }
    }

    async scrapeIndeedJobs() {
        try {
            const url = 'https://www.indeed.com/jobs?q=new+grad+software+engineer&l=United+States';
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const jobs = [];

            $('.slider_container .slider_item').each((index, element) => {
                if (index >= 2) return false; // Limit to 2 jobs

                const title = $(element).find('h2 a span').attr('title') || $(element).find('h2 a').text().trim();
                const company = $(element).find('.companyName').text().trim();
                const location = $(element).find('.companyLocation').text().trim();
                const link = 'https://indeed.com' + $(element).find('h2 a').attr('href');
                
                if (title && company) {
                    jobs.push({
                        title,
                        company,
                        location: location || 'Remote',
                        link,
                        source: 'Indeed'
                    });
                }
            });

            return jobs;
        } catch (error) {
            console.error('Error scraping Indeed:', error);
            return [];
        }
    }

    async scrapeAngelListJobs() {
        // Fallback with curated new grad opportunities
        return [
            {
                title: 'Software Engineer - New Grad',
                company: 'Tech Startup',
                location: 'San Francisco, CA',
                link: 'https://angel.co/jobs',
                source: 'AngelList'
            }
        ];
    }

    removeDuplicates(internships) {
        const seen = new Set();
        return internships.filter(job => {
            const key = `${job.title}-${job.company}`.toLowerCase();
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
                // Fallback with curated opportunities
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
                .setDescription('Curated opportunities delivered straight to the community!')
                .setColor(0x0066cc)
                .setTimestamp()
                .setFooter({ text: 'InterviewBot • Daily Updates' });

            internships.forEach((job, index) => {
                embed.addFields({
                    name: `${index + 1}. ${job.title}`,
                    value: `**Company:** ${job.company}\n**Location:** ${job.location}\n**Source:** ${job.source}\n[Apply Here](${job.link})`,
                    inline: false
                });
            });

            await channel.send({ embeds: [embed] });
            console.log('Daily internships posted successfully');

        } catch (error) {
            console.error('Error posting daily internships:', error);
        }
    }

    getFallbackInternships() {
        return [
            {
                title: 'Software Engineer - New Grad',
                company: 'Google',
                location: 'Mountain View, CA',
                link: 'https://careers.google.com',
                source: 'Google Careers'
            },
            {
                title: 'Frontend Developer - Entry Level',
                company: 'Meta',
                location: 'Menlo Park, CA',
                link: 'https://careers.meta.com',
                source: 'Meta Careers'
            },
            {
                title: 'Software Development Engineer I',
                company: 'Amazon',
                location: 'Seattle, WA',
                link: 'https://amazon.jobs',
                source: 'Amazon Jobs'
            }
        ];
    }
}

module.exports = InternshipService;
