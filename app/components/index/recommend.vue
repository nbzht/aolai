<template>
	<view class="recommend bg-color">
		<view class="recommend-item" v-for="(item,index) in dataList" :key="index">
			<image class="item-big" :src="item.bigUrl"></image>
			<view class="item-small">
				<block v-for="(k,i) in item.data" :key="i">
					<image class="item-img" :src="k.imgUrl"></image>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props:{
			dataList:Array
		}
	}
	
</script>

<style scoped>
	.recommend {
		padding: 20rpx;
	}

	.recommend-item {
		display: flex;
		flex-direction: column;
		border-radius: 20rpx;
		border: 2rpx solid #cccccc;
		overflow: hidden;
		margin: 20rpx 0;
	}

	.item-big {
		width: 100%;
		height: 300rpx;
	}

	.item-small {
		background-color: #F8F8F8;
		width: 100%;
		height: 240rpx;
		display: flex;
		flex-direction: row;
	}

	.item-img {
		width: 33.3333;
		height: 240rpx;
	}
</style>
