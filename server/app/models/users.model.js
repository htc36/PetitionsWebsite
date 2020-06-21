const db = require('../../config/db');
const bcrypt = require('bcryptjs');

exports.insert = async function(name, email, password, city, country) {
    let values = [ name, email, password, city, country ];
    const connection = await db.getPool().getConnection();
    const q = 'INSERT INTO User (name, email, password, city, country) VALUES (?,?,?,?,?)';
    try {
        const [result, _] = await connection.query(q, values);
        connection.release();
        return {id : result.insertId};
    }catch(error) {
        return {error : error};
    }
};

exports.findByEmail = async function(email) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT * FROM User WHERE email = ?';
    try {
        const [result, _] = await connection.query(q, email);
        connection.release();
        return result[0];
    }catch(error) {
        return {error : error};
    }

};
exports.insertToken = async function(id, token) {
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    try {
        const [result, _] = await connection.query(q, [ token, id ]);
        connection.release();
    }catch(error) {
    }
};

exports.removeToken = async function(token) {
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE User SET auth_token = ? WHERE auth_token = ?';
    try {
        const [result, _] = await connection.query(q, [ null, token ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};

exports.getTokenData = async function(token) {
    const connection = await db.getPool().getConnection();
    const q = 'select * from User WHERE auth_token = ?';
    try {
        const [result, _] = await connection.query(q, [ token ]);
        connection.release();
        return result[0];
    }catch(error) {
        return {error : error};
    }
};
exports.getUser = async function(userId) {
    const connection = await db.getPool().getConnection();
    const q = 'select * from User WHERE user_id = ?';
    try {
        const [result, _] = await connection.query(q, [ userId ]);
        connection.release();
        return result[0];
    }catch(error) {
        return {error : error};
    }
};
exports.patchUser = async function(query) {
    const connection = await db.getPool().getConnection();
    try {
        const [result, _] = await connection.query(query);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};
exports.updatePhoto = async function(photo, id) {
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    try {
        const [result, _] = await connection.query(q, [ photo, id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};
exports.deletePhoto = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    try {
        const [result, _] = await connection.query(q, [ null, id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};


