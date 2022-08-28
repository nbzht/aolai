var express = require('express');
var router = express.Router();
var connection = require('../db/sql.js')
var user = require('../db/UserSql.js');
//验证码
let code = '';
//接入短信的sdk
var QcloudSms = require("qcloudsms_js");
const jwt = require('jsonwebtoken');
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

// 解决跨域问题
router.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	//Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});

//修改订单状态
router.post('/api/submitOrder', function(req, res, next) {
    let token = req.headers.token;
    let phone = jwt.decode(token);
    //订单号
    let orderId = req.body.orderId;
    //购物车中选中的商品
    let shopArr = req.body.shopArr;
    connection.query('select * from user where phone = "'+phone.name+'"', function (error, results, fields) {
    	//当前用户id
    	let userId = results[0].id;
        connection.query('select * from store_order where uId = "'+userId+'" and order_id = "'+orderId+'"',function(err,result){
            //订单的id
            let id = result[0].id;
                connection.query('update store_order set order_status = replace(order_status,"1","2") where id = "'+id+'"',function(){
                    shopArr.forEach(v=>{
                        connection.query('delete from goods_cart where id = "'+v+'"',function(){
                            
                        })
                    })
                    res.send({
						code:0,
                        data:{
                            code:200,
                            success:true
                        }
                    })
             })
        })
    })
})


//生成订单
router.post('/api/addOrder', function(req, res, next) {
	let token = req.headers.token;
	let phone = jwt.decode(token);
	//前端给后端传递的数据
	let goodsArr=req.body.newList
	//生成订单号
	function setTimeDateFmt(s){
		return s<10 ? '0'+s:s
	}
	function orderNumber(){
		const now=new Date()
		let fullYear = now.getFullYear();
		let month = setTimeDateFmt( now.getMonth() + 1 );
		let day = setTimeDateFmt( now.getDate() );
		let hour = setTimeDateFmt( now.getHours() );
		let minutes = setTimeDateFmt( now.getMinutes() );
		let seconds = setTimeDateFmt( now.getSeconds() );
		let orderCode = fullYear + month + day + hour + minutes + seconds + ( Math.round( Math.random() * 1000000 ));
		return orderCode;
	}
	//商品名称
	let goodsName=[]
	//订单总价
	let goodsPrice=0
	//订单商品数量
	let goodsNum=0
	//订单号
	let orderId=orderNumber()
	goodsArr.forEach(v=>{
		goodsName.push(v.name)
		goodsNum+=parseInt(v.num)
		goodsPrice+=parseInt(v.num)*parseInt(v.pprice)
	})
	connection.query('select * from user where phone = "'+phone.name+'"', function (error, results, fields) {
		//当前用户id
		let userId = results[0].id;
		connection.query('insert into store_order (uId,order_id,goods_name,goods_price,goods_num,order_status) values ("'+userId+'","'+orderId+'","'+goodsName+'","'+goodsPrice+'","'+goodsNum+'","1")',function(){
			connection.query('select * from store_order where uId = "'+userId+'" and order_id = "'+orderId+'"',function(err,result){
				res.send({
					code:0,
					data:{
						success:true,
						code:200,
						data:result
					}
				})
			})
		})
	})
	
})


//删除购物车商品数据
router.post('/api/deleteCart', function(req, res, next) {
	let goodsId=req.body.goodsId
	for(var i=0;i<goodsId.length;i++){
		connection.query('delete from goods_cart where id="'+goodsId[i]+'"',function(e,r){
			res.send({
				code:0,
				data:{
					success:true
				}
			})
		})
	}
	
})


//获取当前用户购物车列表
router.post('/api/selectCart', function(req, res, next) {
	let token = req.headers.token
	let phone = jwt.decode(token)
	connection.query('select * from user where phone = "' + phone.name + '"', function(error, results, fields) {
		//当前用户id
		let userId = results[0].id
		connection.query('select * from goods_cart where uId = "' + userId + '"', function(err,
		result) {
			res.send({
				code: 0,
				data: result
			})
		})
	})
})

//修改当前用户购物车商品数量
router.post('/api/updateNumCart', function(req, res, next) {
	let token=req.headers.token
	let phone =jwt.decode(token)
	//商品id
	let goodsId=req.body.goodsId
	//用户输入的商品数量
	let num=req.body.num
	connection.query('select * from user where phone = "'+phone.name+'"', function (error, results, fields) {
		//当前用户id
		let userId=results[0].id
		connection.query('select * from goods_cart where uId = "'+userId+'" and goods_id = "'+goodsId+'"', function (err, result) {
			//当前数据库中的数量
			let goods_num=result[0].num
			//当前的id号
			let id =result[0].id
			//修改[替换]
			connection.query('update goods_cart set num ="'+num+'" where id = "'+id+'"', function (e, r) {
				res.send({
					code:0,
					data:{
						success:'修改成功'
					}
				})
			})
		})
	})
})

