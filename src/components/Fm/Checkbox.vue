<template>
	<label
		class="checkbox_label flex aic"
		:class="{
			disabled,
			'partially_checked': partiallyChecked,
		}"
	>
		<input
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			@change="disabled || emit('update:modelValue', !modelValue)"
		/>

		<span class="check" :class="{ disabled: disabled }">
			<FmIcon
				v-show="!partiallyChecked"
				class="mark"
				icon="check"
				:disabled="disabled"
			/>

			<div v-show="partiallyChecked" class="part_checked_mark"></div>
		</span>

		<span v-if="label">{{ label }}</span>
	</label>
</template>

<script setup>
	let props = defineProps({
		modelValue: Boolean,
		disabled: Boolean,
		label: String,
		tooltip: String,
		// e.g. when some but not all children checkboxes are checked
		partiallyChecked: Boolean,
	})

	let emit = defineEmits({
		'update:modelValue': (value) => true,
	})
</script>

<style lang="scss" scoped>

$check-size: 16px;
$part-check-size: $check-size - 6px;

.checkbox_label:not(.disabled) {
	cursor: pointer;
}

.checkbox_label.disabled {
	cursor: default;
}

input {
	display: none;
}

input:checked + .check > .mark {
	opacity: 1;
}
input:checked + .check {
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
	min-width: 18px;
	height: 18px;
	background: #fff;
	border: 1px solid $border-darken;
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
		font-size: $check-size;
		color: $separ;
	}
	.disabled {
		cursor: default;
	}
}
.part_checked_mark {
	position: absolute;
	top: 50%;
	left: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
	background: $primary;
	width: $part-check-size;
	height: $part-check-size;
	border: none;
	border-radius: 4px;
}

</style>
