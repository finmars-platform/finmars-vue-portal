<template>
	<div
		:class="[
			'icon',
			{ primary, error, btn, disabled, 'btn-primary': btnPrimary }
		]"
		:style="{ fontSize: size + 'px' }"
	>
		<slot>
			<div class="material-icons">{{ icon }}</div>
		</slot>
	</div>
</template>

<script setup>
	defineProps({
		icon: String,
		size: String,
		tooltip: String,
		primary: Boolean,
		error: Boolean,
		btn: Boolean,
		btnPrimary: Boolean,
		disabled: Boolean
	});
</script>

<style lang="scss" scoped>
	$grayIcon: #a1a1a1;
	$primary: var(--primary-color);
	$error: #f05a22;

	.icon {
		position: relative;
		display: block;
		cursor: pointer;
		transition:
			color,
			background 0.3s;
		font-size: 24px;
		line-height: 0;
		color: var(--primary-color);
		overflow: hidden;
		user-select: none;

		&:not(.disabled):hover {
			color: var(--primary-hover);
		}

		&.disabled {
			cursor: default;
		}

		&.gray-icon {
			color: $grayIcon;
		}

		&.btn-primary {
			background: $primary;
			color: var(--onPrimary-color);
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: var(--primary-hover);
				color: var(--onPrimary-color);
			}
		}

		&.primary {
			color: var(--primary-color);

			&:hover {
				color: var(--primary-hover);
			}
		}

		&.error {
			color: $error;
		}

		&.btn {
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: var(--activeState-backgroundColor);
			}
		}
	}

	.material-icons {
		font-size: inherit;
		font-weight: inherit;
	}
</style>
