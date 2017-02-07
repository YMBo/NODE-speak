# NODE说说    
 这是用nodejs，express， mongodb 搭建的一个node说说小网站    
  在做完之后，遇到了许多小bug，修改后传了上来    
  用到的模块有`formidable`，`md5.js`,`gm`,`path`,`fs`,`moment`        
* 加密方式：MD5    
* 剪裁工具： GraphicsMagick 模块gm    
* 前台本地预览    
  
  
1. 里面有一个修改头像的功能，前台用的是本地预览，然后将剪裁数据提交到后台通过gm模块进行剪裁，每一次修改头像后都会吧这个用户上一个头像删除，这样    
  就减少了空间的使用    
* 修改头像使用ajax实现的，由于ajax不能上传文件，所以用的`ajaxform`插件
