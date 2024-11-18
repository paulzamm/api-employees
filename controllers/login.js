const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');


async function login(req, res) {
    const { username, password} = req.body;

    if(!username || !password){
        return res.status(400).json('Username and password are required');
    }

    try{
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];

        const client = await pool.connect();
            
        try{    
            const result = await client.query(query, values);
            if(result.rows.length === 0){
                return res.status(404).json('User not found');
            }

            const user = result.rows[0];

            const validPassword = await bcrypt.compare(password, user.password);
            if(!validPassword){
                return res.status(400).json('Invalid password');
            }

            const token = jwt.sign(
                { user: user.username }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.json({
                message: 'Authentication successful',
                token: token,
                });
        }finally{
            client.release();
        }
    }catch(error){
        console.log('Error in login: ',error);
        res.status(500).json('Error in login');
    }
}

module.exports = { login }; 