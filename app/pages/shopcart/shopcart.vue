<template>
	<view class="shopcart">
		<template v-if="list.length>0">
			<!-- 自定义导航栏 -->
			<uniNavBar title="购物车" :rightText="isNavBar?'完成':'编辑'" fixed="true" statusBar='true'
				@clickRight="isNavBar = !isNavBar"></uniNavBar>
			<!-- 商品内容 -->
			<view class="shop-list">
				<view class="shop-item" v-for="(item,index) in list" :key="index">
					<label class="radio" @tap="selectedItem(index)">
						<radio value="" color="#FF3333" :checked="item.checked"></radio>
					</label>
					<view class="shop-img">
						<image class="shop-img" :src="item.imgUrl"></image>
					</view>
					<view class="shop-text">
						<view class="shop-name">{{item.name}}</view>
						<view class="shop-color f-color">{{item.color}}</view>
						<view class="shop-price">
							<view>￥{{item.pprice}}</view>

							<template v-if="!isNavBar">
								<view>*{{item.num}}</view>
							</template>
							<template v-else>
								<uniNumberBox :value="item.num"  @change="changeNumber($event,index,item)"></uniNumberBox>
							</template>


						</view>
					</view>
				</view>
			</view>
			<!-- 底部 -->
			<view class="shop-foot">
				<label class="radio foot-radio" @tap="checkedAllFn">
					<radio value="" color="#ff3333" :checked="checkedAll"></radio>
					<text>全选</text>
				</label>
				<template v-if="!isNavBar">
					<view class="foot-total">
						<view class="foot-count">合计：<text class="f-active-color">￥{{totalCount.pprice}}</text></view>
						<view class="foot-num" @tap="goConfirmOrder">结算({{totalCount.num}})</view>
					</view>
				</template>
				<template v-else>
					<view class='foot-total'>
						<view class='foot-num' style="background-color: #000000;">移入收藏夹</view>
						<view class='foot-num' @tap='delGoodsFn'>删除</view>
					</view>
				</template>
			</view>
		</template>
		<template v-else>
			<uniNavBar title="购物车" statusBar="true" fixed="true"></uniNavBar>
			<view class="shop-else-list">
				<view>囧～购物车还是空的～</view>
			</view>
		</template>
	</view>
</template>

<script>
	import $http from '@/common/api/request.js'
	import uniNavBar from '@/components/uni/uni-nav-bar/uni-nav-bar.vue'
	import uniNumberBox from '../../components/uni/uni-number-box/uni-number-box.vue'
	import {
		mapState,
		mapActions,
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				isNavBar: false,
			}
		},
		computed: {
			...mapState({
				list: state => state.cart.list,
				loginStatus:state=>state.user.loginStatus,
				selectedList:state=>state.cart.selectedList
			}),
			...mapGetters(['checkedAll', 'totalCount']),
		},
		onShow() {
			if(!this.loginStatus){
				uni.reLaunch({
					url:'/pages/login/login'
				})
				uni.showToast({
					title:'请先登录',
					icon:'none'
				})	
			}
			this.getData()
		},
		methods: {
			...mapActions(['checkedAllFn','delGoodsFn']),
			...mapMutations(['selectedItem','initGetData','initOrder']),
			getData(){
				$http.request({
					url:'/selectCart',
					method:'POST',
					header:{
						token:true
					}
				}).then((res)=>{
					this.initGetData(res)
				})
			},
			changeNumber(value,index,item){
				if(item.num==value) return
				$http.request({
					url:'/updateNumCart',
					method:'POST',
					header:{
						token:true
					},
					data:{
						goodsId:item.goods_id,
						num:value
					}
				}).then((res)=>{
					this.list[index].num=value
				})
			},
			//进入确认订单
			goConfirmOrder(){
				if(this.selectedList.length==0){
					return uni.showToast({
						title:'请至少选择一件商品',
						icon:'none'
					})
				}
				let newList=[]
				this.list.forEach(item=>{
					this.selectedList.forEach(v=>{
						if(item.id==v){
							newList.push(item)
						}
					})
				})
				$http.request({
					url:'/addOrder',
					method:'POST',
					header:{
						token:true
					},
					data:{
						newList
					}
				}).then((res)=>{
					if(res.success){
						//存储订单号
						this.initOrder(res.data[0].order_id)
						//跳转页面
						uni.navigateTo({
							url:'/pages/confirm-order/confirm-order?detail='+JSON.stringify(this.selectedList)
						})
					}
				})
				
			}
		},
		components: {
			uniNavBar,
			uniNumberBox,
		}
	}
</script>

<style lang="scss" scoped>
	.shop-list {
		padding: bottom 100rpx;
		;
	}

	.shop-else-list {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		background-color: #f7f7f7;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.shop-item {
		display: flex;
		padding: 20rpx;
		align-items: center;
		background-color: #f7f7f7;
		margin-bottom: 10rpx;
	}

	.shop-img {
		width: 200rpx;
		height: 200rpx;
	}

	.shop-text {
		flex: 1;
		padding-left: 20rpx;
	}

	.shop-name {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 50rpx;
		height: 100rpx;
	}

	.shop-color {
		font-size: 24rpx;
	}

	.shop-price {
		display: flex;
		justify-content: space-between;
	}

	.shop-foot {
		border-top: 2rpx solid #f7f7f7;
		background-color: #ffffff;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.foot-radio {
		padding-left: 20rpx;
	}

	.foot-total {
		display: flex;
		align-items: center;
	}

	.foot-count {
		padding: 0 20rpx;
		font-size: 32rpx;
	}

	.foot-num {
		background-color: #49bdfb;
		color: #ffffff;
		padding: 0 60rpx;
		line-height: 100rpx;
	}
</style>
