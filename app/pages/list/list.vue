<template>
	<view>
		<lines></lines>
		<view class="list">
			<!-- 左侧滑动 -->
			<scroll-view scroll-y="true" class="list-left" :style="'height:'+clientHeight+'px;'">
				<view v-for="(item,index) in leftData" :key="index" @tap="changeLeftTab(index,item.id)">
					<view class="left-name" :class="activeIndex===index?'left-name-active':'left-item'">
						{{item.name}}
					</view>
				</view>

			</scroll-view>
			<!-- 右侧滑动 -->
			<scroll-view scroll-y="true" class="list-right" :style="'height:'+clientHeight+'px;'">
				<view class="right-list" v-for="(item,index) in rightData" :key="index">
					<block v-for="(k,i) in item" :key="i">
						<view class="list-title">{{k.name}}</view>
						<view class="rightp-content">
							<view class="right-item" v-for="(j,idx) in k.list" :key="idx">
								<image class="right-img" :src="j.imgUrl" mode=""></image>
								<view class="right-name">{{j.name}}</view>
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import Lines from '@/components/common/Lines.vue'
	import $http from '@/common/api/request.js'
	export default {
		data() {
			return {
				clientHeight: 0,
				activeIndex: 0,
				//左侧数据
				leftData: [],
				rightData: [],

			}
		},
		//获取可视高度
		onReady() {
			uni.getSystemInfo({
				success: (res) => {
					this.clientHeight = res.windowHeight
				}
			})
		},
		//input输入框点击事件
		onNavigationBarSearchInputClicked() {
			uni.navigateTo({
				url: '../search/search'
			})
		},
		onLoad() {
			this.getData()
		},
		methods: {
			getData(id) {
				if (id === (this.activeIndex + 1)) {
					return
				}
				$http.request({
					url: '/goods/list'
				}).then((res) => {
					let leftData = []
					let rightData = []
					res.forEach(v => {
						leftData.push({
							id: v.id,
							name: v.name
						})
						//如果点击的id值相同
						if (v.id === (this.activeIndex + 1)) {
							// console.log(this.activeIndex)
							rightData.push(v.data)
						}
					})
					this.leftData = leftData
					this.rightData = rightData
				})
			},
			changeLeftTab(index, id) {
				this.getData(id)
				this.activeIndex = index
			}
		},
		components: {
			Lines
		}
	}
</script>

<style scoped>
	.list {
		display: flex;
	}

	.list-left {
		width: 200rpx;
	}

	.left-item {
		border-bottom: 2rpx solid #FFFFFF;
		font-size: 28rpx;
		font-weight: bold;
		background-color: #eeeeee;
		text-align: center;
		padding: 25rpx 6rpx;
	}

	/* .left-name {
		padding: 25rpx 6rpx;
		text-align: center;
	} */

	.left-name-active {
		padding: 25rpx 6rpx;
		border-left: 8rpx solid #49bdfb;
		background-color: #FFFFFF;
		text-align: center;
	}

	.list-right {
		flex: 1;
		padding-left: 30rpx;
	}

	.list-title {
		font-weight: bold;
		padding: 30rpx 0;
	}

	.rightp-content {
		display: flex;
		flex-wrap: wrap;
	}

	.right-item {
		width: 150rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10rpx;
	}

	.right-name {
		padding: 16rpx 0;
	}

	.right-img {
		width: 150rpx;
		height: 150rpx;
	}
</style>
