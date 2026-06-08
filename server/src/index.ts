import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { startCronJobs } from "./jobs/cronJobs.js";
import { initSocketServer } from "./socket/socket.js";

const app = createApp();
const server = createServer(app);

initSocketServer(server);
startCronJobs();

server.listen(config.port, "0.0.0.0", () => {
  console.log(`Lab EMR server listening on port ${config.port}`);
});
