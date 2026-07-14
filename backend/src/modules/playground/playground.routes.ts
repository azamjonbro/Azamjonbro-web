import { Router } from "express";
import { simulateSql, simulateXss, runLinuxSandbox, hashDemo, inspectRequest } from "./playground.controller";

const router = Router();

router.post("/sqli", simulateSql);
router.post("/xss", simulateXss);
router.post("/sandbox", runLinuxSandbox);
router.post("/hash-compare", hashDemo);
router.all("/inspect", inspectRequest);

export default router;
