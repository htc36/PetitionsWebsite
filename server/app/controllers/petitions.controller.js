const Petitions = require('../models/petitions.model');
const Users = require('../models/users.model');
const helper = require('../helpers/petitionHelper');
const fs = require('mz/fs');

exports.getPetition = async function(req, res) {
    //Author and category filter
    const checker = helper.checkGetPetition(req.query);
    if (checker != null){
        res.statusMessage = checker;
        res.status(400)
            .send();
        return;
    }
    let whereConditions = "WHERE ";
    const authorId = req.query.authorId;
    const categoryId = req.query.categoryId;
    if (categoryId != null) {
        whereConditions += "Petition.category_id = " + categoryId;
        if (authorId != null) {
            whereConditions += " AND Petition.author_id = " + authorId
        }
    } else if (authorId != null) {
        whereConditions += "author_id = " + authorId;
    }

    //search terms
    const searchTerm = req.query.q;
    if (whereConditions != "WHERE " && searchTerm != null) {
        whereConditions += ' AND title LIKE "%' + searchTerm + '%"'
    } else if (whereConditions == "WHERE " && searchTerm != null)
        whereConditions += 'title LIKE "%' + searchTerm + '%"'
    if (whereConditions == "WHERE ") {
        whereConditions = "";
    }

    // Count and offset pagination
    let count = req.query.count;
    let offset = req.query.startIndex;
    if (count == null ) {
        count = 9999999999999;
    }
    if (offset == null) {
        offset = 0;
    }

    //Sorting of rows
    let sorting;
    switch (req.query.sortBy)  {
        case "ALPHABETICAL_ASC":
            sorting = "title ASC"
            break;
        case "ALPHABETICAL_DESC":
            sorting = "title DESC"
            break;
        case "SIGNATURES_ASC":
            sorting = "signatureCount ASC"
            break;
        default:
            sorting = "signatureCount DESC"
    }
    try {
        const result = await Petitions.gett(sorting, count, offset, whereConditions);
        res.status(200).json(result)
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.postPetition = async function(req, res) {
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = new Date(req.body.closingDate);
    let date = new Date();
    const token = req.header("X-Authorization") || "";
    try {
        const tokenUser = await Users.getTokenData(token);
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        const checker = helper.checkPetitionRequest(title, description, categoryId, closingDate, date)
        if (checker != null) {
            res.statusMessage = "Bad Request: data." + checker + " invalid"
            res.status(400).send()
            return;
        }

        //check the category id
        const checkCategory = await Petitions.checkCat(categoryId);
        if (checkCategory.length == 0) {
            res.statusMessage = "Bad Request: categoryId does not match any existing category"
            res.status(400).send()
            return;
        }

        //add data to database
        const result = await Petitions.createPetition(title, description, tokenUser.user_id, categoryId, date, closingDate);
        petitionId = result.insertId;
        res.status(201)
            .json({
                "petitionId": petitionId,
            });


    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}


exports.getOnePetition = async function(req, res) {
    const id = req.params.id;
    const checker = helper.numCheck(id);
    if (checker){
        res.status(404).send();
        return;
    }
    try {
        const petition = await Petitions.getPetition(id);
        if (petition == null || "error" in petition) {
            res.status(404).send();
        }
        else {
            res.status(200)
                .json(petition)
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR logging out ${err}`);
    }
}

exports.editOnePetition = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const id = req.params.id;

    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.categoryId;
    const closingDateString = req.body.closingDate;
    const closingDate = new Date(closingDateString);
    let currentDate = new Date();
    let query = "UPDATE Petition SET ";
    const checker = helper.checkPetitionPatch(title, description, category, closingDate, closingDateString, currentDate);

    try {
        const tokenUser = await Users.getTokenData(token);
        const petition = await Petitions.getPetition(id);
        if (tokenUser == null)  {
            res.status(401).send();
            return;
        }
        if (petition == null) {
            res.status(404).send();
            return;
        }
        if (petition.authorId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }
        if (checker != null) {
            res.statusMessage = "Bad Request: data."+ checker + " is invalid"
            res.status(400)
                .send();
            return;
        }

        //check the category id
        if (category != null) {
            const checkCategory = await Petitions.checkCat(category);
            if (checkCategory.length == 0) {
                res.statusMessage = "Bad Request: categoryId does not match any existing category"
                res.status(400).send()
                return;
            }
        }
        if (petition.closing_date != null && petition.closing_date < currentDate) {
            res.statusMessage = "Bad Request: petition has closed"
            res.status(400).send()
            return;
        }
        // create query
        if (title != null) {
            query += "title = '" + title + "',";
        }
        if (description != null) {
            query += "description = '" + description + "',";
        }
        if (category != null) {
            query += "category_id = '" + category + "',";
        }
        if (closingDateString != null) {
            query += "closing_date = '" + closingDate + "',";
        }
        if (query == "UPDATE Petition SET ") {
            res.statusMessage = "Bad Request: No changes given";
            res.status(400).send();
            return;
        }
        query = query.slice(0,-1);
        query += " WHERE petition_id = " + id;
        await Petitions.patchPetition(query);
        res.status(200).send();


    } catch (error) {
        res.status(500)
            .send(`ERROR editing user ${error}`);
    }
}

exports.removePetition = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const id = req.params.id;
    try {
        const petition = await Petitions.getPetition(id);
        const tokenUser = await Users.getTokenData(token);
        if (tokenUser == null)  {
            res.status(401).send();
            return;
        }
        if (petition == null) {
            res.status(404).send();
            return;
        }
        if (petition.authorId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }

        await Petitions.deletePetition(id);
        res.status(200).send();
    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}
exports.getCat = async function(req, res) {
    try {
        const result = await Petitions.getCategory();
        res.status(200).json(result);
        return;
    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}

exports.getPetitionPhoto = async function(req, res) {
    const id = req.params.id;
    try {
        const petition = await Petitions.getPetitionPhoto(id);
        if (petition == null || petition.photo_filename == null) {
            res.status(404).send();
            return;
        }
        const photoName = petition.photo_filename;

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

exports.insertPetitionPhoto = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const id = req.params.id;
    try {
        const petition = await Petitions.getPetition(id);
        const tokenUser = await Users.getTokenData(token);
        if (petition == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        if (petition.authorId != tokenUser.user_id) {
            res.status(403).send();
            return;
        }
        const photoType = req.headers['content-type'].split('/')[1];
        let photoName = `petition_${id}.${photoType}`;


        const allowedTypes = ['png', 'jpeg', 'jpg', 'gif'];
        if (allowedTypes.includes(photoType) == false) {
            res.statusMessage= "Not allowed image type";
            res.status(400).send();
            return;
        }
        await fs.writeFile("storage/default/" + photoName, req.body, "binary", () => {})



        await Petitions.updatePetitionPhoto(photoName, id);
        const photo = await Petitions.getPetitionPhoto(id);
        if (photo.photo_filename == null) {
            res.status(201).send();
        } else {
            res.status(200).send();
        }

    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}

exports.getSignatures = async function(req, res) {
    const id = req.params.id;
    try {
        const result = await Petitions.getSigs(id);
        if (result == null) {
            res.status(404).send();
            return;
        }
        res.status(200).json(result);
        return;
    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}

exports.insertSignature = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const id = req.params.id;
    let currentDate = new Date();
    try {
        const petition = await Petitions.getPetition(id);
        const tokenUser = await Users.getTokenData(token);
        if (petition == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        if (petition.closingDate != null && currentDate > petition.closingDate) {
            res.statusMessage = "Forbidden: cannot sign a petition that has closed"
            res.status(403).send();
            return;
        }
        const check = await Petitions.checkSigned(id, tokenUser.user_id);
        if (check[0] != null) {
            res.statusMessage = "Forbidden: cannot sign a petition more than once"
            res.status(403).send();
            return;
        }
        await Petitions.signPetition(id, tokenUser.user_id, currentDate);
        res.status(201).send();

    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}
exports.removeSignature = async function(req, res) {
    const token = req.header("X-Authorization") || "";
    const id = req.params.id;
    let currentDate = new Date();
    try {
        const petition = await Petitions.getPetition(id);
        const tokenUser = await Users.getTokenData(token);
        if (petition == null) {
            res.status(404).send();
            return;
        }
        if (tokenUser == null) {
            res.status(401).send();
            return;
        }
        if (petition.closingDate != null && currentDate > petition.closingDate) {
            res.statusMessage = "Forbidden: cannot remove signature from a closed petition"
            res.status(403).send();
            return;
        }
        const check = await Petitions.checkSigned(id, tokenUser.user_id);
        if (check[0] == null) {
            res.statusMessage = "Forbidden: cannot remove signature from a petition without first signing it"
            res.status(403).send();
            return;
        }
        const author = await Petitions.getAuthor(id);
        if (author[0].author_id == tokenUser.user_id) {
            console.log(petition);
            console.log(tokenUser.user_id);
            res.statusMessage = "Forbidden: cannot remove signature from a petition you created"
            res.status(403).send();
            return;
        }

        await Petitions.deleteSignature(id, tokenUser.user_id);
        res.status(200).send();

    }catch (error) {
        res.status(500).send(`error ${error}`)
    }
}











