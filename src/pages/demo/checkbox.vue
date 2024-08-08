<template>
	<div class="checkbox-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Checkbox</h1>
		<div class="list">
			<FmCheckbox
				v-model="value"
			/>
			<FmCheckbox
				v-model="value"
				label="label"
			/>
			<FmCheckbox
				v-model="value"
				label="label"
				:disabled="true"
			/>
		</div>
	</div>
</template>

<script setup>
	const value = ref(false)
</script>

<style scoped>
	.checkbox-button-page {
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 200px;
		border: 1px solid var(--baseText-color);
		padding: 24px;
	}
</style>
