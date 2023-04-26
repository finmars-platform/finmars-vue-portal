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

				<BaseInput
					v-model="editable.user_code"
					label="User code"
					required
				/>
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
	let widget = dashStore.components.find(item => item.id == props.wid) || {}
	let editable = reactive( JSON.parse(JSON.stringify(widget)) )

	let scopeProps = ref({})

	prepareProps()

	function prepareProps() {
		let unrefed = JSON.parse(
			JSON.stringify(
				dashStore.scope
					.filter((prop) => prop.cid == widget.id)
			)
		)

		unrefed.forEach((prop) => {
			if ( prop.direct == 'input') return false

			prop.children = dashStore.scope
				.filter( (item) => item.direct == 'input' && item.parents.includes(prop.id) )
				.map((item) => item.id)
		})
		scopeProps.value = unrefed
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
					name: `${dashStore.components.find(item => item.id == prop.cid).name} / ${prop.name}[${prop.__val}]`,
				}
			})

		return JSON.parse(JSON.stringify(newProps))
	}

	let tabList = computed(() => {
		return [...dashStore.tabs, {id: 1, name: 'Top place'}]
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
						let index = child.parents.findIndex((id) => id == prop.id)

						if ( index !== -1 ) {
							child.parents.splice(index, 1)
						}
					})

					prop.children.forEach((id) => {
						let children = state.scope.find(item => item.id == id)
						children.parents.push(prop.id)
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
