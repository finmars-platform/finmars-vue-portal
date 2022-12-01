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
					:items="[
						{id:1, name: 'scope test'},
						{id:2, name: 'scope test 2'},
					]"
					label="Scope"
				/>
				<FmSelect
					v-model="editable.tab"
					:items="[
						{id:1, name: 'test'},
						{id:2, name: 'test 2'},
					]"
					label="Tab"
				/>
			</template>

			<template v-if="tab == 'scope'">
				<BaseInput v-model="editable.tab" />
				<BaseInput v-model="editable.scope" />
				<BaseInput v-model="editable.portfolio" />
			</template>
		</div>
	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})
	let dashStore = useStoreDashboard()

	let tabs = ref(['widget', 'scope'])
	let tab = ref('widget')
	let editable = dashStore.widgets.find(item => item.id == props.wid) || {}
	editable = Object.assign({}, editable)
	console.log('editable:', editable)

</script>

<style lang="scss" scoped>

</style>
