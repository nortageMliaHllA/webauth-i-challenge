const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-info.js');

const server = express();

const sessionConfig = {
    name: 'life trap',
    secret: 'neighbors are not home',
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false,
        httpOnly: true
    },
    resave: false,
    saveUninitialized: false
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.get('/', (req, res) => {
    res.send('We have action');
});

server.post('/api/register', (req, res) => {
    let user = req.body;

    user.password = bcrypt.hashSync(user.password, 10);

    Users.add(user)
        .then(saved => {
            req.session.user = saved;
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
    });
})

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
    
    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.status(200).json({message: `Hello ${user.username}, cookie is available`});
            }else {
                res.status(401).json({message: 'Credentials seem to be incorrect'});
            }
        })
        .catch(error => {
            res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

function restricted(req, res, next) {
    const { username, password } = req.headers;

    if (username && password) {
        Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                next();
            }else {
                res.status(401).json({ message: 'Invalid!'}); 
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error, try again!'});
        });
    }else {
        res.status(400).json({ message: 'Please enter correct username and password'});
    }
}

const port = process.env.PORT || 5500;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));