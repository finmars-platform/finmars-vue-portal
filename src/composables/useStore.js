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

			if ( res.error && res.code == '401' ) {
				let token = await useApi('tokenRefresh.post', {body: {
					refresh_token: useCookie('refresh_token').value }
				})

				if ( !token.error ) {
					useCookie('access_token').value = token.access_token

					await new Promise((rej) => {
						setTimeout(rej, 300)
					})
					res = await useApi("ping.get")
				} else {
					const config = useRuntimeConfig()

					useRouter().push('/login')
				}
			}

			this.current = res
		}
	},
	getters: {
	},
});


