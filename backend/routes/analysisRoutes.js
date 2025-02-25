const express = require("express");
const router = express.Router();
const { analyzeCode } = require("../controllers/analysisController.js");

router.post("/analyzeCode", analyzeCode);
module.exports = router;
