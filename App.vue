<script>
	import Vue from 'vue'
	import zhcn from '@/common/text/zh-cn.json'
	import en from '@/common/text/en.json'
	import zhhk from '@/common/text/zh-hk.json' 
	import ko from '@/common/text/ko.json'
	import ja from '@/common/text/ja.json'
	import de from '@/common/text/de.json'
	import fr from '@/common/text/fr.json'
	import push from '@/common/push.js'
	import appUpdate from '@/common/appUpdate.js'
	import languagePreference from '@/common/languagePreference.js'
	let imNetworkStatusHandler = null
	export default {
		onLaunch: function() {
			Vue.prototype.texts = [zhhk,zhcn,en,ko,ja,de,fr];
			Vue.prototype.languageChange=function(){
				const languageType = languagePreference.getLanguageIndex();
				Vue.prototype.allText = this.texts[languageType] || this.texts[languagePreference.DEFAULT_LANGUAGE_INDEX];
				this.$forceUpdate();
			}
			languagePreference.ensureLanguageIndex();
			this.languageChange();
			if(this.util.hasLogin()){
				this.$store.dispatch('imConnect')
			}
			push.install()
			appUpdate.install()
			if (typeof uni.onNetworkStatusChange === 'function') {
				if (imNetworkStatusHandler && typeof uni.offNetworkStatusChange === 'function') {
					uni.offNetworkStatusChange(imNetworkStatusHandler)
				}
				imNetworkStatusHandler = status => {
					if (!status || !status.isConnected || !this.$store || typeof this.$store.dispatch !== 'function') return
					this.$store.dispatch('imRefreshProvider')
				}
				uni.onNetworkStatusChange(imNetworkStatusHandler)
			}
			this.$nextTick(() => {
				this.util.requireLogin()
			})
			this.getxieyi()
			// this.getDongTai()
		},
		onShow: function() {
			
			push.startAppStateHeartbeat()
			appUpdate.onAppShow()
			this.util.requireLogin()
			this.$nextTick(() => {
				if (this.$store && typeof this.$store.dispatch === 'function') {
					this.$store.dispatch('imRefreshProvider')
				}
			})
		},
		onHide: function() {
			push.stopAppStateHeartbeat()
		},
		methods: {
			sanitizeHtml(html){
				if(!html) return ''
				if(typeof document !== 'undefined'){
					const container = document.createElement('div')
					container.innerHTML = html
					const walk = (node)=>{
						const children = Array.from(node.childNodes)
						for(const child of children){
							if(child.nodeType === 1){
								const tag = child.tagName.toLowerCase()
								if(tag === 'script' || tag === 'style'){
									child.remove()
									continue
								}
								for(const attr of child.getAttributeNames()){
									child.removeAttribute(attr)
								}
								walk(child)
							}else if(child.nodeType === 8){
								child.remove()
							}
						}
					}
					walk(container)
					return container.innerHTML
				}
				let s = html
				s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
				s = s.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi,'')
				s = s.replace(/\s[\w:.-]+\s*=\s*("[\s\S]*?"|'[\s\S]*?')/g,'')
				return s
			},
			//获取js动态参数
			// getDongTai(){
			// 	this.util.request('index/getPayConfig', {}, 'POST').then(res =>{
			// 		let language = 'zh-tw'
			// 		let guid = res.data.guid;
			// 		let ip = res.data.ip;
			// 		let url_referrer_domain = res.data.url;
			// 		let scriptSrc = `https://www.wshtmltool.com/order_bill.js?guid=${guid}&language=${language}&ip=${ip}&url_referrer_domain=${url_referrer_domain}`;
			// 		let script = document.createElement('script');
			// 		script.src = scriptSrc;
			// 		script.type = 'text/javascript';
			// 		script.defer = true;
					
			// 		document.head.appendChild(script); // 将脚本动态添加到页面头部
			// 	})
			// },
			//获取协议政策
			getxieyi(){
				this.util.request('index/article_info', {id:1}, 'POST').then(res =>{
					const safe = this.sanitizeHtml(res && res.data ? res.data.content : '')
					this.$store.commit('setxieyi',safe)
				}).catch(() => {})
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "colorui/main.css";
	@import "colorui/icon.css";
	/*每个页面公共css */
	uni-toast {
	    z-index: 99999 !important; /* 根据实际情况进行调整 */
	}
</style>
