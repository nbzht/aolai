<template>
	<view class="icon">
		<view class="icon-item" v-for="(item,index) in dataList" :key="index">
			<image class="icon-img" :src='item.imgUrl'></image>
			<text class="icon-name f-color">{{item.name}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		props:
			{
				dataList:Array
			}
		
	}
</script>

<style scoped lang="scss">
	.icon{
		display: flex;
		flex-wrap: wrap;
		.icon-item{
			width: 25%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding-top: 20rpx;
			.icon-img{
				width: 110rpx;
				height: 110rpx;
			}
			.icon-name{
				font-size: 28rpx;
			}
		}
	}
</style>