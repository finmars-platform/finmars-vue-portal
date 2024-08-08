<template>
	<div class="demo-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Button</h1>
		<div class="list">
			<FmBtn> primary</FmBtn>
			<FmBtn type="outlined"> outlined</FmBtn>
			<FmBtn type="basic"> basic</FmBtn>
			<FmBtn type="text"> text</FmBtn>
			<FmBtn type="action"> action</FmBtn>
			<FmBtn type="icon" icon="close" />
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-button-page {
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
