import { defineStore } from "pinia";
import widgetList from '~/assets/data/widgets.js'

export default defineStore({
	id: "dashboard",
	state: () => {
		return {
			// DATA
			widgets: [],
			tabs: [],
			scopes: {
				global: {}
			},
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
			this.scopes = this.layout.data.scopes || {global: {}}
		},
		async getHistory(wid) {
			let widget = this.widgets.find(item => item.id == wid)

			let apiOpts = {
				filters: {
					portfolio: this.scopes[widget.scope].portfolio.value,
					date_from: this.scopes[widget.scope].date_from.value,
					date_to: this.scopes[widget.scope].date_to.value,
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
					portfolio: this.scopes[widget.scope].portfolio.value,
					date_from: this.scopes[widget.scope].date_from.value,
					date_to: this.scopes[widget.scope].date_to.value
				},
				params: {
					type: 'pl'
				}
			}

			this.historyPnl = await useApi('widgetsHistory.get', apiOptsPl)

			return this.scopes[widget.scope]._cbp_type == 'nav' ? this.history : this.historyPnl
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
			return this.history[opts.category][opts.date]
		},
		async getHistoryPnl(opts) {
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
							scopes: this.scopes,
						}
					}
				})

				if (!res.error) {
					this.layoutList.push(res);
				}

			} else {

				let res = await useApi('dashboardLayout.put', {
					params: {id: this.layout.id},
					body: {
						user_code: this.layout.user_code,
						data: {
							widgets: this.widgets,
							tabs: this.tabs,
							scopes: this.scopes,
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
		},
		removeWidget( id ) {
			let index = this.widgets.findIndex(item => item.id == id)

			if ( index === -1 ) throw new Error('[Store:removeWidget] ID not find')

			let widget = this.widgets[index]
			let baseWidget = widgetList.find(item => item.id == widget.componentName)

			for ( let prop in baseWidget.props ) {
				let propObject = this.scopes[widget.scope][prop]

				if ( !propObject ) throw new Error('[Store:removeWidget] Data incorrect')
				propObject._usedCount -= 1

				if ( propObject._usedCount == 0 || this.widgets.length == 1 ) {
					delete this.scopes[widget.scope][prop]
				}

			}

			this.widgets.splice(index, 1)
		}
	},
	getters: {
		layout(state) {
			return state.layoutList.find(item => item.id == state.activeLayoutId) || {}
		}
	},
});
