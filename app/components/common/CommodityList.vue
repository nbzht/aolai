<template>
	<view class="commodity-list">
		<!-- 商品列表组件 -->
		<Commodity :dataList='dataList'></Commodity>
	</view>
</template>

<script>
	import Commodity from '@/components/common/Commodity.vue'
	export default {
		props:{
			dataList:Array
		},
		data() {
			return {
			}
		},
		components: {
			Commodity,
		}
	}
</script>

<style>
</style>
