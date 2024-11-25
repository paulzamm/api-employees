const pool = require('../db');
const fastCSV = require('fast-csv'); 
const { parse } = require('fast-csv');
const fs = require('fs');
const moment = require('moment');

async function getEmployees(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query(`
            select e.employee_id, e.first_name, e.last_name, e.email, e.phone_number, e.hire_date, e.job_id,
            jo.job_title, jo.max_salary AS job_max_salary, jo.min_salary AS job_min_salary, e.salary, e.commission_pct, 
            e.manager_id AS manager_id, man.first_name AS manager_first_name, man.last_name AS manager_last_name, 
            man.email AS manager_email, man.phone_number AS manager_phone_number, man.hire_date AS manager_hire_date, 
            man.job_id AS manager_job_id, man.salary AS manager_salary, man.commission_pct AS manager_commission_pct, 
            man.manager_id AS manager_manager_id, man.department_id AS manager_department_id, e.department_id, 
            d.department_name, d.manager_id AS department_manager_id, d.location_id As department_location_id
            
            from employees e 
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN employees man ON e.manager_id = man.employee_id
            LEFT JOIN jobs jo ON e.job_id = jo.job_id
            `);
        client.release();
        const employees = result.rows.map(row => {
            const {
                employee_id,
                first_name,
                last_name,
                email,
                phone_number,
                hire_date,
                job_id,
                job_title,
                job_max_salary,
                job_min_salary,
                salary,
                commission_pct,
                manager_id,
                manager_first_name,
                manager_last_name,
                manager_email,
                manager_phone_number,
                manager_hire_date,
                manager_job_id,
                manager_salary,
                manager_commission_pct,
                manager_manager_id,
                manager_department_id,
                department_id,
                department_name,
                department_manager_id,
                department_location_id,
            } = row;
            return {
                employee_id,
                first_name,
                last_name,
                email,
                phone_number,
                hire_date,
                salary,
                commission_pct,
                department: department_id ? {
                    department_id,
                    department_name,
                    manager_id: department_manager_id,
                    location_id: department_location_id
                } : null,
                job: job_id ? {
                    job_id,
                    job_title,
                    max_salary: job_max_salary,
                    min_salary: job_min_salary
                } : null,
                manager: manager_id ? {
                    employee_id: manager_id,
                    first_name: manager_first_name,
                    last_name: manager_last_name,
                    email: manager_email,
                    phone_number: manager_phone_number,
                    hire_date: manager_hire_date,
                    job_id: manager_job_id,
                    salary: manager_salary,
                    commission_pct: manager_commission_pct,
                    manager_id: manager_manager_id,
                    department_id: manager_department_id
                } : null
            }
        });
        res.json(employees);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Error al obtener los empleados');
    }
}

async function getEmployeesById(req, res) {
    const { id } = req.params;
    const query = `
        select e.employee_id, e.first_name, e.last_name, e.email, e.phone_number, e.hire_date, e.job_id,
        jo.job_title, jo.max_salary AS job_max_salary, jo.min_salary AS job_min_salary, e.salary, e.commission_pct, 
        e.manager_id AS manager_id, man.first_name AS manager_first_name, man.last_name AS manager_last_name, 
        man.email AS manager_email, man.phone_number AS manager_phone_number, man.hire_date AS manager_hire_date, 
        man.job_id AS manager_job_id, man.salary AS manager_salary, man.commission_pct AS manager_commission_pct, 
        man.manager_id AS manager_manager_id, man.department_id AS manager_department_id, e.department_id, 
        d.department_name, d.manager_id AS department_manager_id, d.location_id As department_location_id
        
        from employees e 
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN employees man ON e.manager_id = man.employee_id
        LEFT JOIN jobs jo ON e.job_id = jo.job_id
        WHERE e.employee_id = $1
    `;
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length > 0) {
            const employees = result.rows.map(row => {
                const {
                    employee_id,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    hire_date,
                    job_id,
                    job_title,
                    job_max_salary,
                    job_min_salary,
                    salary,
                    commission_pct,
                    manager_id,
                    manager_first_name,
                    manager_last_name,
                    manager_email,
                    manager_phone_number,
                    manager_hire_date,
                    manager_job_id,
                    manager_salary,
                    manager_commission_pct,
                    manager_manager_id,
                    manager_department_id,
                    department_id,
                    department_name,
                    department_manager_id,
                    department_location_id,
                } = row;
                return {
                    employee_id,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    hire_date,
                    salary,
                    commission_pct,
                    department: department_id ? {
                        department_id: department_id,
                        department_name,
                        manager_id: department_manager_id,
                        location_id: department_location_id
                    } : null,
                    job: job_id ? {
                        job_id: job_id,
                        job_title,
                        max_salary: job_max_salary,
                        min_salary: job_min_salary
                    } : null,
                    manager: manager_id ? {
                        employee_id: manager_id,
                        first_name: manager_first_name,
                        last_name: manager_last_name,
                        email: manager_email,
                        phone_number: manager_phone_number,
                        hire_date: manager_hire_date,
                        job_id: manager_job_id,
                        salary: manager_salary,
                        commission_pct: manager_commission_pct,
                        manager_id: manager_manager_id,
                        department_id: manager_department_id
                    } : null
                }
            });
            res.json(employees);
        } else {
            res.status(404).json('Empleado no encontrado');
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json('Error al obtener el empleado');
    }
}

