<template>
	<label class="base-input" tabindex="-1"
		:class="{error}"
	>
		<div class="bi_label"
			v-if="label"
			:class="{filling: modelValue}"
		>
			{{ label }}
		</div>

		<div class="bi_wrap">
			<div class="bi_button"><slot name="button"></slot></div>

			<div class="bi_default">
				<slot>
					<input
						:type="type"
						:placeholder="placeholder || label"
						:value="modelValue"
    				@input="$emit('update:modelValue', $event.target.value)"
					/>
				</slot>
			</div>

			<div class="bi_side_items flex">
				<slot name="sedeItems"></slot>
				<div class="bi_side_item" v-if="tooltip">
					<FmIcon :tooltip="tooltip" icon="info" />
				</div>
			</div>

			<div class="right_btn">
				<slot name="rightBtn"></slot>
			</div>
		</div>
		<div class="bi_error" v-if="error">{{ error.join(', ') }}</div>
	</label>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		type: String,
		label: String,
		placeholder: String,
		tooltip: String,
		error: [String, Array]
	})
	defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
	.base-input {
		position: relative;
		display: block;
		height: 42px;
		// border: 1px solid $border-darken;
		border-radius: 4px;
		margin-bottom: 25px;
		transition: border 0.3s;

		&:not(.bi_no_borders) {
			border: 1px solid $border-darken;
		}

		&:not(.bi_no_borders):focus-within, &:focus {
			border: 1px solid $border-active;
			.bi_label {
				top: -8px;
				font-size: 12px;
				visibility: visible;
				opacity: 1;
			}
		}
		&.bi_no_borders {
			margin-bottom: 0;
		}

		&:hover {
			.bi_side_items {
				display: flex;
			}
		}
		&.error {
			border-color: $primary !important;
			margin-bottom: 30px;

			.icon {
				color: $primary;
			}

			.bi_label {
				color: $primary;
			}
		}
	}
	.bi_error {
		color: $primary;
		font-size: 12px;
		padding: 5px 12px 10px;
	}
	.bi_label {
		position: absolute;
		top: 10px;
		left: 10px;
		padding: 0 3px;
		z-index: 1;
		color: $text-lighten;
		font-size: 16px;
		transition: 0.2s;
		opacity: 0;
		visibility: hidden;

		&:after {
			content: '';
			display: block;
			position: absolute;
			top: 7px;
			left: 0;
			background: $separ;
			height: 1px;
			width: 100%;
			z-index: -1;
		}
		&.filling {
			top: -8px;
			font-size: 12px;
			visibility: visible;
			opacity: 1;
		}
	}
	.bi_wrap {
		display: flex;
		align-items: center;
		height: 40px;
		width: 100%;
	}
	.bi_default {
		flex-grow: 1;
		margin-left: 13px;
		height: inherit;

		input {
			width: 100%;
			height: inherit;
		}
	}
	.bi_side_items {
		display: none;
		padding: 0 8px;
	}
	.bi_button {
		margin-left: 13px;
		color: $text-lighten;
		line-height: 0;

		&:empty {
			margin-left: 0;
		}
	}
	.right_btn {
		margin-right: 10px;
		color: $text-lighten;
	}
	.bi_side_item {
		color: $text-lighten;

		& + & {
			margin-left: 1px;
		}
	}

</style>
