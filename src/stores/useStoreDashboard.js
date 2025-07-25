import dayjs from 'dayjs'

function inputOutputIncompatible(input, output) {

	// TODO: check that value_types of input and output are compatible
	/*if (input.value_type !== output.value_type) {

	}*/
	return false;

}

export default defineStore({
	id: 'dashboard',
	state: () => {
		return {
			//# region DATA FROM LAYOUT
			tabs: [],
			scopes: [],
			components: [],
			props: {
				inputs: [],
				outputs: [],
				proxies: [],
			},
			//# endregion DATA FROM LAYOUT
			isEdit: false,
			layoutList: [],
			activeLayoutId: null,
			activeTab: null,
			__log: [],

			history: null,
			historyPnl: null,
			instrColors: {},
		}
	},
	actions: {
		async init() {
			await this.getLayouts()

			watch(
				() => this.activeLayoutId,
				() => {
					if (!this.activeLayoutId || !this.layout.data) return false

					this.components = this.layout.data.components || []
					this.tabs = this.layout.data.tabs || []
					this.activeTab = this.tabs[0]?.id
					this.__log = []

					if (this.layout.data.props) this.props = this.layout.data.props

					this.setPropsWatchers()
				}
			)

		},
		getComponent(id) {
			return this.components.find((item) => item.uid == id)
		},
		setComponent(component) {
			const index = this.components.findIndex(
				(item) => item.uid === component.uid
			)
			this.components[index] = component
			// TODO: udpate this.props.inputs and this.props.outputs
		},
		getComponentOutputByKey(compUid, outputKey) {
			return this.props.outputs.find(output => {
				return output.component_id === compUid && output.key === outputKey;
			});
		},
		setComponentOutputValue(uid, val) {
			const output = this.props.outputs.find(output => output.uid === uid);
			output.__val = val;
		},
		async getLayouts() {
			let dashboardLayout = localStorage.getItem('dashboardLayout')

			let res = await useApi('dashboardLayoutList.get', {
				filters: {
					name: 'dashboardV2@',
				},
			})

			if (res._$error || !res.results.length) return false

			this.layoutList = res.results

			let defaultLayout = res.results.find((o) => o.is_default)
			this.activeLayoutId =
				this.activeLayoutId || defaultLayout?.id || res.results[0].id

			this.components = this.layout.data.components || []
			this.tabs = this.layout.data.tabs || []
			this.activeTab = this.tabs[0]?.id

			if (this.layout.data.props) {
				this.layout.data.props.inputs.forEach(
					(prop) => (prop.__val = prop.default_value)
				)
				this.layout.data.props.outputs.forEach(
					(prop) => (prop.__val = prop.default_value)
				)
				this.props = this.layout.data.props
			}

			this.setPropsWatchers()
			// console.clear()
			// console.table(this.props)
		},
		setPropsWatchers() {
			this.props.outputs.forEach(outputProp => {

				if (outputProp.__unwatch) return false

				const dynamicOutput = this.getComponent(outputProp.component_id).dynamicOutputs;

				outputProp.__unwatch = watch(
					() => outputProp.__val,
					(newVal, oldVal) => {

						let inputsProps = this.props.inputs.filter((item) =>
							item.subscribedTo.find(data => data.output_id === outputProp.uid)
						)

						let log = {
							name: outputProp.name,
							componentName: this.components.find(
								(item) => item.uid == outputProp.component_id
							).user_code,
							newVal: newVal,
							oldVal: oldVal,
							time: dayjs().format('HH:mm:ss'),
							children: [],
						}

						// console.group(
						// 	`%s / ${prop.name} %c[${prop.__val}]`,
						// 	`${this.widgets.find(item => item.id == prop.cid).user_code}`,
						// 	'font-size: 16px;'
						// )

						/* ============================================================
						 * ===== ME: 2023-07-07 Can be used in later refactoring ======
						 * ============================================================

						inputs.forEach((input) => {

							if ( newVal && input.outputToInput ) {

								let inputVal = {};

								input.outputToInput.forEach(data => {

									if ( newVal.hasOwnProperty(data.output.property) ) {

										inputVal[data.input.property] = newVal[data.output.property];

									}

								});

								input.__val = inputVal;


							} else {
								input.__val = outputProp.__val;
							}

						}) */

						inputsProps.forEach((inputProp) => {
							/*log.children.push({
								name: childProp.name,
								componentName: this.components.find(
									(item) => item.uid == childProp.component_id
								).user_code,
								newVal: prop.__val,
								oldVal: childProp.__val,
							})*/

							if ( dynamicOutput ) {

								/*if ( inputOutputIncompatible(inputProp, outputProp) ) {
									return;
								}*/

								const subToData = inputProp.subscribedTo.find( data => data.output_id === outputProp.uid );

								inputProp.__val = newVal[subToData.propertyName];

							} else {

								inputProp.__val = outputProp.__val;

							}

							// console.log(
							// 	`=> ${this.components.find(item => item.id == childProp.cid).user_code} / %c${childProp.name}`,
							// 	'font-size: 14px;'
							// )
						})
						// console.groupEnd()

						this.__log.push(log)
					}
				)
			})
		},
		async getHistory(wid) {
			let component = this.components.find((item) => item.uid == wid)

			let list = this.props.inputs.filter(
				(prop) => prop.component_id == component.uid
			)
			let props = {}

			list.forEach((prop) => {
				props[prop.key] = prop.__val
			})

			let apiOpts = {
				filters: {
					portfolio: props.portfolio,
					date_from: props.date_from,
					date_to: props.date_to,
				},
				params: {
					type: 'nav',
				},
			}

			this.history = await useApi('widgetsHistory.get', apiOpts)
			if (this.history._$error) return false

			let colors = this.generateColors()

			for (let category in this.history) {
				for (let firstDate in this.history[category]) {
					Object.entries(this.history[category][firstDate].items).forEach(
						(item, key) => {
							this.instrColors[category + item[0]] = colors[key]
						}
					)

					break
				}
			}

			let apiOptsPl = {
				filters: {
					portfolio: props.portfolio,
					date_from: props.date_from,
					date_to: props.date_to,
				},
				params: {
					type: 'pl',
				},
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
			if (!this.history) return false
			return this.history[opts.category][opts.date]
		},
		async getHistoryPnl(opts) {
			console.log('opts:', opts)
			if (!this.history) return false
			return this.historyPnl[opts.category][opts.date]
		},
		async setAsDefault() {
			let props = JSON.parse(JSON.stringify(this.props))

			this.props.inputs.forEach((prop, k) => {
				props.outputs[k].__val = null
			})
			this.props.outputs.forEach((prop, k) => {
				props.outputs[k].default_value = prop.__val

				// Need to add filtor by control
				props.outputs[k].__val = null
			})

			let res = await useApi('dashboardLayout.put', {
				params: { id: this.layout.id },
				body: {
					configuration_code: this.layout.configuration_code,
					user_code: this.layout.user_code,
					is_default: true,
					data: {
						components: this.components,
						tabs: this.tabs,
						props: props,
					},
				},
			})
			let index = this.layoutList.findIndex(
				(item) => item.id == this.activeLayoutId
			)
			this.layoutList[index].is_default = true
		},
		async renameLayout(data) {
			let props = JSON.parse(JSON.stringify(this.props))

			this.props.inputs.forEach((prop, k) => {
				props.outputs[k].__val = null
			})
			this.props.outputs.forEach((prop, k) => {
				props.outputs[k].default_value = prop.__val

				// Need to add filtor by control
				props.outputs[k].__val = null
			})

			let res = await useApi('dashboardLayout.put', {
				params: { id: this.layout.id },
				body: {
					configuration_code: this.layout.configuration_code,
					...data,
					data: {
						components: this.components,
						tabs: this.tabs,
						props: props,
					},
				},
			})
			let index = this.layoutList.findIndex(
				(item) => item.id == this.activeLayoutId
			)
			this.layoutList[index].name = data.name
			this.layoutList[index].user_name = data.user_name
		},
		async saveLayout() {

			let props = JSON.parse(JSON.stringify(this.props))

			this.props.inputs.forEach((prop, k) => {
				props.inputs[k].__val = null
			})
			this.props.outputs.forEach((prop, k) => {
				props.outputs[k].default_value = prop.__val

				// Need to add filtor by control
				props.outputs[k].__val = null
			})

			let res;

			if (!this.layout.id) {

				res = await useApi('dashboardLayout.post', {
					body: {
						name: this.layout.name + ' dashboardV2@',
						user_code: this.layout.user_code,
						configuration_code: this.layout.configuration_code,
						data: {
							components: this.components,
							tabs: this.tabs,
							props: props,
						},
					},
				})

			}
			else {

				res = await useApi('dashboardLayout.put', {
					params: { id: this.layout.id },
					body: {
						user_code: this.layout.user_code,
						configuration_code: this.layout.configuration_code,
						data: {
							components: this.components,
							tabs: this.tabs,
							props: props,
						},
					},
				})

			}

			if (!res._$error) {

				this.layoutList.push(res)
				this.activeLayoutId = res.id
				// this.isEdit = false

				useNotify({
					type: 'success',
					title: `Dashboard layout ${res.name} successfully saved`,
				})
			}

			if (!this.activeLayoutId) this.activeLayoutId = this.layoutList[0].id
		},
		async deleteLayout() {
			let res = await useApi('dashboardLayout.delete', {
				params: { id: this.layout.id },
				body: {
					user_code: this.layout.user_code,
				},
			})

			await this.clearLayoutData()

			this.getLayouts()
		},
		async clearLayoutData() {
			this.components = []
			await nextTick()
			this.tabs = []
			this.props = []

			this.activeTab = null
			this.activeLayoutId = null
		},
		removeInput(uid) {
			let index = this.props.inputs.findIndex(
				(item) => item.uid === uid
			)

			if (index === -1) return false;

			this.props.inputs.splice(index, 1);
		},
		removeComponent(uid) {
			let index = this.components.findIndex((item) => item.uid == uid)

			if (index === -1) throw new Error('[Store:removeComponent] ID not found')

			this.props.inputs
				.filter((item) => item.component_id == this.components[index].uid)
				.forEach((prop) => {
					this.removeInput(prop.uid)
				})

			this.props.outputs
				.filter((item) => item.component_id == this.components[index].uid)
				.forEach((prop) => {
					let index = this.props.outputs.findIndex(
						(item) => item.uid == prop.uid
					)

					if (index === -1) return false

					this.props.inputs
						.filter((item) =>
							// item.subscribedTo.includes(this.props.outputs[index].uid)
							item.subscribedTo.find(data => data.output_id === prop.uid)
						)
						.forEach((item) => {
							let indexParent = item.subscribedTo.findIndex(
								(id) => id == this.props.outputs[index].uid
							)

							item.subscribedTo.splice(indexParent, 1)
						})

					this.props.outputs.splice(index, 1)
				})

			this.components.splice(index, 1)
		},
	},
	getters: {
		layout(state) {
			return (
				state.layoutList.find((item) => item.id == state.activeLayoutId) || {}
			)
		},
	},
})
