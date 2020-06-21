const bcrypt = require('bcryptjs');
exports.generateHash = async function (password) {
    await bcrypt.hash(password, 1, function (err, hash) {
        return hash;
    });


}