<template>
	<view class="shop">
		<view class="shop-item" v-for="(item,index) in dataList" :key="index">
			<view class="shop-big">
				<image class="shop-img" :src="item.imgUrl"></image>
			</view>
			<scroll-view scroll-x="true" class="scroll-content">
				<view class="scroll-item">
					<Commodity :dataList="item.data" wrap="no-wrap" itemW="200rpx" bigH="200rpx" nameSize="20rpx" pSize="26rpx" oSize="20rpx"></Commodity>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import Commodity from '@/components/common/Commodity.vue'
	export default{
		props:{
			dataList:Array
		},
		components:{
			Commodity,
		}
	}
</script>

<style scoped>
	.shop-big{
		width: 100%;
		height: 375rpx;
	}
	.shop-img{
		width: 100%;
		height: 375rpx;
	}
	.scroll-content{
		width: 100%;
		white-space: nowrap;
	}
	.scroll-item{
		display: inline-block;
	}
</style>