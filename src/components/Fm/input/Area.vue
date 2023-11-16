<template>
	<div class="base-input" tabindex="-1">
		<div class="bi_label"
			v-if="label"
			:class="{filling: modelValue}"
		>
			{{ label }}
		</div>

		<textarea
			class="bi_area"
			:rows="calcRow"
			:value="modelValue"
    	@input="$emit('update:modelValue', $event.target.value)"
		></textarea>
	</div>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		label: String,
		auto: {
			type: Boolean,
			default: true,
		}
	})
	defineEmits(['update:modelValue'])

	const calcRow = computed(() => {
		if ( !props.auto ) return 7;

		return props.modelValue.split("\n").length
	})
</script>

<style lang="scss" scoped>

.base-input {
	position: relative;
	border: 1px solid $border-darken;
	border-radius: 4px;
	margin-bottom: 25px;
	transition: border 0.3s;

	&:focus-within, &:focus {
		border: 1px solid $border-active;
		.bi_label {
			top: -8px;
			font-size: 12px;
			visibility: visible;
			opacity: 1;
		}
	}

	&:hover {
		.bi_side_items {
			display: flex;
		}
	}
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
.bi_area {
	display: block;
	border: none;
	width: 100%;
	height: 100%;
	padding: 16px;
	resize: none;
}
</style>
