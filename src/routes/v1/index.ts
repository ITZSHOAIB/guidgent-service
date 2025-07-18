import { Router } from "express";
import { invokeGraph } from "../../services/langgraph/langgraph.service.js";
import { AgenticExpress } from "agentic-express";

const router: Router = Router();

const agenticExpress = new AgenticExpress({
  graphStream: invokeGraph,
});

router.use(await agenticExpress.setup());

export default router;
