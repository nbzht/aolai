<template>
	<view class="my-config">
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="config-item" @tap="goPathList">
			<view>地址管理</view>
			<view class="config-mark"> > </view>
		</view>
		<view class="my-exit" @tap="exitUser">退出</view>
	</view>
</template>

<script>
	import {mapMutations} from 'vuex'
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			...mapMutations(['loginOut']),
			goPathList(){
				uni.navigateTo({
					url:'/pages/my-path-list/my-path-list'
				})
			},
			exitUser(){
				this.loginOut()
				uni.switchTab({
					url:'/pages/index/index'
				})
			}
		}
	}
</script>

<style scoped>
.config-item{
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0 20rpx 20rpx;
	border-bottom: 2rpx solid #ccc;
}
.config-mark{
	padding-right: 10rpx;
}
.my-exit{
	margin-top: 20rpx;
	background-color: #49BDFB;
	width: 100%;
	line-height: 80rpx;
	color: #fff;
	text-align: center;
}
</style>
