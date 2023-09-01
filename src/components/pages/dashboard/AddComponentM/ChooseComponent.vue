<template>
	<div>
			<h3 v-if="systems.length">System components</h3>

			<div class="fm_list">
				<div class="fm_list_item"
					v-for="item in systems"
					:class="{active: component.name == item.name}"
					@click="chooseComponent(item)"
				>
					{{ item.name }}
				</div>
			</div>

			<h3>Base components</h3>

			<div class="fm_list m-b-10">
				<div class="fm_list_item"
					v-for="item in bases"
					:class="{active: component.name == item.name}"
					@click="chooseComponent(item)"
				>
					{{ item.name }}
				</div>
			</div>
		</div>
</template>

<script setup>

	import widgetList from '~/components/pages/dashboard/components.js'

	const { component, updateComponent } = inject('component')

	let systems = widgetList.filter((item) => item._group == 'system')
	let bases = widgetList.filter((item) => item._group == 'base')

	function chooseComponent( item ) {
		updateComponent( structuredClone(item) )
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
