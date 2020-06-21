exports.checkRegister = function (body) {
    const checkLen = this.checkLen(body);
    const checkNull = this.checkNullRegUser(body);
    const checkNum = this.checkNumReg(body);
    if (checkLen != null) {
        return "Bad Request: data."+ checkLen + " should NOT be shorter than 1 characters";
    }
    if (checkNull != null) {
        return "Bad Request: data should have required property '" + checkNull + "'";
    }
    if (checkNum != null) {
        return "Bad Request: data." + checkNum + " should be string"
    }
    if (!checkEmail(body.email)) {
        return "Bad Request: data.email should match format \"email\""
    }

    return null;
}
exports.checkLogin = function (body) {
    const checkLen = this.checkLen(body);
    const checkNum = this.checkNumReg(body);
    const checkNull = this.checkNullLogin(body);
    if (checkNull != null) {
        return "Bad Request: data should have required property '" + checkNull + "'";
    }
    if (checkLen != null) {
        return "Bad Request: data."+ checkLen + " should NOT be shorter than 1 characters";
    }
    if (checkNum != null) {
        return "Bad Request: data." + checkNum + " should be string"
    }
    if (!checkEmail(body.email)) {
        return "Bad Request: data.email should match format \"email\""
    }

}
exports.checkPatch = function (body) {
    const checkLen = this.checkLen(body);
    const checkNum = this.checkNumReg(body);
    if (checkLen != null) {
        return "Bad Request: data."+ checkLen + " should NOT be shorter than 1 characters";
    }
    if (checkNum != null) {
        return "Bad Request: data." + checkNum + " should be string"
    }
    if (body.email!= null &&!checkEmail(body.email)) {
        return "Bad Request: data.email should match format \"email\""
    }

}
exports.checkLen = function (body) {
    if(body.name != null && body.name.length === 0) {
        return "name";
    }
    if(body.email != null && body.email.length === 0) {
        return "email";
    }
    if (body.password != null && body.password.length === 0) {
        return "password";
    }
    if (body.currentPassword != null && body.currentPassword.length === 0) {
        return "current password";
    }
    if (body.city != null && body.city.length == 0) {
        return "city";
    }
    if (body.country != null && body.country.length == 0) {
        return "country";
    }
    return null;
}
exports.checkNullRegUser = function (body) {
    if(body.name == null) {
        return "name";
    }
    if(body.email == null) {
        return "email";
    }
    if(body.password == null) {
        return "password";
    }
    return null;
}
exports.checkNumReg = function (body) {
    if(body.name != null && !stringCheck(body.name)) {
        return "name";
    }
    if(body.email != null && !stringCheck(body.email)) {
        return "email";
    }
    if (body.password != null && !stringCheck(body.password)) {
        return "password";
    }
    if (body.city != null && !stringCheck(body.city)) {
        return "city";
    }
    if (body.country != null && !stringCheck(body.country)) {
        return "country";
    }
    return null;

}

function checkEmail(email) {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(String(email.toLowerCase()))
}
exports.checkNullLogin =  function(body){
    if(body.email == null) {
        return "email";
    }
    if(body.password == null) {
        return "password";
    }
    return null;
}


exports.checkPetitionRequest = function (title, description, categoryId, closingDate, currentDate) {
    if (title == null || title.length == 0 || stringCheck(title) == false) {
        return "title";
    }
    if (description == null || stringCheck(description) == false) {
        return "description";
    }
    if (categoryId == null || numberCheck(categoryId) == false) {
        return "categoryId";
    }
    if (closingDate != null && (closingDate == 'Invalid Date' || currentDate > closingDate)) {
        return "closingDate";
    }
    return null;
}

exports.checkPetitionPatch = function (title, description, category, closingDate, closingDateString, currentDate) {
    if (title != null && (title.length == 0  || stringCheck(title) == false)) {
        return "title";
    }
    if (description != null && stringCheck(description) == false) {
        return "description";
    }
    if (category != null && numberCheck(category) == false) {
        return "category_id";
    }
    if (closingDateString != null && (closingDate == 'Invalid Date' || currentDate > closingDate)) {
        return "closingDate";
    }

}

function stringCheck (value) {
    return typeof value === 'string' || value instanceof String;
}

function numberCheck (value) {
    return typeof value === 'number' && isFinite(value);
}
function checkDate (value) {
    return value instanceof Date;
}

