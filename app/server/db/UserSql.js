var User={
	//查询用户名
	queryUserName(param){
		if(param.userName){
			return "select * from user where userName = '"+param.userName+"' or phone = '"+param.userName+"' ";
		}else{
			//第三方登录
			return "select * from user where provider = '"+param.provider+"' and openid = '"+param.openId+"' ";
		}
	},
	//验证用户名和密码
	queryUserPwd( param ){
		return "select * from user where ( userName = '"+param.userName+"' or phone = '"+param.userName+"') and userPwd = '"+param.userPwd+"' ";
	},
	//增加一条用户数据
	insertData( param ){
		let userName=param.userName || param.openId.slice(0,2)
		let nickName=param.nickName || '默认昵称'
		let avatarUrl=param.avatarUrl || "../../static/img/logo.jpg"
		const jwt =require('jsonwebtoken')
		let payload={name:userName}  //用户名
		let secret='xiaoluxian'   //口令
		let token =jwt.sign(payload,secret)
		return 'insert into user (userName,userPwd,phone,imgUrl,nickName,token,provider,openid) values ("","12345678","'+userName+'","'+avatarUrl+'","'+nickName+'","'+token+'","'+param.provider+'","'+param.openId+'")';
	}
}
exports =module.exports=User