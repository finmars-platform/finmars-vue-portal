<template>
	<div class="demo-menu-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Menu</h1>
		<a target="_blank" href="https://floating-vue.starpad.dev/guide/">Docs</a>
		<div class="list">
			<VMenu>
				<FmBtn>Documentation</FmBtn>

				<template #popper>
					<FmBtn>Guide</FmBtn>
					<FmBtn>API Reference</FmBtn>
				</template>
			</VMenu>
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-menu-page {
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
