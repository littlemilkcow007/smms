var express = require('express');
var router = express.Router();
//引入crypto
var crypto = require('crypto');
//引入数据库
var connection=require('./con.js');


//引入myql
var mysql = require('mysql');
//连接数据库
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'smms'
})
//打开数据库连接
connection.connect();
/* 增加管理员账号路由 */
router.post('/add', function (req, res, next) {
  //获取前端请求的数据
  let { pass, username, group } = req.body;
  //创建加密实例//加密明文密码//返回16进制加密的密码
  pass = crypto.createHash('md5').update(pass).digest('hex');

  //定义sql语句
  let sqlStr = `insert into usertable(userName,userPwd,userGroup) values(?,?,?)`;
  //定义参数数组
  let sqlParams = [username, pass, group];
  //执行sql
  connection.query(sqlStr, sqlParams, (err, result) => {
    if (err) throw err;
    //返回结果给前端
    if (result.affectedRows > 0) {
      res.send({ 'isOk': true, 'msg': '添加成功' });
    } else {
      res.send({ 'isOk': false, 'msg': '添加失败' });
    }
  })
});

/* 读取管理员信息路由 */
router.get('/list', function (req, res) {
  //定义sql语句
  let sqlStr = 'select u_id,userName,userGroup,createDatetime from usertable order by u_id desc';
  //执行sql
  connection.query(sqlStr, (err, result) => {
    if (err) throw err;
    res.send(result);
  })
})
/* 删除管理员信息路由 */
router.get('/del', function (req, res) {
  //获取前端发送的参数
  let id = req.query.id;
  //定义sql语句
  let sqlStr = 'delete from usertable where u_id=?';
  //定义sql参数数组
  let sqlParams = [id];
  //执行sql
  connection.query(sqlStr, sqlParams, (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ 'isOk': true, msg: '删除成功' });
    } else {
      res.send({ 'isOk': false, msg: '删除失败' });
    }
  })
})

/* 通过id获取指定管理员的账号信息 */
router.get('/getById/:id', (req, res) => {
  //接收参数
  let u_id = req.params.id;
  //通过u_id从数据库获取指定的管理员账号信息
  //定义sql语句
  let sqlStr = 'select userName,userPwd,userGroup,u_id from usertable where u_id=?';
  let sqlParams = [u_id];
  //执行sql
  connection.query(sqlStr, sqlParams, (err, result) => {
    if (err) throw err;
    //返回结果给前端
    res.send(result);
  })
})

/* 增加管理员账号路由 */
router.post('/edit', function (req, res, next) {
  //获取前端请求的数据
  let { pass, username, group, oldPwd, u_id } = req.body;
  //判断密码是否改变，改变了则进行加密，否则不加密
  if (oldPwd != pass) {
    //创建加密实例//加密明文密码//返回16进制加密的密码
    pass = crypto.createHash('md5').update(pass).digest('hex');
  }
  //定义sql语句
  let sqlStr = 'update usertable set userName=?,userPwd=?,userGroup=? where u_id=?';
  //定义参数数组
  let sqlParams = [username, pass, group, u_id];
  //执行sql
  connection.query(sqlStr, sqlParams, (err, result) => {
    if (err) throw err;
    //返回结果给前端
    if (result.affectedRows > 0) {
      res.send({ 'isOk': true, 'msg': '修改成功' });
    } else {
      res.send({ 'isOk': false, 'msg': '修改失败' });
    }
  })
});

/* 登录用户的验证路由 */
router.post('/loginCheck', (req, res, next) => {
  //获取前端请求过来的参数
  let { username, pass } = req.body;
  pass = crypto.createHash('md5').update(pass).digest('hex');
  //定义sql语句
  let sqlStr = 'select u_id from usertable where userName=? and userPwd=?'
  let sqlParams = [username, pass];
  //执行sql语句
  connection.query(sqlStr, sqlParams, (err, result) => {
    if (err) throw err;
    //如果得到的结果数组的长度大于0则表示用户的账号和密码匹配
    if (result.length > 0) {
      //写入cookie
      res.cookie('userName', username);
      res.cookie('u_id', result[0].u_id);
      res.send({ 'isOk': true, 'msg': '登录成功'});
    } else {
      res.send({ 'isOk': false, 'msg': '账号或者密码错误' })
    }
  })
})
/* 退出登录 */
router.get('/loginOut', (req, res, next) => {
  //清除cookie
  res.clearCookie('userName');
  res.clearCookie('u_id');
  //跳转到登录页面
  res.redirect("/login.html");
})
/* 建围墙避免用户输入网址随意进入 */
router.get('/checkState', (req, res, next) => {
  //读取cookie
  var username=req.cookies.userName;
  //如果不存在就跳转到登录页面
  if(!username){ 
   res.send('alert("请先登录");location.href="login.html"');
 // res.redirect('/login.html');
  }else{
    res.send("");
  }
})
module.exports = router;
