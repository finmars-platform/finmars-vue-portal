<template>
	<BaseModal title="Choose component" no_padding>
		<h3>System components</h3>
		<div class="fm_list">
			<div class="fm_list_item">Group component</div>
		</div>
		<h3>Common</h3>
		<div class="fm_list">
			<div class="fm_list_item"
				v-for="item in dashStore.componentsList"
				:class="{active: activeComponent == item.id}"
				@click="activeComponent = item.id"
			>
				{{ item.name }}
			</div>
		</div>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text">Cancel</FmBtn>
				<FmBtn @click="addComponent()">Add</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	let dashStore = useStoreDashboard()
	let activeComponent = ref(null)

	function addComponent() {
		let component = componentsList.find((item) => item.id == activeComponent.value)

		let new_component = {
			name: component.id,
			colls: component.min_colls,
			rows: component.min_rows,
		}

		dashStore.widgets.push(new_component)

		isOpenAddComponents.value = false
	}
</script>

<style lang="scss" scoped>

</style>
