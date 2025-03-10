<template>
	<label class="checkbox_label flex aic" :class="{ disabled }">
		<input
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			@change="disabled || emit('update:modelValue', !modelValue)"
		/>

		<span class="check" :class="{ disabled: disabled }">
			<FmIcon class="mark" icon="check" :disabled="disabled" />
		</span>

		<span v-if="label">{{ label }}</span>
	</label>
</template>

<script setup>
	/* eslint-disable */
	let props = defineProps({
		modelValue: Boolean,
		disabled: Boolean,
		type: String,
		label: String,
		tooltip: String
	});
	let emit = defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
	.checkbox_label:not(.disabled) {
		cursor: pointer;
	}

	.checkbox_label {
		color: var(--secondary-color);
	}

	input[type='radio'],
	input[type='checkbox'] {
		display: none;
	}

	input[type='radio']:checked + .check > .mark,
	input[type='checkbox']:checked + .check > .mark {
		opacity: 1;
	}

	input[type='checkbox']:checked + .check {
		background: var(--primary-color);
		border: none;

		&.disabled {
			background: #747474;
			color: #fff;
		}
	}

	.check {
		display: inline-block;
		position: relative;
		vertical-align: middle;
		min-width: 18px;
		height: 18px;
		background: #fff;
		border: 1px solid #b3b3b3;
		border-radius: 4px;
		margin-right: 10px;
		cursor: pointer;

		.circle {
			border-radius: 50%;
		}

		.mark {
			display: block;
			position: absolute;
			top: 1px;
			left: 1px;
			opacity: 0;
			transition: 0.3s;
			font-size: 16px;
			color: var(--base-backgroundColor);
		}

		.disabled {
			cursor: default;
		}
	}
</style>
