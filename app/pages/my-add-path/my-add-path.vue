<template>
	<view class="my-add-path">
		<view class="path-item">
			<view>收 件 人：</view>
			<input type="text" value="" placeholder="收件人姓名" v-model="pathObj.name" />
		</view>
		<view class="path-item">
			<view>手 机 号：</view>
			<input type="text" value="" placeholder="11位手机号" v-model='pathObj.tel' />
		</view>
		<view class="path-item">
			<view>所在地址</view>
			<view @tap="showCityPicker">{{pathCity}} > </view>
		</view>
		<view class="path-item">
			<view>详细地址：</view>
			<input type="text" value="" placeholder="5到60个字符" v-model="pathObj.details" />
		</view>
		<view class="path-item">
			<view>设为默认地址</view>
			<view>
				<radio-group name='' @change="radioChange">
					<label class="radio">
						<radio value="" color='#ff3333' :checked="pathObj.isDefault==1?true:false"></radio>
					</label>
				</radio-group>
			</view>
			
		</view>
		<mpvueCityPicker ref='mpvueCityPicker' :pickerValueDefault="pickerValueDefault" @onConfirm='onConfirm'>
		</mpvueCityPicker>
	</view>
</template>

<script>
	import $http from '@/common/api/request.js'
	import mpvueCityPicker from '@/components/uni/mpvue-citypicker/mpvueCityPicker.vue'
	import {
		mapActions
	} from 'vuex'
	export default {
		data() {
			return {
				pickerValueDefault: [0, 0, 1],
				pathObj: {
					name:"",//收货人
					tel:"",//收货人电话
					province:"",//省
					city:"",//市
					district:"",//区
					address:"",//收货人详细地址
					isDefault:false//默认地址
				},
				i: -1,
				isStatus: false
			}
		},
		computed:{
			pathCity(){
				if(this.pathObj.province){
					return `${this.pathObj.province}-${this.pathObj.city}-${this.pathObj.district}`
				}else{
					return '请选择'
				}
			}
		},
		onLoad(e) {
			if (e.data) {
				uni.setNavigationBarTitle({
					title: '修改地址'
				})
				let result = JSON.parse(e.data)
				this.pathObj = result.item
				this.i = result.index
				this.isStatus = true
			}
		},
		//点击导航栏保存键
		onNavigationBarButtonTap() {
			if (this.isStatus) {
				//修改
				this.pathObj.isDefault=this.pathObj.isDefault==true?1:0
				$http.request({
					url:"/updateAddress",
					method:"POST",
					header:{
						token:true
					},
					data:{
						pathObj:this.pathObj
					}
				}).then((res)=>{
					this.updatePathFn({
						index:this.i,
						item:this.pathObj
					})
					uni.showToast({
						title:'修改成功',
						icon:"none"
					})
					uni.navigateBack({
						delta:1
					})
				})
			} else {
				this.pathObj.isDefault=this.pathObj.isDefault==true?1:0
				//新增、
				$http.request({
					url:'/addAddress',
					method:'POST',
					header:{
						token:true
					},
					data:{
						pathObj:this.pathObj
					}
				}).then((res)=>{
					this.createPathFn(this.pathObj)
					uni.navigateBack({
						delta: 1
					})
				})
				
			}
		},
		methods: {
			...mapActions(['createPathFn', 'updatePathFn']),
			showCityPicker() {
				this.$refs.mpvueCityPicker.show();
			},
			onConfirm(e) {
				let arr = e.label.split("-");
				this.pathObj.province = arr[0];
				this.pathObj.city = arr[1];
				this.pathObj.district = arr[2];
			},
			radioChange(){
				this.pathObj.isDefault =  this.pathObj.isDefault==1?true:false;
				this.pathObj.isDefault=!this.pathObj.isDefault
			},
		},
		components: {
			mpvueCityPicker,
		}
	}
</script>

<style scoped>
	.my-add-path {
		padding-left: 20rpx;
	}

	.path-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		width: 100%;
		border-bottom: 2rpx solid #CCCCCC;
	}

	.path-item input {
		flex: 1;
		text-align: left;
		padding-left: 10rpx;
	}
</style>
