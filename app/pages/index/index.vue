<template>
	<view class="index">
		<scroll-view scroll-x="true" class="scroll-content" :scroll-into-view="scrollIntoIndex">
			<view class="scroll-item" v-for="(item,index) in topBar" :id="'top'+index" :key="index"
				@tap="changeTab(index)">
				<text :class="topBarIndex===index?'f-active-color':'f-color'"
					class="scroll-item-name">{{item.name}}</text>
			</view>
		</scroll-view>
		<swiper @change="onChangeTab" :current="topBarIndex" :style="'height:'+clientHeight+'px;'">
			<swiper-item v-for="(item,index) in newTopBar" :key="index">
				<scroll-view scroll-y="true" :style="'height:'+clientHeight+'px;'" @scrolltolower="loadMore(index)">
					<template v-if="item.data.length>0">
						<block v-for="(k,i) in item.data" :key="i">

							<!-- 推荐 -->
							<index-swi v-if="k.type==='swiperList'" :dataList='k.data'></index-swi>
							<template v-if="k.type==='recommendList'">
								<recommend :dataList='k.data'></recommend>
								<Card cardTitle='猜你喜欢'></Card>
							</template>

							<!-- 运动户外... -->
							<banner v-if="k.type==='bannerList'" :dataList='k.imgUrl'></banner>
							<template v-if="k.type==='iconList'">
								<Icon :dataList='k.data'></Icon>
								<Card cardTitle='热销爆品'></Card>
							</template>
							<template v-if="k.type==='hotList'">
								<Hot :dataList="k.data"></Hot>
								<Card cardTitle='推荐店铺'></Card>
							</template>
							<template v-if="k.type==='shopList'">
							<Shop :dataList='k.data'></Shop>
							<Card cardTitle='为您推荐'></Card>
							</template>
							<Commodity-list v-if="k.type==='commodityList'" :dataList='k.data'></Commodity-list>
						</block>
						<view class="load-text f-color">
							{{item.loadText}}
						</view>
					</template>
					<view v-else>
						暂无数据...
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 推荐模板 -->
		<!-- <index-swi></index-swi>
		<recommand></recommand>
		<card cardTitle="猜你喜欢"></card>
		<CommodityList></CommodityList> -->

		<!-- 其他模板 -->
		<!-- <banner></banner>
		<Icon></Icon>
		<Card cardTitle='热销爆品'></Card>
		<Hot></Hot>
		<Card cardTitle='推荐店铺'></Card>
		<Shop></Shop>
		<Card cardTitle='为您推荐'></Card>
		<CommodityList></CommodityList> -->
	</view>
</template>

<script> 
	import $http from '@/common/api/request.js'
	import indexswi from '@/components/index/index-swi.vue'
	import recommend from '@/components/index/recommend.vue'
	import Card from '@/components/common/Card.vue'
	import CommodityList from '@/components/common/CommodityList.vue'
	import Banner from '@/components/index/Banner.vue'
	import Icon from '@/components/index/Icon.vue'
	import Hot from '@/components/index/Hot.vue'
	import Shop from '@/components/index/Shop.vue'
	export default {
		data() {
			return {
				//选中的索引
				topBarIndex: 0,
				//顶栏跟随的索引id值
				scrollIntoIndex: 'top0',
				//内容块的高度值
				clientHeight: 0,
				//顶栏数据
				topBar: Array,
				newTopBar: Array,
			}
		},
		
		onLoad() {
			this.__init()
		},
		onReady() {
			uni.getSystemInfo({
				success: (res) => {
					this.clientHeight = res.windowHeight - uni.upx2px(80)
				}
			})
		},
		//标题栏按钮点击
		onNavigationBarButtonTap(e) {
			if(e.float=='left'){
				uni.navigateTo({
					url:'../search/search'
				})
			}
		},
		methods: {
			// 请求数据
			__init() {
				$http.request({
					url:'/index_list/data'
				}).then((res)=>{
					this.topBar=res.topBar
					this.newTopBar=this.initData(res)
				})
			},
			// 添加数据
			initData(res) {
				let arr = []
				for (let i = 0; i < this.topBar.length; i++) {
					let obj = {
						data: [],
						load:'first',
						loadText:'上拉加载更多...'
					}
					//获取首次数据
					if (i == 0) {
						obj.data = res.data
						obj.load = 'last'
					}
					arr.push(obj)
				}
				return arr

			},
			// 点击顶栏
			changeTab(index) {
				if (this.topBarIndex === index) {
					return
				}
				this.topBarIndex = index
				this.scrollIntoIndex = 'top' + index
				if(this.newTopBar[this.topBarIndex].load==='first'){
					this.addData()
				}
			},
			// 提取index_list(2,3,4...)的数据
			addData(callback){
				//拿到索引
				let index=this.topBarIndex
				//拿到id
				let id = this.topBar[index].id
				//请求不同 的数据
				let page=Math.ceil(this.newTopBar[index].data.length/5)+1
				if(page>2){
					page=2
				}
				//请求数据
				$http.request({
					url:'/index_list/'+id+'/data/'+page,
				}).then((res)=>{
					this.newTopBar[index].data = [...this.newTopBar[index].data,...res]
				})
				// 当请求结束后，重新赋值
				this.newTopBar[index].load='last'
				if(typeof callback==='function'){
					callback();
				}
			},
			// 上拉加载更多
			loadMore(index){
				this.newTopBar[index].loadText='加载中...'
				this.addData(()=>{
					this.newTopBar[index].loadText='上拉加载更多...'
				})
			},
			// 对应滑动
			onChangeTab(e) {
				this.changeTab(e.detail.current)
			},
			// //获取可视区域高度（兼容）((这个方法暂时用不到了，过时了，uniapp已经修正))
			// getClientHeight(){
			// 	const res=uni.getSystemInfoSync()
			// 	const system=res.osName
			// 	if(system==='ios'){
			// 		return 44+res.statusBarHeight
			// 	}
			// 	else if(system==='android'){
			// 		return 48+res.statusBarHeight
			// 	}
			// 	else{
			// 		return 0
			// 	}
			// }
		},
		components: {
			"index-swi": indexswi,
			recommend,
			Card,
			CommodityList,
			Banner,
			Icon,
			Hot,
			Shop,
		}
	}
</script>

<style scoped>
	.scroll-content {
		width: 100%;
		height: 80rpx;
		white-space: nowrap;
	}

	.scroll-item {
		display: inline-block;
		padding: 10rpx 30rpx;
		font-size: 32rpx;
	}

	.f-active-color {
		padding: 10rpx;
		border-bottom: 3rpx solid #49BDFB;
	}
	.load-text{
		border-top: 1rpx solid #636263;
		line-height: 60rpx;
		text-align: center;
	}
</style>
