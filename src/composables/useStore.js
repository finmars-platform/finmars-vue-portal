import { defineStore } from "pinia";

export default defineStore({
	id: "global",
	state: () => {
		return {
			user: {},
			databases: [],
			current: {}
		};
	},
	actions: {
		async init() {
			await this.ping()
			this.getUser()
			this.getDatabases()
		},
		async getUser() {
			let res = await useApi('me.get')
			this.user = res

			if (!this.user.data) this.user.data = {};

			if (typeof this.user.data.autosave_layouts !== 'boolean') {
				this.user.data.autosave_layouts = true;
			}

		},
		async getDatabases() {
			let res = await useApi("masterUser.get")

			this.databases = res.results
			this.current.name = this.databases.find(item => item.id == this.current.current_master_user_id )?.name
		},
		async ping() {
			let res = await useApi("ping.get")

			this.current = res
		}
	},
	getters: {
	},
});


