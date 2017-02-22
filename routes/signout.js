var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/checks').checkLogin;

// GET /signout 登出
router.get('/', checkLogin, function(req, res, next) {
  // res.send(req.flash());
  //清空session中用户信息
  req.session.user = null;
  req.flash('success','登出成功');
  res.redirect('/posts');
});

module.exports = router;