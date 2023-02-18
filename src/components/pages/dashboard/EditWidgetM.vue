<template>
	<BaseModal
		no_padding
		title="Edit widget"
		:controls="{
			cancel: {name: 'Cancel'},
			action: {name: 'Save', cb: save},
		}"
	>
	<div class="settings flex">
			<div class="settings_coll">
				<h4>General</h4>

				<!-- <BaseInput
					v-model="activeWidget.user_code"
					label="User code"
					required
				/> -->
				<FmSelect
					v-model="editable.tab"
					:items="tabList"
					label="Tab"
				/>
			</div>

			<div class="settings_coll">
				<h4>Inputs</h4>

				<div v-for="item in scopeProps">
					<BaseInput
						v-if="!propMode[item.name]"
						v-model="item.__val"
						:label="item.name"
					/>
					<BaseMultiSelectInput
						v-else
						v-model="item.parents"
						:title="item.name"
						:items="JSON.parse(JSON.stringify(dashStore.scope))"
						item_id="id"
					/>

					<FmCheckbox
						class="inherit_checkbox"
						v-model="propMode[item.name]"
						:label="`Inherit value`"
					/>
				</div>

			</div>

			<div class="settings_coll">
				<h4>Outputs</h4>

				<!-- <div v-for="item in activeWidget.props.outputs">
					<BaseMultiSelectInput
						v-model="item.children"
						:title="item.name"
						:items="JSON.parse(JSON.stringify(dashStore.scope))"
						item_id="id"
					/>
				</div> -->
			</div>
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
	let propMode = reactive({})
	let widget = dashStore.widgets.find(item => item.id == props.wid) || {}
	let editable = reactive( JSON.parse(JSON.stringify(widget)) )

	let scopeProps = ref({})
	let currentWodget = widgetList.find(item => item.id == editable.componentName)
	console.log('currentWodget:', currentWodget)

	prepareProps()

	function prepareProps() {
		scopeProps.value = dashStore.scope.filter((prop) => prop.cid == widget.id)
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
		dashStore.$patch((state) => {
			// state.scope.push(...scopeProps.value)
		})

		// widget.scope = 'main'
		// widget.tab = editable.tab
	}
</script>

<style lang="scss" scoped>
.settings {
		padding: 20px;
	}
	.settings_coll {
		width: 300px;

		& + & {
			padding-left: 20px;
		}
	}
	.inherit_checkbox {
		margin-top: -18px;
		margin-bottom: 25px;
	}
</style>
