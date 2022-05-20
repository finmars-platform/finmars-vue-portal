import { defineStore } from "pinia";

export const useUserStore = defineStore({
	id: "user",
	state: () => {
		return {
			user: { name: "Andrey" },
		};
	},
	actions: {
		async init() {
			await this.getUser()
		},
		async getUser() {
			let res = await useApi('me.get')
			this.user = res
		}
	},
	getters: {
		filtersList: (state) => state.filtersList,
	},
});
