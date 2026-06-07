const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const CONTROL_TOKEN = process.env.CONTROL_TOKEN;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.type("text/plain").send("Socket server running");
});

function isAuthorized(payload) {
  return Boolean(CONTROL_TOKEN) && payload && payload.token === CONTROL_TOKEN;
}

io.on("connection", (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);

  socket.on("popup:show", (payload = {}) => {
    const message = payload.message || "";
    console.log(`[socket] popup:show from ${socket.id}:`, { message });

    if (!isAuthorized(payload)) {
      console.warn(`[socket] ignored popup:show from ${socket.id}: invalid token`);
      return;
    }

    io.emit("popup:show", { message });
  });

  socket.on("popup:hide", (payload = {}) => {
    console.log(`[socket] popup:hide from ${socket.id}`);

    if (!isAuthorized(payload)) {
      console.warn(`[socket] ignored popup:hide from ${socket.id}: invalid token`);
      return;
    }

    io.emit("popup:hide");
  });

  socket.on("disconnect", (reason) => {
    console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`[server] Socket server running on port ${PORT}`);
  console.log(`[server] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[server] CONTROL_TOKEN ${CONTROL_TOKEN ? "configured" : "not configured"}`);
});
