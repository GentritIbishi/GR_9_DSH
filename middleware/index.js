const multer = require("multer");

const middleware = {};

middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Duhet te kyqeni se pari");
    res.redirect("/");
};

middleware.isAdmin = function(req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash("error", "Kjo rruge eshte e qasshme vetem per admin");
    res.redirect("/");
};

middleware.upload = multer({
      limits: {
        fileSize: 4 * 1024 * 1024,
      }
    });

module.exports = middleware;