<template>
	<view class="my-path-list">
		<view class="path-list">
			<view class="path-item" v-for="(item,index) in list" :key="index" @tap="toAddPath(index)">
				<view  @tap="goConfirmOrder(item)">
					<view class="item-main">
						<view class="item-name">{{item.name}}</view>
						<view>{{item.tel}}</view>
					</view>
					<view class="item-main">
						<view class="active" v-if="item.isDefault==1">默认</view>
						<view>{{item.province}} {{item.city}} {{item.district}} {{item.address}}</view>
					</view>
				</view>
			</view>
		</view>
		<view class="add-path">
			<view class="add-path-btn" @tap="goAddPath">新增地址</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,mapMutations
	} from 'vuex'
	import $http from '@/common/api/request.js'
	export default {
		data() {
			return {
				isSelectedPath:false
			}
		},
		computed: {
			...mapState({
				list: state => state.path.list
			})
		},
		onLoad(e){
			if(e.type==='selectedPath'){
				this.isSelectedPath = true;
			}
			this.__initAddress();
		},
		methods: {
			...mapMutations(['__initAddressList']),
			//初始化 （请求收获接口地址）
			__initAddress(){
				$http.request({
					url:'/selectAddress',
					method:'POST',
					header:{
						token:true
					}
				}).then((res)=>{
					this.__initAddressList(res)
				})
			},
			//修改
			toAddPath(index) {
				if(this.isSelectedPath){
					return
				}
				let pathObj = JSON.stringify({
					index: index,
					item: this.list[index]
				})
				uni.navigateTo({
					url: "../my-add-path/my-add-path?data=" + pathObj
				})
			},
			//新增
			goAddPath() {
				uni.navigateTo({
					url: '/pages/my-add-path/my-add-path'
				})
			},
			//返回确认订单页面
			goConfirmOrder(item){
				//如果是从确认订单过来的执行以下代码
				if(this.isSelectedPath){
					//自定义事件：页面通讯
					uni.$emit('selectPathItem',item)
					//返回上一页
					uni.navigateBack({
						delta:1
					})
				}
			}
		}
	}
</script>

<style scoped>
	.path-list {
		padding-left: 20rpx;
	}

	.path-item {
		padding: 10rpx;
		border-bottom: 2rpx solid #ccc;
	}

	.item-main {
		padding: 10rpx 0;
		display: flex;
		align-items: center;
	}

	.item-name {
		padding-right: 10rpx;
	}

	.active {
		margin-right: 10rpx;
		padding: 5rpx;
		background-color: #49bdfb;
		color: #fff;
		border-radius: 26rpx;
		font-size: 24rpx;
		text-align: center;
	}

	.add-path {
		padding: 20rpx;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.add-path-btn {
		border: 2rpx solid #49bdfb;
		color: #49bdfb;
		border-radius: 30rpx;
		padding: 8rpx 80rpx;
	}
</style>
