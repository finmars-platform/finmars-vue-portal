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

				<PagesDashboardAddComponentMPropEditor
					v-for="prop in inputs"
					:prop="prop"
					type="inputs"
				/>
			</div>

			<div class="settings_coll">
				<h4>Outputs</h4>

				<PagesDashboardAddComponentMPropEditor
					v-for="prop in outputs"
					:prop="prop"
					type="outputs"
				/>
			</div>
		</div>
	</BaseModal>
</template>

<script setup>

	const props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})
	const dashStore = useStoreDashboard()
	const tabList = [...dashStore.tabs, {id: 1, name: 'Top place'}]

	let component = dashStore.components.find(item => item.uid == props.wid) || {}
	let editable = reactive( JSON.parse(JSON.stringify(component)) )

	let inputs = ref([])
	let outputs = ref([])

	prepareProps()

	function prepareProps() {
		inputs.value = JSON.parse(
			JSON.stringify(
				dashStore.props.inputs
					.filter((prop) => prop.component_id == component.uid)
			)
		)

		dashStore.props.outputs.forEach((prop) => {
			if ( prop.component_id != component.uid ) return false

			let clonedProp = JSON.parse(
				JSON.stringify(prop)
			)

			clonedProp._children = dashStore.props.inputs
				.filter( (item) => item.subscribedTo.includes(clonedProp.uid) )
				.map((item) => item.uid)

			outputs.value.push(clonedProp)
		})
	}
	function save() {
		dashStore.$patch((state) => {
			component.user_code = editable.user_code
			component.tab = editable.tab

			inputs.value.forEach((prop) => {
				let input = state.props.inputs.find((item => item.uid == prop.uid))

				input.default_value = prop.default_value
				input.subscribedTo = prop.subscribedTo
			})

			outputs.value.forEach((prop) => {
				let output = state.props.outputs.find((item => item.uid == prop.uid))

				output.default_value = prop.default_value

				let children = state.props.inputs
					.filter(item => item.subscribedTo.includes(prop.uid))

				children.forEach((child) => {
					let index = child.subscribedTo.findIndex((uid) => uid == prop.uid)

					if ( index !== -1 ) {
						child.subscribedTo.splice(index, 1)
					}
				})

				prop._children.forEach((uid) => {
					let children = state.props.inputs.find(item => item.uid == uid)
					children.subscribedTo.push(prop.uid)
				})
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
