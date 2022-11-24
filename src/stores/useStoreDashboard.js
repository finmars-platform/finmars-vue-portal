import { defineStore } from "pinia";

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			widgets: [],
			tabs: [],
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
