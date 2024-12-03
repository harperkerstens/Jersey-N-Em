const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const getHeader = require('./header');

// Serve static files from the 'images' folder
router.use('/images', express.static(path.join(__dirname, '..', 'images')));

router.get('/', async function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Team Logos</title>");
    res.write(getHeader());
    res.write("<h1>Browse by team</h1>");

    // Display the search form and conference buttons
    res.write(`
        <form method="GET" action="/listTeam" style="display: flex; align-items: center;">
            <label for="teamName" style="margin-right: 10px;">Search for a team:</label>
            <input type="text" id="teamName" name="teamName" style="flex-grow: 1; padding: 10px; font-size: 16px;">
            <button type="submit" style="margin-left: 10px; padding: 10px 20px; font-size: 16px;">Search</button>
        </form>
        <div style="margin-top: 10px; display: flex; gap: 10px;">
            <button onclick="window.location.href='/listTeam?conference=Eastern'" style="padding: 10px 20px; font-size: 16px;">Eastern</button>
            <button onclick="window.location.href='/listTeam?conference=Western'" style="padding: 10px 20px; font-size: 16px;">Western</button>
            <button onclick="window.location.href='/listTeam'" style="padding: 10px 20px; font-size: 16px;">Both Conferences</button>
            <button onclick="window.location.href='/listProd'" style="padding: 10px 20px; font-size: 16px;">List All Products</button>
        </div>
        <hr>
    `);

    // Get the team name and conference from query parameters
    const teamNameQuery = req.query.teamName;
    const conferenceQuery = req.query.conference;

    // Determine the logos directory based on the conference
    let logosDir = path.join(__dirname, '..', 'public', 'images', 'logos');
    if (conferenceQuery === 'Eastern') {
        logosDir = path.join(logosDir, 'Eastern');
    } else if (conferenceQuery === 'Western') {
        logosDir = path.join(logosDir, 'Western');
    }

    // Check if the directory exists
    if (!fs.existsSync(logosDir)) {
        res.write("<p>No team logos found.</p>");
        res.end();
        return;
    }

    let logoFiles = fs.readdirSync(logosDir).filter(file => file.endsWith('.svg'));

    // Filter logos based on the search query
    if (teamNameQuery) {
        logoFiles = logoFiles.filter(file => file.toLowerCase().includes(teamNameQuery.toLowerCase()));
    }

    if (logoFiles.length === 0) {
        res.write(`<p>No team logos found${teamNameQuery ? ` for "${teamNameQuery}"` : ""}.</p>`);
    } else {
        // Display the logos in a grid
        res.write('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">');
        for (const logoFile of logoFiles) {
            const teamName = path.basename(logoFile, path.extname(logoFile));
            const teamId = getTeamIdByName(teamName); // Function to get teamId by teamName
            if (!teamId) {
                console.error(`Team ID not found for team: ${teamName}`);
                continue; // Skip if teamId is not found
            }
            const teamLink = `/team?name=${encodeURIComponent(teamName)}&teamId=${teamId}`;
            const logoPath = `/images/logos/${conferenceQuery ? conferenceQuery + '/' : ''}${logoFile}`;

            res.write(`
                <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                    <a href="${teamLink}">
                        <img src="${logoPath}" alt="${teamName}" style="width: 100%; height: auto;">
                    </a>
                    <p><a href="${teamLink}">${teamName}</a></p>
                </div>
            `);
        }
        res.write('</div>');
    }

    res.end();
});

// Function to get teamId by teamName
function getTeamIdByName(teamName) {
    const teamIds = {
        'Golden State Warriors': 1,
        'Los Angeles Lakers': 2,
        'Chicago Bulls': 3,
        'Boston Celtics': 4,
        'Brooklyn Nets': 5,
        'Milwaukee Bucks': 6,
        'San Antonio Spurs': 7,
        'Dallas Mavericks': 8,
        'Philadelphia 76ers': 9,
        'Denver Nuggets': 10,
        'Phoenix Suns': 11,
        'Miami Heat': 12,
        'Atlanta Hawks': 13,
        'Charlotte Hornets': 14,
        'Detroit Pistons': 15,
        'Indiana Pacers': 16,
        'Toronto Raptors': 17,
        'Orlando Magic': 18,
        'Washington Wizards': 19,
        'Cleveland Cavaliers': 20,
        'Minnesota Timberwolves': 21,
        'New Orleans Pelicans': 22,
        'Sacramento Kings': 23,
        'Utah Jazz': 24,
        'Oklahoma City Thunder': 25,
        'Houston Rockets': 26,
        'New York Knicks': 27,
        'Los Angeles Clippers': 28,
        'Memphis Grizzlies': 29,
        'Portland Trail Blazers': 30
    };
    return teamIds[teamName] || null;
}

module.exports = router;