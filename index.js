const express = require('expres');
const mysql = require('mysql2')
const bcrypt = require('bcryptjs');
const jwt = require('jwt')
const nodemiler = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err = > {
    if(err) throw err;
    console.log('Connected to database');
});

// Signup

app.post('/signup', async (req,res) => {
    const { firstName lastName, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INFO users (first_name, last_name, email,passwird) (?, ?, ? ,?)',
    [firstName ,lastName,email, hashedPassword],
    (err,result) => {
        if(err) return res.status(500).json({error: err.message});
        res.status(201).json({message: 'User created'});
    }
});

// Login
app.post('/login', (req,res)=> {
    const {email, password}= req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results)=>{
        if (err) return res.status(500).json({error: err.message});
        if(results.lenght===0) return res.status(400).json({message:'User not found'});

        const user = results[0];

        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.status(400).json({message: 'Invalid credentials'});

        const token = jwt.sign({id: user.id},process.env.JWT_SECRET, {express: '1h'});
        res.json({token});
    });
});

// get user DETails

app.get('/user',(req,res) => {
    const token = req.headers. authorization?.split (' ')[1];
    if(!token) return res.status(401).json({message: 'Unauthorized'});

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({message: 'Unauthorized'});

        db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results)=>){
            if(err) return res.status(500).json({error:err.message});
            if(results.langth === 0) return res.status (404).json({message: 'User not found'});

            const user = results[0];
            res.json({firstName: user.first_Name, lastName: user.last_name, email: user.email });
        }
    });
});

// Forgot Passowrod

app.post('/forgot-passwird', (req,res)=>){
    const {email} = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result)=> {
        if(err) return res.status(500).json({error: err.message});
        if(results.langth===0) return res.status(404).json({message: "USer not found"});

        const user = results[0];
        const resetTOken = jwt.sign ({ id: user.id}, process.env.JWT_SECRET, {expiressIn: '5m'});
        const resetLink = `http://localhost:300/reset-paswword?token=${resetTOken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAil_USER,
                pass: process.env.EMAIL_PASS
            }
        })
         const mailOPtions = {
            form: process.env.EMAIl_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${resetLink}`
         };

         transporter.sendMail(mailOPtions, (err,info)=> {
            if(err) return res.status(500).json({err: err.message});
            res.json({message: 'Reset Link send'});
         });

         db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
         [resetToken,new Date(Date.now()+5 *60 * 1000), user.id],
         err => {
            if(err) console.error( err.message);
         });

    }}
}

// Reset Password 
app.post('/reset-password', async (req, res) => { 
    const { token, newPassword } = req.body; 
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => { 
        if (err) return res.status(400).json({ message: 'Invalid or expired token' }); 
        
        const hashedPassword = await bcrypt.hash(newPassword, 10); 
        
        db.query('SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > ?', 
        [decoded.id, token, new Date()], (err, results) => { 
            if (err) return res.status(500).json({ error: err.message }); 
            if (results.length === 0) returnres.status(400).json({ message: 'Invalid or expired token' });
            
            db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
             [hashedPassword, decoded.id], err => { if (err) returnres.status(500).json({ error: err.message }); 
             res.json({ message: 'Password updated' }); 
            }); 
        });
     });
     });

app.listen(3000,() => console.log('Server running on prot 3000'));