const { Router } = require('express');
const router = Router();
const { login } = require('../controllers/login');

router.post('/login', login);

module.exports = router;