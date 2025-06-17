const InternshipService = require('./services/InternshipService');

async function testScraping() {
    const internshipService = new InternshipService();
    console.log('Starting internship scraping test...');
    try {
        const internships = await internshipService.scrapeInternships();
        console.log('Scraping test completed. Found internships:', internships);
    } catch (error) {
        console.error('Error during scraping test:', error);
    }
}

testScraping(); 