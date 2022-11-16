<template>
	<BaseModal title="Edit widget" no_padding>



		<template #controls>
			<div class="flex sb">
				<FmBtn type="text">Cancel</FmBtn>
				<FmBtn @click="save()">Save</FmBtn>
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
