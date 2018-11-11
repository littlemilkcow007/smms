var express = require('express');
var router = express.Router();
//引入crypto
var crypto=require('crypto');



//引入myql
var mysql=require('mysql');
//连接数据库
var connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'smms'
})
//打开数据库连接
connection.connect();
/* 增加管理员账号路由 */
router.post('/add', function(req, res, next) {
  //获取前端请求的数据
  let {pass,username,group}=req.body;
  //创建加密实例//加密明文密码//返回16进制加密的密码
  pass=crypto.createHash('md5').update(pass).digest('hex');
  
  //定义sql语句
  let sqlStr=`insert into usertable(userName,userPwd,userGroup) values(?,?,?)`;
  //定义参数数组
  let sqlParams=[username,pass,group];
  //执行sql
  connection.query(sqlStr,sqlParams,(err,result)=>{
    if(err) throw err;
    //返回结果给前端
    if(result.affectedRows>0){
      res.send({'isOk':true,'msg':'添加成功'});
    }else{
      res.send({'isOk':false,'msg':'添加失败'});
    }
  })
});

/* 读取管理员信息路由 */
router.get('/list',function(req,res){
  //定义sql语句
  let sqlStr='select u_id,userName,userGroup,createDatetime from usertable order by u_id desc';
  //执行sql
  connection.query(sqlStr,(err,result)=>{
    if(err) throw err;
    res.send(result);
  })
})
/* 删除管理员信息路由 */
router.get('/del',function(req,res){
  //获取前端发送的参数
  let id=req.query.id;
  //定义sql语句
  let sqlStr='delete from usertable where u_id=?';
  //定义sql参数数组
  let sqlParams=[id];
  //执行sql
  connection.query(sqlStr,sqlParams,(err,result)=>{
    if(err) throw err;
    if(result.affectedRows>0){
      res.send({'isOk':true,msg:'删除成功'});
    }else{
      res.send({'isOk':false,msg:'删除失败'});     
    }
  })
})

//通过id获取指定管理员的账号信息
router.get('/getById/:u_id',(err,data)=>{
  //接收参数
  let u_id=req.params.u_id;
  //通过u_id从数据库获取指定的管理员账号信息
  //创建加密实例//加密明文密码//返回16进制加密的密码
  pass=crypto.createHash('md5').update(pass).digest('hex');
  
  //定义sql语句
  let sqlStr='select userName,userPwd,userGroup from usertable';
  //执行sql
  connection.query(sqlStr,sqlParams,(err,result)=>{
    if(err) throw err;
    //返回结果给前端
    res.send(result);
  })
})
module.exports = router;
