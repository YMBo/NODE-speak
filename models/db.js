var dburl=require("./dburl.js");
var MongoClient = require('mongodb').MongoClient;
//封装DAO层

function _connection(callback){
	var url=dburl.url;
	MongoClient.connect(url,function(err,db){
		callback(err,db);
	})
}

//查
exports.find=function(dataName,flag,json,page,callback){
	_connection(function(err,db){
		if(err){
			return;
		}
		var collection=db.collection(dataName);
		if(page == null && flag==null){
			collection.find(json).toArray(function(err,docs){
				callback(err,docs);
				db.close();
			})
		}else if(!flag){
		var limit=page.page;
		var skip=page.skip*limit;
			collection.find(json).skip(skip).limit(limit).toArray(function(err,docs){
				callback(err,docs);
				db.close();
			})
		}else if(flag){
		var limit=page.page;
		var skip=page.skip*limit;
		collection.find(json).sort(flag).skip(skip).limit(limit).toArray(function(err,docs){
			callback(err,docs);
			db.close();
		})
		}
		
	})
}
//增
exports.insertOne=function(dataName,json,callback){
	_connection(function(err,db){
		if(err){
			return;
		}
		var collection=db.collection(dataName);
		collection.insertOne(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
exports.insertMany=function(dataName,json,callback){
	_connection(function(err,db){
		if(err){
			return;
		}
		var collection=db.collection(dataName);
		collection.insertMany(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
//删除
exports.deleteOne=function(dataName,json,callback){
	_connection(function(err,db){
		if(err){
			return;
		}
		var collection=db.collection(dataName);
		collection.deleteOne(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
//改
exports.updateOne=function(dataName,json1,json2,callback){
	_connection(function(err,db){
		if(err){
			return;
		}
		var collection=db.collection(dataName);
		collection.updateOne(json1,{$set:json2},function(err,result){
			callback(err,result);
			db.close();
		})
	})
}