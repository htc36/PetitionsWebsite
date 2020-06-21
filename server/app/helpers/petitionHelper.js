exports.checkGetPetition = function (item) {
    const numberCheck = this.numberCheck(item)
    if(numberCheck != null){
        return "Bad Request: data." + numberCheck + " should be integer"
    }
    if(item.sortBy != null && isNaN(parseInt(item.sortBy)) === false){
        return "Bad Request: data.sortBy should be string";
    }
    if(item.sortBy != null && this.sortByCheck(item.sortBy)){
        return "Bad Request: data.sortBy should be equal to one of the allowed values"
    }
    return null;
}
exports.numberCheck = function (item) {
    if (item.categoryId != null && isNaN(parseInt(item.categoryId))) {
        return "categoryId";
    }
    if (item.authorId != null && isNaN(parseInt(item.authorId))) {
        return "authorId";
    }
    if (item.count != null && isNaN(parseInt(item.count))) {
        return "count";
    }
    if (item.startIndex != null && isNaN(parseInt(item.startIndex))) {
        return "startIndex";
    }
    return null;
}

exports.sortByCheck = function (sortBy) {
    const allowedSorts = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'SIGNATURES_ASC', 'SIGNATURES_DESC'];
    if (allowedSorts.includes(sortBy) === false){
        return true;
    }
    return false;
}
exports.numCheck = function (id) {
    if (isNaN(id)){
        return true;
    }
    return false;
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

