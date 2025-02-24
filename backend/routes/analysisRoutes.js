const express = require("express");
const router = express.Router();
const { analyzeCode } = require("../controllers/analysisController.js");
// API route for analyzing code
router.post("/analyzeCode", analyzeCode);
module.exports = router;
