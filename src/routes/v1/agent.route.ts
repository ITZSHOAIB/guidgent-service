import express from "express";
import {
  buildConnection,
  handleMessage,
} from "../../controllers/agent.controller";

const router = express.Router();

router.get("/stream/:sessionId", buildConnection);

router.post("/stream/:sessionId", (req, res) => {
  handleMessage(req, res);
});

export default router;
