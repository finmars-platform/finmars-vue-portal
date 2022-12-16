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
	let editable = reactive( widget )

	let scopeProps = {}
	prepareProps()

	function prepareProps() {
		let currentWodget = widgetList.find(item => item.id == editable.componentName)

		for ( let prop in currentWodget.props ) {
			let obj = currentWodget.props[prop]

			if (  !dashStore.scopes[editable.scope][prop] ) continue

			obj.value = dashStore.scopes[editable.scope][prop].value
		}

		scopeProps = currentWodget.props
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
			id: '' + Date.now(),
			name: 'New scope'
		})

		return list
	})

	function save() {
		dashStore.$patch((state) => {
			for ( let prop in scopeProps ) {
				state.scopes[editable.scope][prop].value = scopeProps[prop].value
			}
		})

		delete widget._isEdit

	}
</script>

<style lang="scss" scoped>

</style>
