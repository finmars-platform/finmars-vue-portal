<template>
	<BaseModal
		no_padding
		title="Choose component"
		:controls="{
			cancel: {name: 'Cancel', cb() {}},
			action: {name: 'Save', cb: addComponent},
		}"
	>
		<h3>System components</h3>

		<div class="fm_list">
			<div class="fm_list_item">Group component</div>
		</div>

		<h3>Common</h3>

		<div class="fm_list">
			<div class="fm_list_item"
				v-for="item in widgetList"
				:class="{active: activeWidget == item.id}"
				@click="activeWidget = item.id"
			>
				{{ item.name }}
			</div>
		</div>
	</BaseModal>
</template>

<script setup>
	import widgetList from '~/assets/data/widgets.js'

	let props = defineProps({
		tab: String,
	})

	let dashStore = useStoreDashboard()
	let activeWidget = ref(null)

	function addComponent() {
		let widget = widgetList.find((item) => item.id == activeWidget.value)

		let new_widget = {
			id: generateId(),
			componentName: widget.componentName,
			scope: null,
			tab: props.tab ? props.tab : null,
			colls: widget.minColls,
			rows: widget.minRows,
			minColls: widget.minColls,
			minRows: widget.minRows,
			settings: {}
		}

		dashStore.widgets.push(new_widget)
	}
	function generateId() {

	}
</script>

<style lang="scss" scoped>
	h3 {
		padding: 10px 20px;
		font-weight: 500;
	}
	.fm_list_item {
		padding: 0 20px;
	}
</style>
