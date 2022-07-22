<template>
	<div class="fm_card">
		<slot></slot>
	</div>
</template>

<style lang="scss" scoped>
	.fm_card {
		background: $separ;
		box-shadow: 0 1px 4px rgb(103 102 102 / 25%);
		border-radius: 4px;
		padding: 20px;
	}
</style>
