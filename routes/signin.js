var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/checks').checkNotLogin;

//GET /signin 登录页
router.get('/',checkNotLogin,function(req,res,next) {
  // res.send(req.flash());
  res.render('signin');
});

//POST /signin 用户登录
router.post('/',checkNotLogin,function(req,res,next){
  // res.send(req.flash());
  var name = req.fields.name;
  var password = req.fields.password;
  UserModel.getUserByName(name)
    .then(function(user){
      if(!user){
        req.flash('error','用户不存在'+JSON.stringify(user));
        return res.redirect('back');
      }
      if(sha1(password)!==user.password){
        req.flash('error','用户或密码错误');
        return res.redirect('back');
      }
      req.flash('success','登录成功');
      //用户信息写入session
      delete user.password;
      req.session.user = user;
      //跳转到主页
      res.redirect('/posts');
    })
      .catch(next);
});

module.exports = router;  