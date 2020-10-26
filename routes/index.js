var express = require('express');
var router = express.Router();
const getResults = require("../scrapper_puppeteer");

/* GET home page. */
router.get('/', async function(req, res, next) {
  const results = await getResults();
  console(results)
  res.render('index', { title: 'Express', results });
});

module.exports = router;