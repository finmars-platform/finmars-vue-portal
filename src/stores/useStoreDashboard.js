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
				{
					id:"test_Nav",
					name:"Nav",
					scope: 'test',
					tab: null,
					colls: 12,
					rows:2,
					minColls: 2,
					minRows: 2,
				},
				{
					id:"test_Barchart",
					name:"Barchart",
					scope: 'test',
					tab: 'i_lose',
					colls: 12,
					rows: 4,
					minColls: 2,
					minRows: 2,
				},
				{
					id:"test_Balance",
					name:"Balance",
					scope: 'test',
					tab: 'i_lose',
					colls: 6,
					rows: 4,
					minColls: 2,
					minRows: 2,
				},
				{
					id:"test_Pl",
					name:"Pl",
					scope: 'test',
					tab: 'i_lose',
					colls: 6,
					rows: 4,
					minColls: 2,
					minRows: 2,
				}
			],
			scopes: {
				global: {
					date: '2022-09-15',
				},
				test: {
					portfolio: 2,
					date: '2022-09-15',
					dataset: {

					}
				}
			},

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
