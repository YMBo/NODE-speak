var formidable=require('formidable');
var db=require('../models/db.js');
var md5=require("../models/md5.js");
var gm=require('gm');
var path=require('path');
var fs=require('fs');
var moment=require('moment');

exports.showIndex=function(req,res,next){
	db.find("list",{"time":-1},{},{'page':10,'skip':0},function(err,docs){
		if(err){return;}
		var list=docs;
		/*将头像插入*/
		(function iterator(i){
			if(i==list.length){
				res.render('index',{
					'login' : req.session.login == '1' ? true :false,
					'username' : req.session.login == '1' ? req.session.username : "",
					'avatar': req.session.login == '1' ? req.session.avatar:"/avatar",
					/*填充说说*/
					'list': list
				});
				return;
			}
			db.find("shuoshuo",null,{"name":list[i].name},null,function(err,docs){
				if(err){return;}
				list[i].avatar=docs[0].avatar;
				iterator(++i);
			})
		})(0);
	})
}
exports.showRegist=function(req,res,next){
	res.render('regist')
}
//登录
exports.showSignIn=function(req,res,next){
	res.render('signIn')
}
/*注销*/
exports.delete=function(req,res){
	if(req.session.login){
		req.session.login=null;
		req.session.username =null;
		req.session.avatar=null;
		res.json('1');
	}else{
		res.json('-1');
		return;
	}
}
exports.doregist=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		var password=fields.password;
		//用MD5加密
		var password2=md5(md5(password).substr(5,5)+md5(password));
		db.insertOne("shuoshuo",{'name':fields.name,"password":password2,'avatar':'/avatar.png'},function(err,result){
			if(err){
				return;
			}
			req.session.login='1';
			req.session.username=fields.name;
			req.session.avatar='/avatar.png';
			res.json('1')
		})
	})
}


//判断用户名是否重复
exports.doregist2=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		db.find("shuoshuo",null,{"name":fields.name},null,function(err,docs){
			if(docs.length != 0){
				res.json('2');
			}else{
				res.json('1');
			}
		})
	})
}

//处理登录
exports.dosign=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		db.find("shuoshuo",null,{"name":fields.name},null,function(err,docs){
			if(err){
				console.log(err);
				return;
			}else{
				var password=fields.password;
				//用MD5加密
				var password2=md5(md5(password).substr(5,5)+md5(password));
				if(docs.length == 0){
					res.json('-1');
				}else if(docs[0].password == password2){
					req.session.login='1';
					req.session.username=fields.name;
					req.session.avatar=docs[0].avatar;
					res.json('1');
				}else{
					res.json('0')
				}			
			}
		})
	})
}
/*处理剪裁*/
exports.docut=function(req,res){
	if( !req.session.login ){
		res.json({value:'3',avatar:null});
		return;
	}
	var reg=/avatar\\(\w+$)*/;
	var form = new formidable.IncomingForm();
	form.uploadDir=path.normalize(__dirname+'/../avatar');
	form.parse(req,function(err,fields,files){
		if(err){
			res.json({value:'-1',avatar:null});
			return;
		}
		/*获取图片名称*/
		var type=files.img.name.substr( -(files.img.name.length-files.img.name.lastIndexOf('.')) );
		var filesUurl=reg.exec(files.img.path)[1];
		var pathtrue=path.normalize(__dirname+'/../avatar/'+filesUurl+type);
		var pathname=filesUurl+type;
		console.log(files.img.name.substr( -(files.img.name.length-files.img.name.lastIndexOf('.')) ))
		fs.rename(files.img.path, pathtrue ,function(err){
			if(err){
				flagerr=false;
				return;
			}
			gm(pathtrue)
			.resize(fields.boundx,fields.boundy)
			.crop(fields.w, fields.h, fields.x1, fields.y1)
			.write(pathtrue,function (err) {
				if(err){
					/*如果失败删除文件*/
					fs.unlink(pathtrue,function(err){
						if(err){
							return;
						}
					})
					res.json({value:'-1',avatar:null});
					return;
				}
				/*如果成功删除之前图片*/
				db.find("shuoshuo",null,{"name":req.session.username},null,function(err,docs){
					if(docs[0].avatar != '/avatar.png'){
						fs.unlink( path.normalize(__dirname+'/../avatar/'+docs[0].avatar),function(err){
							if(err){
								return;
							}
						})
					}
				})
				/*更新用户头像信息*/
				db.updateOne("shuoshuo",{"name":req.session.username},{ "avatar" : pathname},function(err){
					if(err){
						res.json({value:'-1',avatar:null});
						return;
					}
					req.session.avatar=pathname;
					res.json({value:'1',avatar:pathname});
				})
			})
		})
	})
		/*改名和移动*/	
}
/*处理发表说说*/
exports.dopublish=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		if(err){
			res.json({
				'state':'-1'
			});
			return;
		}
		/*插入list数据库*/
		db.insertOne('list',{
			'name':fields.name,
			'content':fields.content,
			'time':moment(new Date()).format('YYYY年MM月DD日HH:mm:ss')
		},function(err,result){
			if(err){
				res.json({
					'state':'-1'
				});
				return;
			}
			/*成功*/
			res.json({
				'state':'1',
				'time':moment(new Date()).format('YYYY年MM月DD日HH:mm:ss')
			});
		})
	})
}
/*加载更多*/
exports.domore=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		/*这块一定要注意总是提示page limit不是整数  好像ajax发送过来就成了字符串了吧，必须转化一下*/
		db.find("list",{"time":-1},{},{'page':parseInt(fields.page),'skip':parseInt(fields.skip)},function(err,docs){
			if(err){return;}
			var list=docs;	
			if(list.length==0){
				res.json('-1');
				return;
			}

			(function iterator(i){
				if(i==list.length){
					res.json(list);
					return;
				}
				db.find("shuoshuo",null,{"name":list[i].name},null,function(err,docs){
					if(err){return;}
					list[i].avatar=docs[0].avatar;
					iterator(++i);
				})
			})(0);
		})
	})
}
/*我的说说*/
exports.my=function(req,res){
	db.find("list",{"time":-1},{"name":req.session.username},{'page':10,'skip':0},function(err,docs){
			if(err){return;}
			var list=docs;
			/*将头像插入*/
			db.find("shuoshuo",null,{"name":req.session.username},null,function(err,docs){
				console.log(docs)
				if(err){return;}
				for(var i=0;i<list.length;i++){
					list[i].avatar=docs[0].avatar;
				}
				res.render('my',{
					'login' : req.session.login == '1' ? true :false,
					'username' : req.session.login == '1' ? req.session.username : "",
					'avatar': req.session.login == '1' ? req.session.avatar:"/avatar",
					/*填充说说*/
					'list': list
				});
				return;
			})
	})
}