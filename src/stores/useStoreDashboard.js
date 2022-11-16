import { defineStore } from "pinia";

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			componentsList: [
				{id: 'Nav', name: 'Nav(Stats)', min_colls: 12, min_rows: 1},
				{id: 'Barchart', name: 'Barchart(History)', min_colls: 12, min_rows: 2},
				{id: 'Balance', name: 'Balance', min_colls: 6, min_rows: 3},
				{id: 'Pl', name: 'P&L', min_colls: 12, min_rows: 1},
			],
			widgets: [
				{name:"Nav","sdfd":"Nav(Stats)","colls":12,"rows":2,
					scope: 'test', tab: null, minColls: 2, minRows: 2, props: {portfolio: 2, date: '2022-10-12'}
				},
				{"name":"Barchart","dfg":"Balance","colls":12,"rows":4, scope: 'test', tab: 'i_lose', props: {portfolio: 2, date_to: '2022-10-12'}, minColls: 2, minRows: 2},
				{"name":"Balance","df":"Balance","colls":6,"rows":3, scope: 'test', tab: 'i_lose', minColls: 2, minRows: 2},
				{"name":"Pl","df":"P&L","colls":6,"rows":3, scope: 'test', tab: 'i_lose', minColls: 2, minRows: 2}
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
