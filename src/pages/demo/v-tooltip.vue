<template>
	<div class="demo-tooltip-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Tooltip</h1>
		<a target="_blank" href="https://floating-vue.starpad.dev/guide/">Docs</a>
		<div class="list">
			<VTooltip>
				<FmBtn>Sponsor me</FmBtn>

				<template #popper> Tooltip directive </template>
			</VTooltip>
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-tooltip-page {
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