//加入购物车
router.post('/api/addCart', function(req, res, next) {
	let token = req.headers.token;
	let phone = jwt.decode(token);
	//商品id
	let goods_id = req.body.goods_id;
	//用户输入的商品数量
	let num = req.body.num;
	connection.query('select * from user where phone = "'+phone.name+'"', function (error, results, fields) {
		//当前用户id
		let userId = results[0].id;
		connection.query('select * from goods_search where id = "'+goods_id+'"', function (err, result) {
			let name = result[0].name;
			let imgUrl = result[0].imgUrl;
			let pprice = result[0].pprice;
			//查询当前用户之前是否添加过这个商品
			connection.query('select * from goods_cart where uId = "'+userId+'" and goods_id = "'+goods_id+'"', function (err, data) {
				if(data.length>0){
					//如果当前用户已经添加过本商品,就让数量增加
					let updateNum=parseInt(num) + parseInt(data[0].num)
					connection.query('update goods_cart set num = "'+updateNum+'" where id = "'+data[0].id+'"', function (e, r) {
						res.send({
							code:0,
							data:{
								success:'加入成功'
							}
						})
					})
				}else{
					//如果当前用户之前没有加入过本商品,需要添加进入
					connection.query('insert into goods_cart (uId,goods_id,name,imgUrl,pprice,num) values ("'+userId+'","'+goods_id+'","'+name+'","'+imgUrl+'","'+pprice+'","'+num+'")', function (err, data) {
						res.send({
							code:0,
							data:{
								success:'加入成功'
							}
						})
					})
				}
			})
		})
	})
})


//当前用户修改收货地址
router.post('/api/updateAddress', function(req, res, next) {
	let token = req.headers.token;
	let phone = jwt.decode(token);
	let name = req.body.pathObj.name;
	let tel = req.body.pathObj.tel;
	let province = req.body.pathObj.province;
	let city = req.body.pathObj.city;
	let district = req.body.pathObj.district;
	let address = req.body.pathObj.address;
	let isDefault = req.body.pathObj.isDefault;
	let id = req.body.pathObj.id;

	//获取userId
	connection.query('select * from user where phone = "' + phone.name + '"', function(error, results, fields) {
		console.log(results)
		let userId = results[0].id;
		connection.query('select * from address where userId = "' + userId + '" and isDefault = "' +
			isDefault + '"',
			function(err, result) {
				let childId = result[0].id;
				connection.query(
					'update address set isDefault = replace(isDefault,"1","0") where id = "' +
					childId + '"',
					function(e, r) {
						let updateSql =
							'update address set name = ?,tel = ?,province = ?,city = ?,district = ?,address = ?,isDefault = ?,userId = ? where id = "' +
							id + '"'
						connection.query(updateSql, [name, tel, province, city, district,
							address, isDefault, userId
						], function(err, result) {
							res.send({
								data: {
									code: 0,
									success: '成功'
								}
							})
						})
					})
			})
	})
})



//当前用户新增收获地址
router.post('/api/addAddress', function(req, res, next) {
	let token = req.headers.token
	let phone = jwt.decode(token)
	let name = req.body.pathObj.name
	let tel = req.body.pathObj.tel
	let province = req.body.pathObj.province
	let city = req.body.pathObj.city
	let district = req.body.pathObj.district
	let address = req.body.pathObj.address
	let isDefault = req.body.pathObj.isDefault
	connection.query('select * from user where phone = "' + phone.name + '"', function(error, results, fields) {
		let id = results[0].id
		connection.query('select * from address where userId = "' + id + '" and isDefault = "' +
			isDefault + '"',
			function(er, re) {
				let childId = re[0].id;
				connection.query(
					'update address set isDefault = replace(isDefault,"1","0") where id = "' +
					childId + '"',
					function(e, r) {
						let sqlInert =
							'insert into address (name,tel,province,city,district,address,isDefault,userId) values ("' +
							name + '","' + tel + '","' + province + '","' + city + '","' +
							district + '","' + address + '","' + isDefault + '","' + id + '")';
						connection.query(sqlInert, function(err, result, field) {
							res.send({
								code: 0,
								data: {
									success: true
								}
							})
						})
					})
			})
	})
})


