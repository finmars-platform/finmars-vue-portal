<template>
	<div class="demo-close-popover-directive-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Popover-directive</h1>
		<a target="_blank" href="https://floating-vue.starpad.dev/guide/">Docs</a>
		<div class="list">
			<VDropdown>
				<FmBtn> Click me</FmBtn>

				<template #popper>
					<FmBtn v-close-popper>Close</FmBtn>
				</template>
			</VDropdown>
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-close-popover-directive-page {
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
