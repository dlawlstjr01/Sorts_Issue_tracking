const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

router.get("/glossary", searchController.getGlossary);

module.exports = router;