<template>
	<div class="fm_expansion_panel" :class="{ active: isOpen }">
		<div
			class="fm_expansion_panel_title"
			:class="{ active: isOpen }"
			@click=";(isOpen = !isOpen), $emit('update:open', !isOpen)"
		>
			<div class="name">{{ title }}</div>
			<div class="subtitle">
				<div v-if="!isOpen" class="subtitle__main subtitle__text">
					{{ subtitle }}
				</div>
				<div v-if="isOpen" class="subtitle__open subtitle__text">
					{{ subtitleOpen }}
				</div>
			</div>
			<div class="flex-row arrow">
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
		subtitle: String,
		subtitleOpen: String,
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
		
		background: $separ;
		border-radius: 4px;
		max-width: 100%;
		box-shadow: 2px 0 2px rgba(0, 0, 0, 0.1), 0 2px 2px rgba(0, 0, 0, 0.1),
			-2px 0 2px rgba(0, 0, 0, 0.1);
	}
	.fm_expansion_panel.active {
		margin-bottom: 15px;
	}
	.fm_expansion_panel_content {
		padding: 15px;
	}
	.name{
		width: 35%;
	}
	.arrow{
		margin-left: auto;
		margin-right: 0;
	}
	.fm_expansion_panel_title {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 48px;
		padding: 0 22px;
		cursor: pointer;
		font-weight: 500;

		&.active {
			border-bottom: 1px solid $border;
		}
	}
	.subtitle__text {
		color: $gray;
		font-weight: 400;
	}
</style>
