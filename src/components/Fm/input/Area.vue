<template>
	<div class="base-input" :class="{ disabled }" tabindex="-1">
		<div v-if="label" class="bi_top">
			<div class="bi_label">
				{{ label }}
			</div>
		</div>

		<div class="bi_wrap" :class="{ readonly }">
			<textarea
				class="bi_area"
				:rows="calcRow"
				:cols="$attrs.cols"
				:value="modelValue"
				:disabled="disabled"
				@input="$emit('update:modelValue', $event.target.value)"
			></textarea>
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		label: String,
		auto: {
			type: Boolean,
			default: true
		},
		disabled: Boolean
	});
	defineEmits(['update:modelValue']);

	const attrs = useAttrs();

	const calcRow = computed(() => {
		if (attrs.rows) {
			return attrs.rows;
		}

		if (!props.auto) return 2;

		let lineBreaksNum = 2;

		if (typeof props.modelValue === 'string') {
			lineBreaksNum = props.modelValue.split('\n').length;
		}

		return Math.max(lineBreaksNum, 2);
	});
</script>

<style lang="scss" scoped>
	.base-input {
		position: relative;
		border-radius: 4px;

		&:focus-within:not(.disabled) {
			.bi_wrap {
				border: 1px solid #333;
			}
		}

		&:hover:not(.disabled) {
			.bi_side_items {
				display: flex;
			}
		}

		&.disabled {
			.bi_label {
				color: #e0e0e0;
				cursor: default;
			}
		}
	}

	.bi_label {
		padding: 0 3px;
		margin-bottom: 4px;
		// color: $text-lighten;
		font-size: 16px;
	}

	.bi_wrap {
		border: 1px solid #b3b3b3;
		border-radius: 4px;
		transition: border 0.3s;
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
