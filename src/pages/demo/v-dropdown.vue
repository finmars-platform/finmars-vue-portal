<template>
	<div class="demo-dropdown-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Dropdown</h1>
		<a target="_blank" href="https://floating-vue.starpad.dev/guide/">Docs</a>
		<div class="list">
			<VDropdown :distance="6">
				<FmBtn>Click me</FmBtn>

				<template #popper>
					<input
						class="tooltip-content"
						v-model="msg"
						placeholder="Tooltip content"
					/>
					<p>
						{{ msg }}
					</p>
				</template>
			</VDropdown>
		</div>
	</div>
</template>

<script setup>
	const msg = ref('Message')
</script>

<style scoped>
	.demo-dropdown-page {
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
