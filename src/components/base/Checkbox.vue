<template>
	<label class="flex aic">
		<input type="checkbox"
			:checked="modelValue"
    	@change="emit('update:modelValue', !modelValue)"
		/>
		<span class="check"><FmIcon class="mark" icon="check" /></span>

		<div v-if="label">{{ label }}</div>
	</label>
</template>

<script setup>
	let props = defineProps({
		modelValue: Boolean,
		type: String,
		label: String,
		tooltip: String,
	})
	let emit = defineEmits({
		'update:modelValue': value => true,
	})
</script>

<style lang="scss" scoped>

input[type="radio"],
input[type="checkbox"] {
	display: none;
}
input[type="radio"]:checked + .check > .mark,
input[type="checkbox"]:checked + .check > .mark  {
	opacity: 1;
}

input[type="checkbox"]:checked + .check {
	background: $primary;
	border: none;
}
.check {
	display: inline-block;
	position: relative;
	vertical-align: middle;
	min-width: 20px;
	height: 20px;
	background: none;
	border: 1px solid $border-darken;
	border-radius: 50%;
	margin-right: 10px;
	cursor: pointer;
	.mark {
		display: block;
		position: absolute;
		top: 2px;
		left: 2px;
		opacity: 0;
		transition: .3s;
		font-size: 16px;
		color: $separ;
	}
}
</style>
