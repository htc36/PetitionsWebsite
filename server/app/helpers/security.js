exports.checkAuth = function (result, res) {
    if (result == null) {
        res.statusMessage = "Bad Request: Not logged in";
        res.status(401).send();
        return ;
    }
    if (req.params.userId != result.user_id) {
        res.statusMessage = "Bad Request: Unauthorized";
        res.status(401).send();
        return false;
    }

}

