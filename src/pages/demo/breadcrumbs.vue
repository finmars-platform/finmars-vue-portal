<template>
	<div class="breadcrumbs-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Breadcrumbs</h1>
		<div class="list">
			<FmBreadcrumbs :items="items1" />
			<FmBreadcrumbs :items="items2" />
			<FmBreadcrumbs :items="items3" />
			<FmBreadcrumbs :items="items4" />
			<FmBreadcrumbs :items="items5" />
			<FmBreadcrumbs :items="items6" />
		</div>
	</div>
</template>

<script setup>
	const items1 = [
		{ text: 'First', to: '/home', disabled: false },
		{ text: 'Second', to: '/home', disabled: false },
		{ text: 'Third', to: '/home', disabled: false },
	]
	const items2 = [
		{ text: 'First', to: '/home', disabled: true },
		{ text: 'Second', to: '/home', disabled: true },
		{ text: 'Third', to: '/home', disabled: true },
	]
	const items3 = [
		{ text: 'First', to: '', disabled: false },
		{ text: 'Second', to: '', disabled: false },
		{ text: 'Third', to: '', disabled: false },
	]
	const items4 = [
		{ text: '', to: '/home', disabled: false },
		{ text: '', to: '/home', disabled: false },
		{ text: '', to: '/home', disabled: false },
	]
	const items5 = [
		{ text: '', to: '', disabled: false },
		{ text: '', to: '', disabled: false },
		{ text: '', to: '', disabled: false },
	]
	const items6 = [
		{ text: '', to: '', disabled: true },
		{ text: '', to: '', disabled: true },
		{ text: '', to: '', disabled: true },
	]
</script>

<style scoped>
	.breadcrumbs-button-page {
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--baseText-color);
		padding: 24px;
	}
</style>
