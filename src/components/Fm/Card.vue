<template>
	<div class="fm_card"
		:class="{with_controls: controls}"
	>
		<div class="fm_card_title" v-if="title">{{ title }}</div>

		<slot></slot>

		<div class="fm_card_actions">
			<slot name="controls"></slot>
		</div>
	</div>
</template>

<script setup>
	defineProps({
		title: String,
		controls: Boolean
	})
</script>

<style lang="scss" scoped>
	.fm_card {
		position: relative;
		background: var(--page-background-color);
		color: var(--secondary-color);
		box-shadow: 0 1px 4px var(--shadow-color);
		border: 1px solid var(--card-border-color);
		border-radius: 16px;
		padding: 20px;
		word-wrap: break-word;

		&.fm_card_text {
			background: none;
			box-shadow: none;
		}
	}
	.fm_card_title {
		word-wrap: break-word;
	}
	.fm_card_actions {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		//padding: inherit;
		//padding-bottom: 20px;
		padding-top: 0;
	}
	.with_controls {
		padding-bottom: 80px;
		background: var(--card-background-color);
		color: var(--secondary-color);
	}
	.settings_block {
		background: var(--card-background-color);
		color: var(--secondary-color);
	}
</style>
