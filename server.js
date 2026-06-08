const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Music_App',
    password: 'GanganjiPassword',
    port: 5432
});


// Test DB connection
pool.connect()
.then(() => {
    console.log("PostgreSQL connected");
})
.catch((error) => {
    console.log("Database connection failed", error);
});


// REGISTER API
app.post('/register', async (req,res)=>{

    const {username,email,password} = req.body;

    try {

        const checkUser = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );


        if(checkUser.rows.length > 0){

            return res.status(400).json({
                message:'User already exists'
            });

        }


        await pool.query(
            `INSERT INTO users(username,email,password)
             VALUES($1,$2,$3)`,
             [
                username,
                email,
                password
             ]
        );


        res.json({
            message:'Registration successful'
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:'Database error'
        });

    }

});

// LOGIN API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users
             WHERE email = $1
             AND password = $2`,
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Database error'
        });
    }
});

app.get('/songs', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM songs ORDER BY id'
        );

        res.json(result.rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Database error'
        });
    }
});


// START SERVER
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});