import { defineStore } from "pinia";

export const useUserStore = defineStore({
	id: "user",
	state: () => {
		return {
			user: { name: "Andrey" },
		};
	},
	actions: {},
	getters: {
		filtersList: (state) => state.filtersList,
	},
});
