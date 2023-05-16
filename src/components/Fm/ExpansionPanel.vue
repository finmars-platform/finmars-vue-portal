<template>
	<div class="fm_expansion_panel">
		<div
			class="fm_expansion_panel_title"
			:class="{ active: isOpen }"
			@click=";(isOpen = !isOpen), $emit('update:open', !isOpen)"
		>
			<div>{{ title }}</div>

			<div class="flex-row">
				<slot name="rightActions" />

				<FmIcon
					:icon="!isOpen ? 'expand_more' : 'expand_less'"
					class="m-l-10"
				/>
			</div>
		</div>

		<div class="fm_expansion_panel_content" v-show="isOpen">
			<slot />
		</div>
	</div>
</template>

<script setup>
	const props = defineProps({
		title: String,
		open: {
			type: Boolean,
			default: true,
		},
	})
	defineEmits(['update:open'])

	let isOpen = ref(props.open)
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