//当前用户查询收货地址
router.post('/api/selectAddress', function(req, res, next) {
	let token = req.headers.token
	let phone = jwt.decode(token)
	connection.query('select * from user where phone = "' + phone.name + '"', function(error, results, fields) {
		let id = results[0].id
		connection.query('select * from address where userId = "' + id + '"', function(err, result,
			field) {
			res.send({
				code: 0,
				data: result
			})
		})

	})
});

//第三方登录
router.post('/api/loginother', function(req, res, next) {
	//前端给后端的数据
	let params = {
		provider: req.body.provider, //登陆方式
		openId: req.body.openId, //用户身份Id
		nickName: req.body.nickName, //用户昵称
		avatarUrl: req.body.avatarUrl, //用户头像
	}
	//查询数据库中有没有此用户
	connection.query(user.queryUserName(params), function(error, results, fields) {
		if (results.length > 0) {
			//数据库中存在=>读取
			connection.query(user.queryUserName(params), function(e, r) {
				res.send({
					code: 0,
					data: r[0]
				})
			})
		} else {
			//数据库中不存在=>存储=>读取
			connection.query(user.insertData(params), function(err, result) {
				connection.query(user.queryUserName(params), function(e, r) {
					res.send({
						code: 0,
						data: r[0]
					})
				})
			})
		}
	})
})


//注册===>增加一条数据
router.post('/api/addUser', function(req, res, next) {
	//前端给后端的数据
	let params = {
		userName: req.body.userName,
		userCode: req.body.code
	};
	if (params.userCode == code) {
		connection.query(user.insertData(params), function(error, results, fields) {
			connection.query(user.queryUserName(params), function(err, result) {
				res.send({
					data: {
						code: 0,
						success: true,
						msg: "注册成功",
						data: result[0]
					}
				})
			})
		})
	}

})

//发送验证码
router.post('/api/code', function(req, res, next) {
		//前端给后端的数据
		let params = {
			userName: req.body.userName
		};
		// 短信应用 SDK AppID
		var appid = 1400187558; // SDK AppID 以1400开头
		// 短信应用 SDK AppKey
		var appkey = "dc9dc3391896235ddc2325685047edc7";
		// 需要发送短信的手机号码
		var phoneNumbers = [params.userName];
		// 短信模板 ID，需要在短信控制台中申请
		var templateId = 298000; // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请
		// 签名
		var smsSign = "三人行慕课"; // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请
		// 实例化 QcloudSms
		var qcloudsms = QcloudSms(appid, appkey);
		// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
		function callback(err, ress, resData) {
			if (err) {
				console.log("err: ", err);
			} else {
				code = ress.req.body.params[0];
				res.send({
					code: 0,
					data: {
						success: true,
						code: code
					}
				})
			}
		}
		var ssender = qcloudsms.SmsSingleSender();
		var paramss = [Math.floor(Math.random() * (9999 - 1000)) + 1000]; //发送的验证码
		ssender.sendWithParam("86", phoneNumbers[0], templateId,
			paramss, smsSign, "", "", callback);
	}),


	//注册验证手机号是否存在
	router.post('/api/registered', function(req, res, next) {

		//前端给后端的数据
		let params = {
			userName: req.body.phone
		};
		//查询手机号是否存在
		connection.query(user.queryUserName(params), function(error, results, fields) {
			if (results.length > 0) {
				res.send({
					code: 0,
					data: {
						success: false,
						msg: "手机号已经存在"
					}
				})
			} else {
				res.send({
					code: 0,
					data: {
						success: true
					}
				})
			}
		})

	}),

	//用户登录
	router.post('/api/login', function(req, res, next) {
		//前端给后端的数据
		let params = {
			userName: req.body.userName,
			userPwd: req.body.userPwd
		}
		//查询用户名或者手机号存在不存在
		connection.query(user.queryUserName(params), function(error, results, fields) {
			if (results.length > 0) {
				connection.query(user.queryUserPwd(params), function(err, result) {
					if (result.length > 0) {
						res.send({
							code: 0,
							data: {
								success: true,
								msg: "登录成功",
								data: result[0]
							}
						})
					} else {
						res.send({
							code: 0,
							data: {
								success: false,
								msg: "密码不正确"
							}

						})
					}
				})
			} else {
				res.send({
					code: 0,
					data: {
						success: false,
						msg: "用户名或手机号不存在"
					}

				})
			}
		})
	});

router.get('/api/goods/good:id', function(req, res, next) {
	let id = req.params.id;
	connection.query("select * from goods_search where id=" + id + "", function(error, results, fields) {
		if (error) throw error;
		res.send({
			code: "0",
			data: results
		})
	});
});

