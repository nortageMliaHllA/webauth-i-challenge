const bcrypt = require('bcryptjs');
const Users = require('../users/users-info.js');

module.exports = (req, res, next) => {
    console.log(req.session)
    if (req.session && req.session.user) {
        next();
    }else {
        res.status(401).json({ message: 'Invalid Credentials'});
    }
};