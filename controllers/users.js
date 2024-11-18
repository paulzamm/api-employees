const pool = require('../db');
const bcrypt = require('bcryptjs');


async function createUser(req, res){
    const { username, password } = req.body;
    //Mayor saltRounds, mayor seguridad, pero mas lento
    const saltRounds = 10;

    try{
        const hasehdPassword = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
        const values = [username, hasehdPassword];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.json({
            message: 'User created successfully',
            user: result.rows
        });
    }catch (error){
        if(error.code === '23505'){
            return res.status(400).json('Username already exists');
        }
        console.log(error);
        res.status(500).json('Error creating user');
    }
}

async function getUsers(req, res){
    try{
        const query = 'SELECT * FROM users';
        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.json(result.rows);
    }catch(error){
        console.log(error);
        res.status(500).json('Error getting users');
    }
}

module.exports = {
    createUser,
    getUsers
}
