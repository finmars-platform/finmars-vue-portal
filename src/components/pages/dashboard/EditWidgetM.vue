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

				<div v-for="item in scopeProps.filter(item => item.direct == 'input')">
					<BaseInput
						v-if="!propMode[item.name]"
						v-model="item.__val"
						:label="item.name"
					/>
					<BaseMultiSelectInput
						v-else
						v-model="item.parents"
						:title="item.name"
						:items="prepareItems(item)"
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

				<div v-for="item in scopeProps.filter(item => item.direct == 'output')">
					<BaseMultiSelectInput
						v-model="item.children"
						:title="item.name"
						:items="prepareItems(item)"
						item_id="id"
					/>
				</div>
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

	prepareProps()

	function prepareProps() {
		scopeProps.value = JSON.parse(JSON.stringify( dashStore.scope.filter((prop) => prop.cid == widget.id) ))
	}
	function prepareItems(childProp) {
		let newProps = dashStore.scope
			.filter((prop) => {
				let isType = prop.type == childProp.type
				let isDirect = prop.direct != childProp.direct

				return isType && isDirect && childProp.cid != prop.cid
			})
			.map((prop) => {
				return {
					id: prop.id,
					name: `${dashStore.widgets.find(item => item.id == prop.cid).name} / ${prop.name}[${prop.__val}]`,
				}
			})

		return JSON.parse(JSON.stringify(newProps))
	}

	let tabList = computed(() => {
		return [...dashStore.tabs, {id: null, name: 'Top place'}]
	})

	function save() {
		dashStore.$patch((state) => {
			widget.user_code = editable.user_code
			widget.tab = editable.tab

			scopeProps.value.forEach((prop) => {
				let scopeProp = state.scope.find((item => item.id == prop.id))

				scopeProp.__val = prop.__val

				if ( prop.parents ) scopeProp.parents = prop.parents
				if ( prop.children ) {
					let children = state.scope.filter(item => item.parents && item.parents.includes(prop.id))

					children.forEach((child) => {
						if ( child.parents.includes(prop.id) ) {

						}
					})
				}
			})
		})


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
