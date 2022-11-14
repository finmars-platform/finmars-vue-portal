import { defineStore } from "pinia";

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			components: [
				{name:"Nav","sdfd":"Nav(Stats)","colls":12,"rows":2,
					scope: 'test', tab: 'test 1'
				},
				{"name":"Barchart","dfg":"Balance","colls":12,"rows":4, scope: 'test'},
				{"name":"Balance","df":"Balance","colls":6,"rows":3, scope: 'test'},
				{"name":"Pl","df":"P&L","colls":6,"rows":3, scope: 'test'}
			],
			scopeList: {
				test: {
					portfolio: 2,
					date: '2022-09-15'
				}
			}
		};
	},
	actions: {
		async init() {
			this.getUser()
			await this.getMasterUsers()
		}
	},
	getters: {

	},
});
