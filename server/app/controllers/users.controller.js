const Users = require('../models/users.model');
const passwordHelper = require('../helpers/passwordhelper');
const helper = require('../helpers/helpers');
const bcrypt = require('bcryptjs');
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(UIDGenerator.BASE16);
const fs = require('mz/fs');

exports.create = async function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;

    const checker = helper.checkRegister(req.body);
    if (checker != null) {
        res.statusMessage = checker;
        res.status(400)
            .send();
        return;
    }

    try {
        const hash = bcrypt.hashSync(password, 3);
        const result = await Users.insert(name, email, hash, city, country);
        const id = result.id;
        if ("error" in result) {
            res.statusMessage = "Bad Request: email already in use";
            res.status(400).send();
        } else {
            res.status(201)
                .json({
                    userId: id
                });
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR creating user ${err}`);
    }
};


exports.login = async function(req, res) {
    const email = req.body.email;
    const pass = req.body.password;
    const checker = helper.checkLogin(req.body);
    if (checker != null) {
        res.statusMessage = checker;
        res.status(400)
            .send();
        return;
    }
    try {
        const result = await Users.findByEmail(email);
        if (result == null) {
            res.statusMessage = "Bad Request: invalid email/password supplied";
            res.status(400).send();
            return
        }
        const correctPass = result.password;
        const id = result.user_id;
        const token = uidgen.generateSync();
        if (!bcrypt.compareSync(pass, correctPass)) {
            res.statusMessage = "Bad Request: invalid password supplied";
            res.status(400).send();
        } else {
            await Users.insertToken(id, token);
            res.status(200)
                .json({
                    userId: id,
                    token: token
                });
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR logging in ${err}`);
    }
}

// ip addr  4941   132.181.14.104

exports.logout = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    try {
        const result = await Users.removeToken(token);
        if (result.changedRows === 0) {
            res.statusMessage = "Bad Request: Unauthorized";
            res.status(401).send();
        }else {
            res.status(200).send();
        }
    } catch (error) {
        res.status(500)
            .send(`ERROR logging out ${err}`);
    }
}
exports.getOneUser = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const userId = req.params.userId;
    try {
        const tokenUser = await Users.getTokenData(token);
        const userFromId = await Users.getUser(userId);
        if (userFromId == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null || userId != tokenUser.user_id) {
            res.status(200)
                .json({
                    "name": userFromId.name,
                    "city": userFromId.city,
                    "country": userFromId.country
                });
        }
        else {
            res.status(200)
                .json({
                    "name": userFromId.name,
                    "email": userFromId.email,
                    "city": userFromId.city,
                    "country": userFromId.country
                });
        }

    } catch (error) {
        res.status(500)
            .send(`ERROR logging out ${err}`);
    }
}

exports.editOneUser = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const userId = req.params.userId;

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;
    const currentPassword = req.body.currentPassword;
    let query = "UPDATE User SET ";
    const checker = helper.checkPatch(req.body);

    try {
        const tokenUser = await Users.getTokenData(token);
        const userFromId = await Users.getUser(userId);
        if (userFromId == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null)  {
            res.status(401).send();
            return;
        }
        if (userId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }
        if (checker != null) {
            res.statusMessage = checker;
            res.status(400)
                .send();
            return;
        }
        if(name != null) {
            query += "name = '" + name + "',";
        }
        const emailUser = await Users.findByEmail(email);
        if(email != null) {
            if (emailUser != null) {
                if (userFromId.email != email) {
                    res.statusMessage = "Bad Request: email already in use";
                    res.status(400).send();
                    return;
                }
            }
            query += "email = '" + email + "',";
        }
        if (password != null) {
            const correctPass = tokenUser.password;
            if (currentPassword == null || !bcrypt.compareSync(req.body.currentPassword, correctPass)) {
                res.statusMessage = "Bad Request: invalid password supplied";
                res.status(400).send();
                return;
            }
            query += "password = '" + password + "',";
        }
        if (city != null) {
            query += "city = '" + city + "',";
        }
        if (country != null) {
            query += "country = '" + country + "',";
        }
        if (query == "UPDATE User SET ") {
            res.statusMessage = "Bad Request: No changes given";
            res.status(400).send();
            return;
        }
        query = query.slice(0,-1);
        query += " WHERE user_id = " + userId;

        const result = await Users.patchUser(query);
        if ("error" in result){
            res.status(500).send(result);
            return;
        }
        const updatedUser = await Users.getUser(userId);
        res.status(200).send(updatedUser);

    } catch (error) {
        res.status(500)
            .send(`ERROR editing user ${error}`);
    }
}

exports.insertPhoto = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const userId = req.params.userId;
    try {
        const userFromId = await Users.getUser(userId);
        const tokenUser = await Users.getTokenData(token);
        if (userFromId == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        if (userId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }
        const id = req.params.userId;
        const photoType = req.headers['content-type'].split('/')[1];
        let photoName = `user_${id}.${photoType}`;
        const allowedTypes = ['png', 'jpeg', 'jpg', 'gif'];
        if (allowedTypes.includes(photoType) == false) {
            res.statusMessage= "Not allowed image type";
            res.status(400).send();
            return;
        }
        await fs.writeFile("storage/default/" + photoName, req.body, "binary", () => {});
        await Users.updatePhoto(photoName, id);
        if (userFromId.photo_filename == null) {
            res.status(201).send();
        } else {
            res.status(200).send();
        }

    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}
exports.getPhoto = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const userId = req.params.userId;
    try {
        const userFromId = await Users.getUser(userId);
        const photoName = userFromId.photo_filename;
        if (userFromId == null) {
            res.status(404).send();
            return;
        }
        if (userFromId.photo_filename == null) {
            res.status(404).send();
            return;
        }
        const photoType = photoName.split('.')[1];
        fs.readFile('storage/default/' + photoName, function (err, content) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.writeHead(200,{'Content-type':'image/' + photoType});
                res.end(content);
            }
        });


    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}
exports.removePhoto = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const userId = req.params.userId;
    try {
        const userFromId = await Users.getUser(userId);
        const tokenUser = await Users.getTokenData(token);
        if (userFromId == null || userFromId.photo_filename == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        if (userId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }
        fs.unlink('storage/default/' + userFromId.photo_filename, function (err) {
            if (err) {
                res.status(400).send("Photo can't be deleted")
                return;
            }
        });
        await Users.deletePhoto(userId);
        res.status(200).send();
    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}

