const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
// Serve static files from the "public" folder
app.use(express.static('public'));

const port = 3000;

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hodlinfo',
    password: 'ars28',
    port: 5432,
});

// Fetch data from the API and store in the database
app.get('/fetch-data', async (req, res) => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const tickers = response.data;

        const client = await pool.connect();
        await client.query('TRUNCATE TABLE tickers');

        for (const ticker in tickers) {
            const { name, last, buy, sell, volume, base_unit } = tickers[ticker];
            const query = 'INSERT INTO tickers (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)';
            const values = [name, last, buy, sell, volume, base_unit];
            await client.query(query, values);
        }

        client.release();
        res.send('Data fetched and stored successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

// Retrieve data from the database
app.get('/data', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM tickers ORDER BY id ASC LIMIT 10');
        const data = result.rows.map((item, index) => ({
            ...item,
            id: index + 1,
            difference: ((item.sell - item.buy) / item.buy) * 100,
        }));
        client.release();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

// Serve the HTML file for the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

