const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 5000,
    timeout: 2000,
    path: '/api/health'
};

const request = http.request(options, (res) => {
    console.log(`HEALTHCHECK STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.error(`HEALTHCHECK ERROR: ${err}`);
    process.exit(1);
});

request.end();