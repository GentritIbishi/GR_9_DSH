const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware");

const userController = require('../controllers/user');

router.get("/user/:page", middleware.isLoggedIn, userController.getUserDashboard);

router.get("/user/:page/profile", middleware.isLoggedIn, userController.getUserProfile);

router.get("/chat",middleware.isLoggedIn,(req,res)=>{
    res.render('user/index1');
});
router.get("/video-chat",middleware.isLoggedIn,(req,res)=>{
    res.render('index')
})

router.put("/user/1/update-password", middleware.isLoggedIn, userController.putUpdatePassword);

router.put("/user/1/update-profile", middleware.isLoggedIn, userController.putUpdateUserProfile);

router.post("/books/:book_id/issue/:user_id", middleware.isLoggedIn, userController.postIssueBook);

router.get("/books/return-renew", middleware.isLoggedIn, userController.getShowRenewReturn);

router.post("/books/return/:book_id", middleware.isLoggedIn, userController.postReturnBook);

router.delete("/user/1/delete-profile", middleware.isLoggedIn, userController.deleteUserAccount);

module.exports = router;