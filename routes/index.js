var express = require('express');
var router = express.Router();

router.use('/admin', require('./studentRoutes'));
// router.use('/admin', require('./occupantRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/admin', require('./eventRoutes'));
router.use('/mobileapi', require('./apiRoutes'));

module.exports = router;