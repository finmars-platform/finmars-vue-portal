<template>
	<div class="base-input"
			 :class="{error}"
			 tabindex="-1"

			 @click="mainInput && mainInput.focus()"
	>
		<div class="bi_top">
			<div class="top_left_border"></div>

			<div class="bi_label"
					 v-if="label"
					 :class="{filling: modelValue}"
			>
				{{ label }}
			</div>

			<div class="top_right_border"></div>
		</div>

		<div class="bi_wrap">
			<div class="bi_button"><slot name="button"></slot></div>

			<div class="bi_default">
				<slot>
					<input
						ref="mainInput"
						:type="type"
						:placeholder="placeholder || label"
						:value="modelValue"
						:readonly="readonly"

						@input="$emit('update:modelValue', $event.target.value)"
						@focus="$emit('onFocus')"
						@blur="$emit('onBlur')"

						class="bi_main_input"
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
	</div>
</template>

<script setup>
let props = defineProps({
	modelValue: [String, Number],
	type: String,
	label: String,
	placeholder: String,
	readonly: Boolean,
	tooltip: String,
	error: [String, Array]
})
defineEmits(['update:modelValue', 'onBlur', 'onFocus'])

let mainInput = ref(null);
</script>

<style lang="scss" scoped>

$input-border: 1px solid $border-darken;
$active-input-border: 1px solid $border-active;

@mixin show_label {
	top: -8px;
	width: auto;
	flex-basis: auto;
	padding: 0 3px;
	font-size: 12px;
	visibility: visible;
	opacity: 1;
}

.base-input {
	position: relative;
	display: block;
	height: 42px;
	// border: 1px solid $border-darken;
	border-radius: 4px;
	margin-bottom: 25px;
	transition: border 0.3s;
	background: $separ;

	&.small {
		height: 24px;
		font-size: 14px;
	}

	&:not(.bi_no_borders) {
		margin-top: 6px;
		border: $input-border;
		border-top-color: transparent;
	}

	&:not(.bi_no_borders):focus-within, &:not(.bi_no_borders):focus {
		border: $active-input-border;
		border-top-color: transparent;

		.bi_top {
			.top_left_border, .top_right_border {
				border-top: $active-input-border;
			}

			.bi_label {
				@include show_label;
			}
		}

	}

	&.bi_no_borders {
		margin-bottom: 0;

		.bi_top {
			display: none;
		}
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

.bi_top {
	position: absolute;
	display: flex;
	flex-direction: row;
	width: 100%;
	top: -1px;
	left: 0;
	z-index: 0;

	.top_left_border {
		flex: 0 0 10px;
		width: 10px;
		height: 5px; // makes connection with .base-input borders smoother
		border-top: $input-border;
		border-top-left-radius: 2px;
	}

	.bi_label {
		/*position: absolute;
		top: 10px;
		left: 10px;*/
		flex: 1 0 0;
		position: relative;
		top: 0;
		// padding: 0 3px;
		width: 0;
		max-width: 85%;
		z-index: 1;
		color: $text-lighten;
		font-size: 16px;
		transition: 0.2s;
		opacity: 0;
		visibility: hidden;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		/*&:after {
			content: '';
			display: block;
			position: absolute;
			top: 7px;
			left: 0;
			background: $separ;
			height: 1px;
			width: 100%;
			z-index: -1;
		}*/
		&.filling {
			@include show_label;
		}
	}

	.top_right_border {
		flex: 0 3 100%;
		height: 5px; // makes connection with .base-input borders smoother
		border-top: $input-border;
		border-top-right-radius: 2px;
	}


}

.bi_wrap {
	display: flex;
	align-items: center;
	// height: 40px;
	height: 100%;
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

	&:empty {
		padding: 0;
	}
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

	&:empty {
		margin-right: 0;
	}
}
.bi_side_item {
	color: $text-lighten;

	& + & {
		margin-left: 1px;
	}
}

</style>
