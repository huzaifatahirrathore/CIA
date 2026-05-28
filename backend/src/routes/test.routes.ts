import express from "express";
import logger from "../utils/logger";

const router = express.Router();

// test logs
router.get("/logs", (req, res) => {
  console.log("Console log working");
  logger.info("Winston log working");
  res.send("Logs working");
});

// test error
router.get("/error", (req, res) => {
  throw new Error("Forced error test");
});

export default router;