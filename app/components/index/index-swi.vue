<template>
	<swiper indicator-dots="true" autoplay="true" interval="2000" duration="1000">
		<swiper-item v-for="(item,index) in dataList" :key="index">
			<view class="swiper-item">
				<image class="swiper-img" :src="item.imgUrl"></image>
			</view>
		</swiper-item>
	</swiper>

</template>

<script>
	export default {
		props:{
			dataList:Array
		}
	}
</script>

<style scoped lang="scss">
	swiper {
		width: 100%;
		height: 400rpx;
		.swiper-img {
			width: 100%;
			height: 400rpx;
		}
	}

	
</style>
