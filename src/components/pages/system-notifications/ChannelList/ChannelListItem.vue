<template>
	<div
		:class="[
			'channel-list-item',
			{ 'channel-list-item--selected': isSelected }
		]"
		@click="emits('select', item?.user_code)"
	>
		{{ channelName }}
	</div>
</template>

<script setup>
	import { computed } from 'vue';

	const props = defineProps({
		item: {
			type: Object
		},
		isSelected: {
			type: Boolean
		}
	});

	const emits = defineEmits(['select']);

	const channelName = computed(() => {
		return props.item?.user_code
			? `#${props.item?.user_code}`
			: props.item?.name;
	});
</script>

<style lang="scss" scoped>
	.channel-list-item {
		position: relative;
		width: 100%;
		height: 48px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0 12px 0 48px;
		font: var(--body-medium-font);
		color: var(--on-surface);
		cursor: pointer;

		&:hover {
			background-color: color-mix(in srgb, var(--primary) 8%, transparent);
		}

		&--selected {
			background-color: var(--secondary);
			color: var(--on-secondary);

			&:hover {
				background-color: color-mix(in srgb, var(--secondary) 75%, transparent);
			}
		}
	}
</style>
