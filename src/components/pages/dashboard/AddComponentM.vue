<template>
	<BaseModal
		no_padding
		title="Choose component"
		:controls="{
			cancel: {name: 'Cancel'},
			action: {name: 'Save', cb: addComponent},
		}"
	>
		<h3>System components</h3>

		<div class="fm_list">
			<div class="fm_list_item"
				v-for="item in systems"
				:class="{active: activeWidget == item.id}"
				@click="activeWidget = item.id"
				@dblclick="activeWidget = item.id, addComponent(), $emit('close')"
			>
				{{ item.name }}
			</div>
		</div>

		<h3>Base components</h3>

		<div class="fm_list">
			<div class="fm_list_item"
				v-for="item in bases"
				:class="{active: activeWidget == item.id}"
				@click="activeWidget = item.id"
				@dblclick="activeWidget = item.id, addComponent(), $emit('close')"
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

	let systems = computed(() => {
		return widgetList.filter((item) => item.group == 'system')
	})

	let bases = computed(() => {
		return widgetList.filter((item) => item.group == 'base')
	})

	function addComponent() {
		let widget = widgetList.find((item) => item.id == activeWidget.value)

		let new_widget = {
			id: generateId(widget.id),
			name: widget.name,
			componentName: widget.id,
			scope: 'global',
			tab: props.tab ? props.tab : null,
			colls: widget.minColls,
			rows: widget.minRows,
			minColls: widget.minColls,
			minRows: widget.minRows,
			settings: {},
			_isEdit: true
		}

		dashStore.widgets.push(new_widget)
	}
	function generateId( id ) {
		return id + Date.now()
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
