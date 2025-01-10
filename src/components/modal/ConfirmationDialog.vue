<template>
	<teleport to="body">
		<section class="dialog-wrapper">
			<div class="dialog">
				<div class="dialog__header">
					<span>{{ title }}</span>

					<FmIconButton
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close', false)"
					/>
				</div>

				<div class="dialog__body">
					{{ text }}
				</div>

				<div class="dialog__actions">
					<FmButton
						type="secondary"
						rounded
						@click.stop.prevent="emits('close', false)"
					>
						{{ locals.cancelButtonText }}
					</FmButton>

					<FmButton rounded @click.stop.prevent="emits('close', true)">
						{{ locals.confirmationButtonText }}
					</FmButton>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { FmButton, FmIconButton } from '@finmars/ui';

	defineProps({
		title: {
			type: String,
			default: 'Warning'
		},
		text: {
			type: String,
			default: 'Are you sure you want to continue?'
		},
		locals: {
			type: Object,
			default: () => ({
				confirmationButtonText: 'OK',
				cancelButtonText: 'Cancel'
			})
		}
	});

	const emits = defineEmits(['close']);
</script>

<style lang="scss" scoped>
	.dialog-wrapper {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5000;
	}

	.dialog {
		position: relative;
		width: 480px;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
			font: var(--body-large-font);
			color: var(--on-surface);
		}

		&__actions {
			position: relative;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);
		}
	}
</style>
