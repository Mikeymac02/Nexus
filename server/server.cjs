const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const CONFIG_PATH = path.join(__dirname, "config.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper to read config safely
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading config.json:", err);
  }
  return { activePage: "default", activeBackground: "dark-gradient", presets: {} };
}

// Helper to write config safely
function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing config.json:", err);
  }
}

// REST API Endpoints
app.get("/api/config", (req, res) => {
  res.json(readConfig());
});

app.post("/api/config", (req, res) => {
  const newConfig = req.body;
  writeConfig(newConfig);
  io.emit("config_updated", newConfig);
  res.json({ success: true, config: newConfig });
});

// ==========================================
// ⚡ IFTTT WEBHOOK ENDPOINT: /api/webhook
// ==========================================
app.post("/api/webhook", (req, res) => {
  const { event, message, preset, background } = req.body;
  console.log("⚡ [IFTTT Webhook Received]:", req.body);

  let config = readConfig();
  let configChanged = false;

  // 1. Switch active page / preset if provided (e.g. { "preset": "evening" })
  if (preset) {
    config.activePage = preset;
    configChanged = true;
  }

  // 2. Change active background if provided (e.g. { "background": "space" })
  if (background) {
    config.activeBackground = background;
    configChanged = true;
  }

  // Save and notify displays if configuration changed
  if (configChanged) {
    writeConfig(config);
    io.emit("config_updated", config);
  }

  // 3. Broadcast real-time alert/notification to connected displays
  if (message || event) {
    io.emit("ifttt_alert", {
      event: event || "IFTTT Event",
      message: message || "Trigger received",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: "success",
    message: "Webhook processed successfully",
    received: req.body,
    configUpdated: configChanged,
  });
});

// Socket.io WebSockets Connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("update_config", (newConfig) => {
    writeConfig(newConfig);
    io.emit("config_updated", newConfig);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Nexus Backend Server running on http://localhost:${PORT}`);
  console.log(`IFTTT Webhook Endpoint: http://localhost:${PORT}/api/webhook`);
});
