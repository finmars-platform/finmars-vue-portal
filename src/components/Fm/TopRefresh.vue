<template>
	<div>
		<v-container class="justify-space-between d-flex py-3" fluid>
			<v-btn
				class="add"
				color="primary"
				icon="mdi-plus"
				size="small"
				to="/settings/permissions/members/add"
			/>

			<v-text-field
				class="py-0"
				label="Search"
				placeholder="Search"
				variant="plain"
				prepend-icon="mdi-magnify"
				hide-details="auto"
				density="compact"
			/>

			<v-spacer></v-spacer>

			<v-btn color="#737373"
				size="small"
				height="auto"
				variant="text"
				stacked
				class="text-capitalize"
				@click="refresh()"
			>
				<v-icon start size="24" icon="mdi-refresh"></v-icon>
				refresh
			</v-btn>
		</v-container>
		<v-divider></v-divider>
	</div>
</template>

<script setup>

	const props = defineProps([
		'refresh'
	])
	const emit = defineEmits([
		'selected:type', 'update:modelValue'
	])
</script>
<style lang="scss" scoped>

	.add {
		margin-right: 15px;
	}
</style>
