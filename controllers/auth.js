const passport = require('passport');

const User = require('../models/user');

exports.getLandingPage = (req, res, next) => {
    res.render('landing');
}

exports.getAdminLoginPage = (req, res, next) => {
    res.render("admin/adminLogin");
}

exports.getAdminLogout = (req, res, next) => {
    req.logout();
    res.redirect("/");
}

exports.getAdminSignUp = (req, res, next) => {
    res.render('signup');
}

exports.postAdminSignUp = async(req, res, next) => {
    try {
        if(req.body.adminCode == "FIEK 2021") {
            const newAdmin = new User({
                username : req.body.username,
                email : req.body.email,
                isAdmin : true,
            });

            const user = await User.register(newAdmin, req.body.password);
            await passport.authenticate("local")(req, res, () => {
                req.flash("success", "Pershendetje, " + user.username + " Miresevini ne faqen kryesore te biblotekes!");
                res.redirect("/admin");
            })
        }
    } catch(err) {
        console.log(err);
        req.flash("error", "Informacioni i dhene perputhet me informacionin e regjistrimit te perdoruesit. Ju lutem jepni informacione tjera per tu regjistruar si administrator.");
        return res.render("admin/signup");
    } 
}

exports.getUserLoginPage = (req, res, next) => {
    res.render("user/userLogin");
}

exports.getUserLogout = (req, res, next) => {
    req.logout();
    res.redirect("/");
}

exports.getUserSignUp = (req, res, next) => {
    res.render("user/userSignup");
}

exports.postUserSignUp = async(req, res, next) => {
    try {
        const newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            username : req.body.username,
            email : req.body.email,
            gender : req.body.gender,
            address : req.body.address,
         });
    
         await User.register(newUser, req.body.password);
         await passport.authenticate("local")(req, res, () => {
            res.redirect("/user/1")
         }); 
    } catch(err) {
        console.log(err);
        return res.render("user/userSignup");
    }
}
