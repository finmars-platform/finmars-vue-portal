import { defineStore } from "pinia";

export default defineStore({
	id: "global",
	state: () => {
		return {
			user: {},
			databases: {},
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
		},
		async getDatabases() {
			let res = await useApi("masterUser.get")

			this.databases = res.results
			this.current.name = this.databases.find(item => item.id == this.current.current_master_user_id )?.name
		},
		async ping() {
			let res = await useApi("ping.get")

			if ( !res.is_authenticated ) {
				const config = useRuntimeConfig()

				window.location.href = `${config.public.apiURL}/login`
			}

			this.current = res
		}
	},
	getters: {
	},
});


