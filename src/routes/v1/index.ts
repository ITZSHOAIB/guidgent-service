import express from "express";
import agentRoute from "./agent.route";

const router = express.Router();

router.use("/agent", agentRoute);

export default router;
