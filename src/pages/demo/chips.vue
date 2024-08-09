<template>
	<div class="chips-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Chips</h1>
		<div class="list">
			<FmChips :items="items">
				<FmBtn type="action">Example</FmBtn>
			</FmChips>
			<FmChips :canDelete="true" @delete="remove" :items="items">
				<FmBtn type="action">Example</FmBtn>
			</FmChips>
		</div>
	</div>
</template>

<script setup>
	const items = ref([
		{ isActive: false, text: 'Text1', error_data: 'Error data1' },
		{
			isActive: true,
			text: 'Text2',
			error_data: 'Error data2',
		},
	])

	function remove(val) {
		items.value = items.value.filter((item) => item !== val[0])
	}
</script>

<style scoped>
	.chips-button-page {
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
