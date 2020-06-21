const db = require('../../config/db');

exports.gett = async function(sorting, count, offset, whereConditions) {
    const connection = await db.getPool().getConnection();
    q = 'SELECT petition_id as petitionId, title, Category.name as category, User.name as authorName, \
            (select count(*) \
            FROM Signature \
            WHERE Petition.petition_id = Signature.petition_id) as signatureCount \
        FROM Petition \
        INNER JOIN Category ON Petition.category_id = Category.category_id \
        INNER JOIN User ON Petition.author_id = User.user_id \
        ' + whereConditions + ' \
        ORDER BY ' + sorting + ' \
        LIMIT ' + count + ' OFFSET ' + offset;
    try {
        const [result, _] = await connection.query(q);
        connection.release();

        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.createPetition = async function(title, description, author, category, createDate, closeDate) {
    const connection = await db.getPool().getConnection();
    const values = [ title, description, author, category , createDate ,closeDate ]
    const q = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES (?,?,?,?,?,?)';
    try {
        const [result, _] = await connection.query(q, values);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.checkCat = async function(category) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT * FROM Category WHERE category_id = ?';
    try {
        const [result, _] = await connection.query(q, [ category ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.getPetition = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT petition_id as petitionId, title, Category.name as category, User.name as authorName, \
            (select count(*) \
            FROM Signature \
            WHERE Petition.petition_id = Signature.petition_id) as signatureCount, \
        description, user_id as authorId, city as authorCity, country as authorCountry, \
        created_date as createdDate, closing_date as closingDate\
        FROM Petition \
        INNER JOIN Category ON Petition.category_id = Category.category_id \
        INNER JOIN User ON Petition.author_id = User.user_id \
        WHERE petition_id = ' + id;
    try {
        const [result, _] = await connection.query(q, [ id ]);
        connection.release();
        return result[0];
    }catch(error) {
        return {error : error};
    }
}
exports.patchPetition = async function(query) {
    const connection = await db.getPool().getConnection();
    try {
        const [result, _] = await connection.query(query);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};
exports.deletePetition = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'DELETE FROM Petition WHERE petition_id = ?';
    try {
        const [result, _] = await connection.query(q, [ id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.getCategory = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT category_id as categoryId, name FROM Category';
    try {
        const [result, _] = await connection.query(q);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}

exports.getPetitionPhoto = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT photo_filename FROM Petition \
        WHERE petition_id = ' + id;
    try {
        const [result, _] = await connection.query(q, [ id ]);
        connection.release();
        return result[0];
    }catch(error) {
        return {error : error};
    }
}

exports.updatePetitionPhoto = async function(photo, id) {
    const connection = await db.getPool().getConnection();
    const q = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    try {
        const [result, _] = await connection.query(q, [ photo, id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
};
exports.getSigs = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT signatory_id as signatoryId, name, city, country, signed_date as signedDate \
               FROM Signature \
               INNER JOIN User ON Signature.signatory_id = User.user_id \
               WHERE petition_id = ? \
               ORDER BY signed_date ASC';
    try {
        const [result, _] = await connection.query(q, [ id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.checkSigned = async function(pet, sig) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT * \
               FROM Signature \
               WHERE petition_id = ? and signatory_id = ?';
    try {
        const [result, _] = await connection.query(q, [ pet, sig ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}

exports.signPetition = async function(pet, sig, date) {
    const values = [ sig, pet, date ]
    const connection = await db.getPool().getConnection();
    const q = 'INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?,?,?)';
    try {
        const [result, _] = await connection.query(q, values);
        connection.release();
        return {id : result.insertId};
    }catch(error) {
        return {error : error};
    }
};

exports.deleteSignature = async function(pet, sig) {
    const connection = await db.getPool().getConnection();
    const q = 'DELETE FROM Signature WHERE petition_id = ? and signatory_id = ?';
    try {
        const [result, _] = await connection.query(q, [ pet, sig ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}
exports.getAuthor = async function(id) {
    const connection = await db.getPool().getConnection();
    const q = 'SELECT author_id \
               FROM Petition \
               WHERE petition_id = ?';
    try {
        const [result, _] = await connection.query(q, [ id ]);
        connection.release();
        return result;
    }catch(error) {
        return {error : error};
    }
}

