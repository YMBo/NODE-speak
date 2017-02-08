var crypto=require('crypto');
module.exports=function(date){
	var md5=crypto.createHash("md5");
	var date=md5.update(date).digest('base64');	
	return date;
}
