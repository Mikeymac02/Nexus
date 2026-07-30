const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Allow our React app (port 5173) to talk to this server (port 4000)
const io = new Server(server, { cors: { origin: '*' } });

const CONFIG_PATH = path.join(__dirname, 'config.json');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serves the Remote HTML

// API Endpoint for React to fetch the config on boot
app.get('/api/config', (req, res) => {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    res.json(config);
});

// The WebSocket Listener
io.on('connection', (socket) => {
    console.log('A device connected to Nexus!');

    // When the phone app sends a new config payload...
    socket.on('update_config', (newConfig) => {
        console.log("Received new config:", newConfig);
        
        // 1. Read the CURRENT state of the file so we don't lose the presets
        const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        
        // 2. Safely merge the new changes (like a page swap) into the existing file
        const mergedConfig = { 
            ...existingConfig, 
            ...newConfig 
        };
        
        // 3. Permanently save the merged version
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(mergedConfig, null, 2));
        
        // 4. Instantly broadcast the merged version to the React dashboard
        io.emit('config_updated', mergedConfig);
    });
});

// Start the server on port 4000
server.listen(4000, () => {
    console.log('Nexus Remote Server is running on http://localhost:4000');
});