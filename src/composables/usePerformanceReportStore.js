import { defineStore } from "pinia";

export default defineStore({
	id: "performanceReport",
	state: () => {
		return {
			data: {}
		}
	},
	actions: {

		setListLayout(layout) {
			this.data.listLayout = layout;
		},

		setLayoutCurrentConfig (listLayout) {

			if (listLayout) {
				listLayout = recursiveDeepCopy(listLayout);

			} else {

				listLayout = {
					name: "",
					user_code: "",
					content_type: "",
					data: {
						reportOptions: {}
					}
				};

			}

			this.setListLayout(listLayout);

		},
	},
	getters: {
	}
});
