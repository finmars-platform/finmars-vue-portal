<template>
	<div class="demo-copy-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Copybutton</h1>
		<div class="list">
			<FmCopyButton />
			<FmCopyButton text="Test" />
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-copy-button-page {
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
