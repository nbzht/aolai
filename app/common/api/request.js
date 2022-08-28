import store from '@/store/index.js'
export default {
	common: {
		baseUrl: 'http://192.168.0.31:3000/api',
		// baseUrl:'http://192.168.1.105:3000/api',
		data: {},
		header: {
			"Content-Type": "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		method: 'GET',
		dataType: "json"
	},
	request(options = {}) {
		// uni.showLoading({
		// 	title:'加载中'
		// })
		options.url = this.common.baseUrl + options.url
		options.data = options.data || this.common.data
		options.header = options.header || this.common.header
		options.method = options.method || this.common.method
		options.dataType = options.dataType || this.common.dataType

		//判断是否传入了header头的token进行用户是否登录的验证
		if (options.header.token) {
			options.header.token = store.state.user.token;
			if(!options.header.token){
				uni.showToast({
					title: "请先登录",
					icon: "none"
				})
				return uni.navigateTo({
					url: "/pages/login/login"
				})
			}
			
		}

		return new Promise((res, rej) => {
			uni.request({
				...options,
				success: (result) => {
					if (result.statusCode != 200) {
						return rej()
					}
					if (result.data.code != 0) {
						uni.showToast({
							title: '请求数据失败',
							icon: 'none'
						})
					}
					// setTimeout(function(){
					// 	uni.hideLoading()
					// },2000)
					let data = result.data.data
					res(data)
				},
				fail: (err) => {
					uni.showToast({
						title: '请求接口失败'
					})
					rej(err)
				}
			})
		})
	}
}
