<template>
	<button
		:class="['fm_btn', { icon }, type]"
		@click="to ? $router.push(to) : href ? goToHref() : ''"
	>
		<div v-if="icon" :class="`icon material-icons`">{{ icon }}</div>
		<slot />
	</button>
</template>

<script setup>
	const props = defineProps({
		label: String,
		icon: String,
		to: String,
		href: String,
		/**
		 * Type of button
		 * @values primary, outlined, basic, text, action, icon
		 */
		type: {
			type: String,
			default: 'primary'
		}
	});

	function goToHref() {
		window.location.href = props.href;
	}
</script>

<style lang="scss" scoped>
	$height: 36px;
	$primary-lighten: #f69470;
	$primary-lighten-2: rgb(240 90 34 / 12%);
	$text-lighten: #747474;

	.fm_btn {
		height: $height;
		line-height: $height;
		padding: 0 16px;
		min-width: 64px;
		//border-radius: 4px;
		border-radius: 100px;
		text-transform: capitalize;
		font-weight: 500;
		font-size: 14px;
		letter-spacing: 0.4px;
		transition: 0.3s;
		user-select: none;

		&.basic {
			color: var(--primary-color);

			&:not([disabled]):hover {
				background: var(--primary-hover);
			}
		}

		&.primary {
			background: var(--primary-color);
			color: var(--base-backgroundColor);

			&:not([disabled]):hover {
				background: var(--primary-hover);
			}
		}

		&.outlined {
			font-weight: 700;
			border-radius: 3px;
			border: 1px solid #b3b3b3;;
			color: var(--primary-color);

			&:not([disabled]):hover {
				background-color: var(--primary-hover);
			}
		}

		/*&.plain {
			padding: 0;
			background: transparent !important;
			height: auto;
			line-height: 1.5;
			&:not([disabled]):hover {
				color: $text;
			}
		}*/

		&.text {
			color: var(--secondary-color);

			&:not([disabled]):hover {
				background: var(--activeState-backgroundColor);
			}

			&:not([disabled]).active {
				background: var(--activeState-backgroundColor);
			}
		}

		&.action {
			color: var(--primary-color);

			.icon {
				color: var(--primary-color) !important;
			}

			&:not([disabled]):hover {
				background: $primary-lighten-2;
			}
		}

		&.icon {
			padding: 0;
			min-width: 0;
			height: auto;

			&.primaryIcon {
				color: var(--primary-color);

				.icon {
					color: var(--primary-color);
				}
			}
		}

		&[disabled] {
			cursor: default;
			opacity: 0.6;

			&.primary {
				background: $primary-lighten;
				opacity: 1;
			}
		}
	}

	.fm_btn.icon {
		display: flex;
		align-items: center;

		.icon {
			color: $text-lighten;
		}

		&:not(.icon) .icon {
			margin-right: 7px;
		}
	}
</style>
