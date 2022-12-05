import { defineStore } from "pinia";

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			layout: {},

			// DATA
			widgets: [],
			tabs: [],
			scopes: {
				global: {
					date: '2022-09-15',
				},
				test: {
					portfolio: 2,
					date: '2022-09-15',
					_type: 'nav',
					dataset: {

					}
				}
			},

			//test
			history: null
		};
	},
	actions: {
		async init() {
			await this.getLayout()
		},
		getScope() {
			return this.scopes.test
		},
		async getLayout() {
			let dashboardLayout = localStorage.getItem('dashboardLayout')
			let res = await useApi('dashboardLayout.get', {params: {id: 17}});

			if ( res.error ) return false

			this.widgets = res.data.widgets || []
			this.tabs = res.data.tabs || []
			this.scopes = res.data.scopes || {}

			delete res.data

			this.layout = res
		},
		async getHistory() {
			let apiOpts = {
				filters: {
					portfolio: this.scopes.test.portfolio,
					date_to: this.scopes.test.date
				},
				params: {
					type: this.scopes.test._type
				}
			}

			let res = await useApi('widgetsHistory.get', apiOpts)

			return res
		},
		async saveLayout() {
			let res = await useApi('dashboardLayout.put', {
				params: {id: 17},
				body: {
					user_code: this.layout.user_code,
					data: {
						widgets: this.widgets,
						tabs: this.tabs,
						scopes: this.scopes,
					}
				}
			})
		},
		removeWidget( id ) {
			let index = this.widgets.findIndex(item => item.id == id)

			if ( ~index ) this.widgets.splice(index, 1)
			else throw new Error('[Store:removeWidget] ID not find')
		}
	},
	getters: {

	},
});
