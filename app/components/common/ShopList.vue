<template>
	<view class="shop-list">
		<lines></lines>
		<view class="shop-title f-color">
			<view class="shop-item" v-for="(item,index) in shopList.data" :key="index" @tap="changeTab(index)">
				<view :class="shopList.currentIndex==index?'f-active-color':''">{{item.name}}</view>
				<view class="shop-icon">
					<view class="iconfont icon-shangjiantou up" :class="item.status===1?'f-active-color':''"></view>
					<view class="iconfont icon-xiajiantou down" :class="item.status===2?'f-active-color':''"></view>
				</view>
			</view>
		</view>
		<lines></lines>
		<CommodityList :dataList="dataList"></CommodityList>
	</view>
</template>

<script>
	import $http from '@/common/api/request.js'
	import Lines from './Lines.vue'
	import CommodityList from './CommodityList.vue'
	export default {
		props: {
			keyword: String
		},
		data() {
			return {
				shopList: {
					currentIndex: 0,
					data: [{
							name: "价格",
							status: 1,
							key:'pprice'
						},
						{
							name: "折扣",
							status: 0,
							key:'discount'
						},
						{
							name: "品牌",
							status: 0
						}
					]
				},
				dataList: []
			}
		},
		components: {
			Lines,
			CommodityList,
		},
		computed: {
			orderBy() {
				//拿到当前对象
				let obj = this.shopList.data[this.shopList.currentIndex];
				let val = obj.status === 1 ? "asc" : "desc";
				return {
					[obj.key]: val
				}
			},
			
		},
		mounted() {
			this.getData()
		},
		methods: {
			getData() {
				console.log(this.orderBy,this.shopList.data[this.shopList.currentIndex])
				$http.request({
					url: '/goods/search',
					data: {
						name: this.keyword,
						...this.orderBy
					}
				}).then((res) => {
					this.dataList = res
				})
			},
			changeTab(index) {
				
				//索引值
				let idx = this.shopList.currentIndex
				//具体哪一个对象
				let item = this.shopList.data[idx]
				if (idx == index) {
					item.status = item.status === 1 ? 2 : 1
					this.getData();
					return item.status
				}
				//新的对象
				let newItem = this.shopList.data[index]
				item.status = 0
				this.shopList.currentIndex = index
				newItem.status = 1
				this.getData();
			}
		},
	}
</script>

<style scoped>
	.shop-title {
		display: flex;
	}

	.shop-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80rpx;
	}

	.shop-icon {
		margin-left: 5rpx;
	}

	.iconfont {
		width: 16rpx;
		height: 8rpx;
		position: relative;
	}

	.up {
		top: -15rpx
	}

	.down {
		top: -5rpx
	}
</style>
