const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <-- ADDED: Imports the CORS package

const app = express();
app.use(cors()); // <-- ADDED: Tells Express to allow cross-origin requests

const server = http.createServer(app);

// Setup Socket.io to allow your React frontend and phone to connect
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Path to your local database file
const CONFIG_PATH = path.join(__dirname, 'config.json');

// 1. Serve the Mobile-First Admin Panel (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Use Express JSON middleware to parse incoming POST requests
app.use(express.json());

// 2. REST Endpoint: Sends the current config when the app or phone first loads
app.get('/api/config', (req, res) => {
    if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        res.json(config);
    } else {
        res.status(404).json({ error: "Config file not found." });
    }
});

// 3. REST Endpoint: Auto-Syncs new Module Settings into config.json
app.post('/api/sync-settings', (req, res) => {
    const defaultSettings = req.body;
    const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    // Make sure the moduleSettings object exists
    if (!existingConfig.moduleSettings) {
        existingConfig.moduleSettings = {};
    }
    
    let configChanged = false;

    // Loop through the default settings provided by the React app's scout sequence
    Object.keys(defaultSettings).forEach(moduleId => {
        if (!existingConfig.moduleSettings[moduleId]) {
            existingConfig.moduleSettings[moduleId] = {};
        }
        
        // Loop through the keys (e.g., 'latitude', 'clientId')
        Object.keys(defaultSettings[moduleId]).forEach(key => {
            // ONLY add the setting if it doesn't already exist! 
            // This prevents us from accidentally overwriting a user's saved API key.
            if (existingConfig.moduleSettings[moduleId][key] === undefined) {
                existingConfig.moduleSettings[moduleId][key] = defaultSettings[moduleId][key];
                configChanged = true;
            }
        });
    });

    // If we found missing settings and added them, save the file and update the phone UI
    if (configChanged) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(existingConfig, null, 2));
        io.emit('config_updated', existingConfig); 
    }
    
    res.json({ success: true });
});

// 4. WebSockets: Real-time, two-way communication for live UI updates
io.on('connection', (socket) => {
    console.log('A device connected to the Nexus Server');

    // UPDATE CONFIG: Handles Layout Grid, Sizes, and Appearance Backgrounds
    socket.on('update_config', (updates) => {
        const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        
        // Merge the new layout/background data with the existing config
        const newConfig = { ...existingConfig, ...updates };
        
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
        io.emit('config_updated', newConfig); // Broadcast to the physical display
    });

    // DELETE PRESET: Removes a layout preset entirely
    socket.on('delete_preset', (presetName) => {
        const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        
        if (existingConfig.presets && existingConfig.presets[presetName]) {
            delete existingConfig.presets[presetName];
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(existingConfig, null, 2));
            io.emit('config_updated', existingConfig);
        }
    });

    // UPDATE DYNAMIC MODULE SETTINGS: Handles live edits to module inputs from the phone
    socket.on('update_module_settings', (data) => {
        const { moduleId, settings } = data;
        const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        
        if (!existingConfig.moduleSettings) {
            existingConfig.moduleSettings = {};
        }
        
        // Safely merge the specific module's new settings so we don't wipe out other keys
        existingConfig.moduleSettings[moduleId] = { 
            ...(existingConfig.moduleSettings[moduleId] || {}), 
            ...settings 
        };
        
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(existingConfig, null, 2));
        
        // Broadcast the new keys to the React shell instantly
        io.emit('config_updated', existingConfig); 
    });

    socket.on('disconnect', () => {
        console.log('Device disconnected');
    });
});

// Start the server on Port 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Node Server running smoothly on http://localhost:${PORT}`);
});