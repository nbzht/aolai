<template>
	<view class="login">
		<swiper vertical="true" style="height: 100%;">
			<swiper-item>
				<view class="login-tel">
					<view class="tel-main">
						<view class="close" @tap="goBack">
							<image class="close-img" src="../../static/img/close.png"></image>
						</view>
						<view class="logo">
							<image class="logo-img" src="../../static/img/logo.jpg"></image>
						</view>
						<view class="tel" @tap="goLoginTel">手机号注册</view>
						<LoginOther></LoginOther>
						<view class="login-go">
							<view>已有帐号，去登陆</view>
							<image src="../../static/img/down.png"></image>
						</view>
					</view>
				</view>
			</swiper-item>
			<swiper-item>
				<view class="login-tel">
					<view class="tel-main">
						<view class='close close-center'>
							<view @tap='goBack'>
								<image class='close-img' src="../../static/img/close.png" mode=""></image>
							</view>
							<view class='login-go'>
								<image class='close-img' src="../../static/img/up.png" mode=""></image>
								<view>没有账号，去注册</view>
							</view>
							<view></view>
						</view>
						<view class="login-from">
							<view class='login-user'>
								<text class='user-text'>账号：</text>
								<input type="text" v-model="userName" value="" placeholder="请输入手机号/昵称" />
							</view>
							<view class='login-user'>
								<text class='user-text'>密码：</text>
								<input type="password" v-model="userPwd" value="" placeholder="6-16位字符" />
							</view>
						</view>
						<view class='login-quick'>
							<view>忘记密码?</view>
							<view>免密登录</view>
						</view>
						<view class='tel' @tap="submit">登录</view>
						<view class='reminder'>温馨提示：您可以选择免密登录，更加方便</view>
						<LoginOther></LoginOther>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import $http from '@/common/api/request.js'
	import LoginOther from '@/components/login/login-other.vue'
	import {mapMutations} from 'vuex'
	export default {
		data() {
			return {
				//用户输入的内容
				userName: "",
				userPwd: "",
				//验证的规格
				rules:{
					userName:{
						rule:/\S/,
						msg:"账号不能为空"
					},
					userPwd:{
						rule:/^[0-9a-zA-z]{6,16}$/,
						msg:'密码应该为6-16位字符'
					},
				}
			}
		},
		methods: {
			...mapMutations(['login']),
			//关闭当前页面，返回上一页
			goBack() {
				uni.switchTab({
					url:'/pages/index/index'
				})
			},
			//点击登录
			submit(){
				if(  !this.validate('userName')  ) return;
				if(  !this.validate("userPwd") )   return;
				
				uni.showLoading({
					title:"登录中..."
				})
				$http.request({
					url:'/login',
					method:'POST',
					data:{
						userName:this.userName,
						userPwd:this.userPwd
					}
				}).then((res)=>{
					uni.showToast({
						title:res.msg,
						icon:'none'
					})
					uni.hideLoading()
					if(res.success){
						this.login(res.data)
						uni.switchTab({
							url:'/pages/index/index'
						})
					}
					
				})
			},
			//判断验证是否符合要求
			validate(key){
				if(!this.rules[key].rule.test(this[key])){
					uni.showToast({
						title:this.rules[key].msg,
						icon:"none"
					})
					return false;
				}
				return true;
			},
			goLoginTel(){
				uni.navigateTo({
					url:'/pages/login-tel/login-tel'
				})
			}
		},
		components: {
			LoginOther,
		}
	}
</script>

<style scoped>
	.login {
		width: 100%;
		height: 100vh;
	}

	.tel-main {
		padding: 0 20rpx;
	}

	.close {
		padding: 120rpx 0;
	}

	.close-img {
		width: 60rpx;
		height: 60rpx;
	}

	.logo {
		padding-bottom: 100rpx;
		display: flex;
		justify-content: center;
	}

	.tel {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		color: #FFFFFF;
		background-color: #49BDFB;
		border-radius: 40rpx;
	}

	.login-go {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.login-go image {
		width: 60rpx;
		height: 60rpx;
	}
	/*第二*/
	.close-center{
		display: flex;
	}
	.close-center view{
		flex:1;
	}
	.login-from{
		padding-top:150rpx;
	}
	.login-user{
		font-size:36rpx;
		padding:15rpx 0;
		display: flex;
		align-items: center;
		border-bottom:2rpx solid #f7f7f7;
	}
	.user-text{
		padding-right:20rpx;
	}
	.login-quick{
		display: flex;
		justify-content: space-between;
		padding: 20rpx 20rpx;
	}
	.reminder{
		color:#CCCCCC;
		padding:20rpx 0;
		text-align: center;
	}
</style>