async function createEmployee(req, res) {
    const { employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id } = req.body;
    if(commission_pct < -1.00 || commission_pct > 1.00 || isNaN(commission_pct)) {
        return res.status(400).json('La comisión debe ser un número entre -1.00 y 1.00');
    }
    
    if(isNaN(salary) || salary < 0 || salary > 99999999.99) {
        return res.status(400).json('El salario debe ser un número entre 0 y 99999999.99');
    }

    const query = 'INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
    const values = [employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.json({
            message: 'Empleado creado correctamente',
            employee: result.rows
        });
    } catch (error) {
        console.log(error);
        if(error.code === '23505') {
            return res.status(400).json('El empleado ya existe');
        }
        return res.status(500).json('Error al crear el empleado');
    }
}

async function updateEmployee(req, res) {
    const { id } = req.params;
    const { first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id } = req.body;
    
    if(commission_pct < -1.00 || commission_pct > 1.00 || isNaN(commission_pct)) {
        return res.status(400).json('La comisión debe ser un número entre -1.00 y 1.00');
    }
    
    if(isNaN(salary) || salary < 0 || salary > 99999999.99) {
        return res.status(400).json('El salario debe ser un número entre 0 y 99999999.99');
    }

    const query = 'UPDATE employees SET first_name = $2, last_name = $3, email = $4, phone_number = $5, hire_date = $6, job_id = $7, salary = $8, commission_pct = $9, manager_id = $10, department_id = $11 WHERE employee_id = $1 RETURNING *';
    const values = [id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.json({
                message: 'Empleado actualizado correctamente',
                employee: result.rows
            });
        } else {
            res.status(400).json('Empleado no encontrado');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('Error al actualizar el empleado');
    }
}

async function deleteEmployee(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM employees WHERE employee_id = $1';
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);

        await pool.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.json('Empleado eliminado correctamente');
        } else {
            res.status(400).json('Empleado no encontrado');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('Error al eliminar el empleado');
    }
}

async function exportData(req, res) {
    try{
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM employees`);
        client.release();

        const csvStream = fastCSV.format({ headers: true });
        res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
        res.setHeader('Content-Type', 'text/csv');

        csvStream.pipe(res);
        result.rows.forEach(row => {
            csvStream.write(row);
        });
        csvStream.end();
    }catch(error){
        console.log(error);
        return res.status(500).json('Error al exportar los datos');
    }
}


async function importData(req, res) {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const uploadedFile = req.files.file; 
    const filePath = `uploads/${uploadedFile.name}`; 

    uploadedFile.mv(filePath, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al guardar el archivo' });
        }

        try {
            const rows = [];
            const stream = fs.createReadStream(filePath);

            const parser = stream.pipe(parse({ headers: true }));

            for await (const row of parser) {
                rows.push(row);
            }

            const client = await pool.connect();

            for (const row of rows) {
                let {
                    employee_id,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    hire_date,
                    job_id,
                    salary,
                    commission_pct,
                    manager_id,
                    department_id
                } = row;

                commission_pct = commission_pct === '' ? null : commission_pct;
                manager_id = manager_id === '' ? null : manager_id;
                department_id = department_id === '' ? null : department_id;



                const formattedHireDate = moment(new Date(hire_date)).format("YYYY-MM-DDTHH:mm:ssZ");

                await client.query(
                    `INSERT INTO employees 
                    (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (employee_id) DO UPDATE 
                    SET first_name = EXCLUDED.first_name, 
                        last_name = EXCLUDED.last_name, 
                        email = EXCLUDED.email, 
                        phone_number = EXCLUDED.phone_number, 
                        hire_date = EXCLUDED.hire_date, 
                        job_id = EXCLUDED.job_id, 
                        salary = EXCLUDED.salary, 
                        commission_pct = EXCLUDED.commission_pct, 
                        manager_id = EXCLUDED.manager_id, 
                        department_id = EXCLUDED.department_id`,
                    [employee_id, first_name, last_name, email, phone_number, formattedHireDate, job_id, salary, commission_pct, manager_id, department_id]
                );
            }

            client.release();

            fs.unlinkSync(filePath);

            res.status(200).json({ message: 'Datos importados correctamente' });
        } catch (error) {
            console.error(error);
            fs.unlinkSync(filePath); 
            res.status(500).json({ message: 'Error al importar los datos' });
        }
    });
}



module.exports = {
    getEmployees,
    getEmployeesById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    exportData,
    importData
}