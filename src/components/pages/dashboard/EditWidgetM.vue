<template>
	<BaseModal
		no_padding
		title="Edit widget"
		:controls="{
			cancel: {name: 'Cancel'},
			action: {name: 'Save', cb: save},
		}"
	>
		<FmTabs :tabs="tabs" v-model="tab" />

		<div class="p-16">
			<template v-if="tab == 'widget'">
				<FmSelect
					v-model="editable.scope"
					:items="scopeList"
					label="Scope"
					@update:modelValue="prepareProps()"
				/>
				<FmSelect
					v-model="editable.tab"
					:items="tabList"
					label="Tab"
				/>
			</template>

			<template v-if="tab == 'scope'">
				<BaseInput v-for="item in scopeProps" v-model="item.value" :label="item.name" />
			</template>
		</div>
	</BaseModal>
</template>

<script setup>

	import widgetList from '~/assets/data/widgets.js'

	let props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})
	let dashStore = useStoreDashboard()

	let tabs = ref(['widget', 'scope'])
	let tab = ref('widget')

	let widget = dashStore.widgets.find(item => item.id == props.wid) || {}
	let editable = reactive( JSON.parse(JSON.stringify(widget)) )

	let scopeProps = ref({})
	prepareProps()

	function prepareProps() {
		let currentWodget = widgetList.find(item => item.id == editable.componentName)

		for ( let prop in currentWodget.props ) {
			let obj = currentWodget.props[prop]

			if ( !dashStore.scopes[editable.scope] || !dashStore.scopes[editable.scope][prop] ) {
				obj.value = ''

			} else {

				obj.value = dashStore.scopes[editable.scope][prop].value
			}
		}
		console.log('editable.scope:', editable.scope)

		scopeProps.value = currentWodget.props
	}

	let tabList = computed(() => {
		return [...dashStore.tabs, {id: null, name: 'Top place'}]
	})

	let scopeList = computed(() => {
		let list = []

		for ( let prop in dashStore.scopes ) {
			list.push({
				id: prop,
				name: prop
			})
		}

		list.push({
			id: 'New scope',
			name: 'New scope'
		})

		return list
	})

	function save() {
		let newScope = editable.scope

		dashStore.$patch((state) => {
			let oldScope = widget.scope

			for ( let prop in state.scopes[oldScope] ) {
				let index = state.scopes[oldScope][prop]._used.findIndex(item => item == editable.id)

				delete state.scopes[oldScope][prop]._used.splice(index, 1)
			}

			if ( !state.scopes[newScope] ) {
				newScope = 'Scope №' + Math.round(Math.random(0, 1) * 1000)
				state.scopes[newScope] = {}
			}

			for ( let prop in scopeProps.value ) {
				if ( !state.scopes[newScope][prop] ) {
					state.scopes[newScope][prop] = structuredClone( toRaw(scopeProps.value[prop]) )
				}

				state.scopes[newScope][prop].value = scopeProps.value[prop].value

				if ( !state.scopes[newScope][prop]._used )
					state.scopes[newScope][prop]._used = []

				state.scopes[newScope][prop]._used.push(editable.id)
			}
		})

		delete widget._isEdit

		widget.scope = newScope
		widget.tab = editable.tab
	}
</script>

<style lang="scss" scoped>

</style>
