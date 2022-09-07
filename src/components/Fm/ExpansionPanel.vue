<template>
	<div class="fm_expansion_panel">
		<div class="fm_expansion_panel_title"
			:class="{active: isOpen}"
			@click="isOpen = !isOpen"
		>
			<div>{{ title }}</div>

			<FmIcon :icon="!isOpen ? 'expand_more' : 'expand_less'" />
		</div>

		<div class="fm_expansion_panel_content"
			v-show="isOpen"
		>
			<slot />
		</div>
	</div>
</template>

<script setup>
	defineProps({
		title: String
	})

	let isOpen = ref(true)
</script>

<style lang="scss" scoped>
	.fm_expansion_panel {
		border: 1px solid $border;
		margin-bottom: 15px;
		background: $separ;
		border-radius: 4px;
		max-width: 100%;
	}
	.fm_expansion_panel_content {
		padding: 15px;
	}
	.fm_expansion_panel_title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 48px;
		padding: 0 22px;
		cursor: pointer;
		font-weight: 500;

		&.active {
			border-bottom: 1px solid $border;
		}
	}
</style>
