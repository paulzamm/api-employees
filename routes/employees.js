const { Router } = require('express');
const router = Router();

var { getEmployees, getEmployeesById, createEmployee, updateEmployee, deleteEmployee, exportData, importData } = require('../controllers/employees');
const verifyToken = require('../middlewares/jwtmiddleware');

router.get('/employees', verifyToken, getEmployees);
router.get('/employees/:id', verifyToken, getEmployeesById);
router.post('/employees', verifyToken, createEmployee);
router.put('/employees/:id', verifyToken, updateEmployee);
router.delete('/employees/:id', verifyToken, deleteEmployee);
router.get('/exportEmployees', verifyToken, exportData);
router.post('/importEmployees',verifyToken, importData);

module.exports = router;