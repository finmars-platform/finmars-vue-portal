<template>
	<label class="flex aic">
		<input
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			@change="disabled || emit('update:modelValue', !modelValue)"
		/>
		<span class="check" :class="{ disabled: disabled }">
			<FmIcon class="mark" icon="check" :disabled="disabled" />
		</span>

		<div v-if="label">{{ label }}</div>
	</label>
</template>

<script setup>
	let props = defineProps({
		modelValue: Boolean,
		disabled: Boolean,
		type: String,
		label: String,
		tooltip: String,
	})
	let emit = defineEmits({
		'update:modelValue': (value) => true,
	})
</script>

<style lang="scss" scoped>
	input[type='radio'],
	input[type='checkbox'] {
		display: none;
	}
	input[type='radio']:checked + .check > .mark,
	input[type='checkbox']:checked + .check > .mark {
		opacity: 1;
	}
	input[type='checkbox']:checked + .check {
		background: $primary;
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
		min-width: 20px;
		height: 20px;
		background: #fff;
		border: 1px solid $border-darken;
		margin-right: 10px;
		cursor: pointer;
		.circle {
			border-radius: 50%;
		}
		.mark {
			display: block;
			position: absolute;
			top: 2px;
			left: 2px;
			opacity: 0;
			transition: 0.3s;
			font-size: 16px;
			color: $separ;
		}
		.disabled {
			cursor: default;
		}
	}
</style>
