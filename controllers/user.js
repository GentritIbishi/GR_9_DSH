const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

const User = require("../models/user"),
      Activity = require("../models/activity"),
      Book = require("../models/book"),
      Issue = require("../models/issue");



const PER_PAGE = 5;

exports.getUserDashboard = async(req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req. user._id;

    try {
        const user = await User.findById(user_id);
      
        const activities = await Activity
            .find({"user_id.id": req.user._id})
            .sort('-entryTime')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const activity_count = await Activity
            .find({"user_id.id": req.user._id})
            .countDocuments();

        res.render("user/index", {
            user : user,
            current : page,
            pages: Math.ceil(activity_count / PER_PAGE),
            activities : activities,
        });
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}

exports.getUserProfile = (req, res, next) => {
    res.render("user/profile");
}

exports.putUpdatePassword = async(req, res, next) => {
    const username = req.user.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.password;

    try {
        const user = await User.findByUsername(username);
        await user.changePassword(oldPassword, newPassword);
        await user.save();

        const activity = new Activity({
            category: "Perditeso fjalekalimin",
            user_id : {
                id : req.user._id,
                username : req.user.username,
            },
        });
        await activity.save();

        req.flash("success", "Fjalekalimi juaj eshte perditesuar. Ju lutem kyquni perseri per ta konfirmuar.");
        res.redirect("/auth/user-login");
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}

exports.putUpdateUserProfile = async(req, res, next) => {
    try{
        const userUpdateInfo = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "gender": req.body.gender,
            "address": req.body.address,
        }
        await User.findByIdAndUpdate(req.user._id, userUpdateInfo);

        const activity = new Activity({
            category: "Perditeso profilin",
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect('back');
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}


  


exports.postIssueBook = async(req, res, next) => {
    if(req.user.bookIssueInfo.length >= 5) {
        req.flash("warning", "Ju nuk mund te merrni me shume se 5 libra njekohesisht.");
        return res.redirect("back");
    }

    try {
        const book = await Book.findById(req.params.book_id);
        const user = await User.findById(req.params.user_id);

        book.stock -= 1;
        const issue =  new Issue({
            book_info: {
                id: book._id,
                title: book.title,
                author: book.author,
                ISBN: book.ISBN,
                category: book.category,
                stock: book.stock,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        user.bookIssueInfo.push(book._id);

        const activity = new Activity({
            info: {
                id: book._id,
                title: book.title,
            },
            category: "Merr",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        await issue.save();
        await user.save();
        await book.save();
        await activity.save();

        res.redirect("/books/all/all/1");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}
exports.getShowRenewReturn = async(req, res, next) => {
    const user_id = req.user._id;
    try {
        const issue = await Issue.find({"user_id.id": user_id});
        res.render("user/return-renew", {user: issue});
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}
exports.postReturnBook = async(req, res, next) => {
    try {
        const book_id = req.params.book_id;
        const pos = req.user.bookIssueInfo.indexOf(req.params.book_id);
        
        const book = await Book.findById(book_id);
        book.stock += 1;
        await book.save();

        const issue =  await Issue.findOne({"user_id.id": req.user._id});
        await issue.remove();

        req.user.bookIssueInfo.splice(pos, 1);
        await req.user.save();

        const activity = new Activity({
            info: {
                id: issue.book_info.id,
                title: issue.book_info.title,
            },
            category: "Kthe",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect("/books/return-renew");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}

exports.deleteUserAccount = async (req, res, next) => {
    try {
        const user_id = req.user._id;

        const user = await User.findById(user_id);
        await user.remove();
    
        await Issue.deleteMany({"user_id.id": user_id});
        
        await Activity.deleteMany({"user_id.id": user_id});

        res.redirect("/auth/user-signup");
    } catch (err) {
        console.log(err);
        res.redirect('/auth/user-signup');
    }
}

