import { defineStore } from "pinia";
import widgetList from '~/assets/data/widgets.js'

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			// DATA
			widgets: [],
			tabs: [],
			scope: [],
			// END DATA
			layoutList: [],
			activeLayoutId: null,
			activeTab: null,
			//test
			history: null,
			historyPnl: null,
			instrColors: {}
		};
	},
	actions: {
		async init() {
			await this.getLayouts()
			this.activeTab = this.tabs[0]?.id

			watch(() => this.activeLayoutId, () => {
				this.widgets = this.layout.data.widgets || []
				this.tabs = this.layout.data.tabs || []
				this.scope = this.layout.data.scope || []
			})
		},
		getWidget(id) {
			return this.widgets.find(item => item.id == id)
		},
		async getLayouts() {
			let dashboardLayout = localStorage.getItem('dashboardLayout')

			let res = await useApi('dashboardLayoutList.get', {filters: {
				name: 'dashboardV2@'
			}});

			if ( res.error || !res.results.length ) return false

			this.layoutList = res.results
			this.activeLayoutId = res.results[0].id

			this.widgets = this.layout.data.widgets || []
			this.tabs = this.layout.data.tabs || []
			this.scope = this.layout.data.scope || []
			// console.clear()
			console.table(this.scope)
		},
		async getHistory(wid) {
			let widget = this.widgets.find(item => item.id == wid)

			let list = this.scope.filter((prop) => prop.cid == widget.id)
			let props = {}

			list.forEach((prop) => {
				props[prop.name] = prop.__val
			})

			let apiOpts = {
				filters: {
					portfolio: props.portfolio,
					date_from: props.date_from,
					date_to: props.date_to,
				},
				params: {
					type: 'nav'
				}
			}

			this.history = await useApi('widgetsHistory.get', apiOpts)

			let colors = this.generateColors();

			for ( let category in this.history ) {
				for ( let firstDate in this.history[category] ) {
					Object.entries(this.history[category][firstDate].items)
						.forEach((item, key) => {
							this.instrColors[category + item[0]] = colors[key]
						})

					break;
				}
			}

			let apiOptsPl = {
				filters: {
					portfolio: props.portfolio,
					date_from: props.date_from,
					date_to: props.date_to,
				},
				params: {
					type: 'pl'
				}
			}

			this.historyPnl = await useApi('widgetsHistory.get', apiOptsPl)
			// this.scopes[widget.scope]._cbp_type
			return props.type == 'nav' ? this.history : this.historyPnl
		},
		generateColors() {
			return [
				'#577590CC',
				'#43AA8BCC',
				'#F9AB4B',
				'#FA6769',
				'#F9C74F',
				'#979BFF',
				'#D9ED92',
				'#C8D7F9',
				'#96B5B4',
				'#AB7967',
				'#577590CC',
				'#43AA8BCC',
				'#F9AB4B',
				'#FA6769',
				'#F9C74F',
				'#979BFF',
				'#D9ED92',
				'#C8D7F9',
				'#96B5B4',
				'#AB7967',
				'#577590CC',
				'#43AA8BCC',
				'#F9AB4B',
				'#FA6769',
				'#F9C74F',
				'#979BFF',
				'#D9ED92',
				'#C8D7F9',
				'#96B5B4',
				'#AB7967',
				'#577590CC',
				'#43AA8BCC',
				'#F9AB4B',
				'#FA6769',
				'#F9C74F',
				'#979BFF',
				'#D9ED92',
				'#C8D7F9',
				'#96B5B4',
				'#AB7967',
			]
		},
		async getHistoryNav(opts) {
			if ( !this.history ) return false
			return this.history[opts.category][opts.date]
		},
		async getHistoryPnl(opts) {
			if ( !this.history ) return false
			return this.historyPnl[opts.category][opts.date]
		},
		async saveLayout() {
			if ( !this.layout.id ) {
				let res = await useApi('dashboardLayout.post', {
					body: {
						name: this.layout.name + ' dashboardV2@',
						user_code: this.layout.user_code,
						data: {
							widgets: this.widgets,
							tabs: this.tabs,
							scope: this.scope,
						}
					}
				})

				if (!res.error) {
					this.layoutList.push(res)
					this.activeLayoutId = res.id
				}

			} else {

				let res = await useApi('dashboardLayout.put', {
					params: {id: this.layout.id},
					body: {
						user_code: this.layout.user_code,
						data: {
							widgets: this.widgets,
							tabs: this.tabs,
							scope: this.scope,
						}
					}
				})

			}

			if (!this.activeLayoutId) this.activeLayoutId = this.layoutList[0].id;
		},
		async deleteLayout() {
			let res = await useApi('dashboardLayout.delete', {
				params: {id: this.layout.id},
				body: {
					user_code: this.layout.user_code
				}
			})

			this.getLayouts()
		},
		removeWidget( id ) {
			let index = this.widgets.findIndex(item => item.id == id)

			if ( index === -1 ) throw new Error('[Store:removeWidget] ID not find')

			this.scope
				.filter(item => item.cid == this.widgets[index].id)
				.forEach((prop) => {
					let index = this.scope.findIndex(item => item.id == prop.id)

					if ( index === -1 ) return false

					this.scope.splice(index, 1)
				})

			this.widgets.splice(index, 1)
		}
	},
	getters: {
		layout(state) {
			return state.layoutList.find(item => item.id == state.activeLayoutId) || {}
		}
	},
});
