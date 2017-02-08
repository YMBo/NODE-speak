var express =require('express');
var app=express();
var router= require('./router/router.js');
var session = require('express-session');
//设置模板引擎
app.set('view engine','ejs');
//使用session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  /*cookie: { secure: true }*/  //这个破玩意一定要小心设置，因为如果设置了它，那么需要启用HTTPS的网站，才会设置cookie，如果访问了HTTP网站，那么不会设置cookie，沃日
}))
//静态页面
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'))
//路由表
app.get('/',router.showIndex);
app.get('/regist',router.showRegist);
app.get('/login',router.showSignIn);
/*处理剪裁*/
app.post('/cut',router.docut);
/*处理注销*/
app.get('/logon',router.delete)
//处理注册
app.post('/doregist',router.doregist);
app.post('/doregist2',router.doregist2);
//处理登录
app.post('/dosign',router.dosign);
/*处理发表说说*/
app.post('/dopublish',router.dopublish);
/*加载更多*/
app.post('/domore',router.domore);
/*我的说说*/
app.get('/my',router.my);
app.listen(3000);