//分类页面数据渲染
router.get('/api/goods/list', function(req, res, next) {
	res.json({
		code: 0,
		data: [{
				id: 1,
				name: '家居家纺',
				data: [{
						name: '家纺',
						list: [{
								id: 1,
								name: '毛巾/浴巾',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '枕头',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
					{
						name: '生活用品',
						list: [{
								id: 1,
								name: '浴室用品',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '洗漱',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
				]
			},
			{
				id: 2,
				name: '女装',
				data: [{
						name: '裙装',
						list: [{
								id: 1,
								name: '半身裙',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '连衣裙',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
					{
						name: '上衣',
						list: [{
								id: 1,
								name: 'T恤',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '衬衫',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
				]
			},
			{
				id: 3,
				name: '男装',
				data: [{
						name: '裤子',
						list: [{
								id: 1,
								name: '毛巾/浴巾',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '枕头',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
					{
						name: '内裤',
						list: [{
								id: 1,
								name: '浴室用品',
								imgUrl: "../../static/img/list1.jpg"
							},
							{
								id: 2,
								name: '洗漱',
								imgUrl: "../../static/img/list1.jpg"
							}
						]
					},
				]
			},

		]
	})
});
//搜索页面数据渲染
router.get('/api/goods/search', function(req, res, next) {
	//desc降序 asc升序
	//获取对象的key
	let [goodsName, orderName] = Object.keys(req.query)
	//name参数的值
	let name = req.query.name
	let order = req.query[orderName];
	console.log(req.query, goodsName, orderName, name, order)
	connection.query("select * from goods_search where name like '%" + name + "%' order by " + orderName + " " +
		order + "",
		function(error, results, fields) {
			if (error) throw error;
			res.send({
				code: "0",
				data: results
			})
		});
})
//首页第一次加载的数据渲染
router.get('/api/index_list/data', function(req, res, next) {
	res.send({
		code: 0,
		data: {
			topBar: [{
					id: 1,
					name: '推荐'
				},
				{
					id: 2,
					name: '运动户外'
				},
				{
					id: 3,
					name: '服饰内衣'
				},
				{
					id: 4,
					name: '鞋靴箱包'
				},
				{
					id: 5,
					name: '美妆个护'
				},
				{
					id: 6,
					name: '家居数码'
				},
				{
					id: 7,
					name: '食品母婴'
				}
			],
			data: [{
					type: "swiperList",
					data: [{
							imgUrl: '../../static/img/swiper1.jpg'
						},
						{
							imgUrl: '../../static/img/swiper2.jpg'
						},
						{
							imgUrl: '../../static/img/swiper3.jpg'
						}
					]
				},
				{
					type: "recommendList",
					data: [{
							bigUrl: '../../static/img/Children.jpg',
							data: [{
									imgUrl: '../../static/img/Children1.jpg'
								},
								{
									imgUrl: '../../static/img/Children2.jpg'
								},
								{
									imgUrl: '../../static/img/Children3.jpg'
								}
							]
						},
						{
							bigUrl: '../../static/img/Furnishing.jpg',
							data: [{
									imgUrl: '../../static/img/Furnishing1.jpg'
								},
								{
									imgUrl: '../../static/img/Furnishing2.jpg'
								},
								{
									imgUrl: '../../static/img/Furnishing3.jpg'
								}
							]
						},
					]
				},
				{
					type: "commodityList",
					data: [{
							id: 1,
							imgUrl: "../../static/img/commodity1.jpg",
							name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
							pprice: "299",
							oprice: "659",
							discount: "5.2"
						},
						{
							id: 2,
							imgUrl: "../../static/img/commodity2.jpg",
							name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
							pprice: "299",
							oprice: "659",
							discount: "5.2"
						},
						{
							id: 3,
							imgUrl: "../../static/img/commodity3.jpg",
							name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
							pprice: "299",
							oprice: "659",
							discount: "5.2"
						},
						{
							id: 4,
							imgUrl: "../../static/img/commodity4.jpg",
							name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
							pprice: "299",
							oprice: "659",
							discount: "5.2"
						}
					]
				},
			]
		}
	})
});

//运动户外第一次加载的数据渲染
router.get('/api/index_list/2/data/1', function(req, res, next) {
	res.json({
		code: 0,
		data: [{
				type: 'bannerList',
				imgUrl: '../../static/img/banner1.jpg'
			},
			{
				type: 'iconList',
				data: [{
						imgUrl: '../../static/img/icons1.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons2.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons3.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons4.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons5.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons6.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons7.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons8.png',
						name: '运动户外'
					}
				]
			}, {
				type: 'hotList',
				data: [{
						id: 1,
						imgUrl: "../../static/img/hot1.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 2,
						imgUrl: "../../static/img/hot2.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 3,
						imgUrl: "../../static/img/hot3.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					}
				]
			},
			{
				type: 'shopList',
				data: [{
						imgUrl: "../../static/img/shop.jpg",
						data: [{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							}
						]
					},
					{
						imgUrl: "../../static/img/shop.jpg",
						data: [{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							}
						]
					}

				]
			},
			{
				type: 'commodityList',
				data: [{
						id: 1,
						imgUrl: "../../static/img/commodity1.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 2,
						imgUrl: "../../static/img/commodity2.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 3,
						imgUrl: "../../static/img/commodity3.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 4,
						imgUrl: "../../static/img/commodity4.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					}
				]
			}
		]
	})


});
//服饰内衣第一次加载的数据渲染
router.get('/api/index_list/3/data/1', function(req, res, next) {
	res.json({
		code: '0',
		data: [{
				type: 'bannerList',
				imgUrl: '../../static/img/banner1.jpg'
			},
			{
				type: 'iconList',
				data: [{
						imgUrl: '../../static/img/icons1.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons2.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons3.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons4.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons5.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons6.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons7.png',
						name: '运动户外'
					},
					{
						imgUrl: '../../static/img/icons8.png',
						name: '运动户外'
					}
				]
			}, {
				type: 'hotList',
				data: [{
						id: 1,
						imgUrl: "../../static/img/hot1.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 2,
						imgUrl: "../../static/img/hot2.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 3,
						imgUrl: "../../static/img/hot3.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					}
				]
			},
			{
				type: 'shopList',
				data: [{
						imgUrl: "../../static/img/shop.jpg",
						data: [{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							}
						]
					},
					{
						imgUrl: "../../static/img/shop.jpg",
						data: [{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 1,
								imgUrl: "../../static/img/shop1.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 2,
								imgUrl: "../../static/img/shop2.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 3,
								imgUrl: "../../static/img/shop3.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							},
							{
								id: 4,
								imgUrl: "../../static/img/shop4.jpg",
								name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
								pprice: "299",
								oprice: "659",
								discount: "5.2"
							}
						]
					}

				]
			},
			{
				type: 'commodityList',
				data: [{
						id: 1,
						imgUrl: "../../static/img/commodity1.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 2,
						imgUrl: "../../static/img/commodity2.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 3,
						imgUrl: "../../static/img/commodity3.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					},
					{
						id: 4,
						imgUrl: "../../static/img/commodity4.jpg",
						name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
						pprice: "299",
						oprice: "659",
						discount: "5.2"
					}
				]
			}
		]
	})


});
//首页第一次触底的数据渲染
router.get('/api/index_list/1/data/2', function(req, res, next) {
	res.json({
		code: 0,
		data: [{
			type: "commodityList",
			data: [{
					id: 1,
					imgUrl: "../../static/img/commodity1.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 2,
					imgUrl: "../../static/img/commodity2.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 3,
					imgUrl: "../../static/img/commodity3.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 4,
					imgUrl: "../../static/img/commodity4.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
			]
		}]
	})
});
//运动户外第一次触底的数据渲染
router.get('/api/index_list/2/data/2', function(req, res, next) {
	res.json({
		code: 0,
		data: [{
			type: "commodityList",
			data: [{
					id: 1,
					imgUrl: "../../static/img/commodity1.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 2,
					imgUrl: "../../static/img/commodity2.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 3,
					imgUrl: "../../static/img/commodity3.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 4,
					imgUrl: "../../static/img/commodity4.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
			]
		}]
	})
});
//服饰内衣第一次触底的数据渲染
router.get('/api/index_list/3/data/2', function(req, res, next) {
	res.json({
		code: 0,
		data: [{
			type: "commodityList",
			data: [{
					id: 1,
					imgUrl: "../../static/img/commodity1.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 2,
					imgUrl: "../../static/img/commodity2.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 3,
					imgUrl: "../../static/img/commodity3.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
				{
					id: 4,
					imgUrl: "../../static/img/commodity4.jpg",
					name: "大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008大姨绒毛大款2020年必须买,不买你就不行了,爆款疯狂GG008",
					pprice: "299",
					oprice: "659",
					discount: "5.2"
				},
			]
		}]
	})
});


module.exports = router;
