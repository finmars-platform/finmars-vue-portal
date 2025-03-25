<template>
	<div class="user-code-field">
		<FmTextField
			:model-value="modelValue"
			label="User Code"
			outlined
			:disabled="disabled"
			:error="!isUserCodeValid"
			:error-messages="userCodeErrorMessage"
			@update:model-value="updateUserCode"
		>
			<template #append-inner>
				<FmTooltip location="top" type="secondary">
					<template #activator="{ props }">
						<FmIcon
							v-bind="props"
							size="20"
							icon="mdi-information-slab-circle-outline"
						/>
					</template>

					<span>
						Allowed symbols: Numbers: 0-9, Letters: a-z (lowercase)
						Special Symbols: _, - (underscore, dash). User code
						should not be empty and start with number.
					</span>
				</FmTooltip>
			</template>
		</FmTextField>
	</div>
</template>

<script setup>
	import { computed, nextTick, ref, watch } from 'vue';
	import { FmIcon, FmTextField, FmTooltip } from '@finmars/ui';
	import isEmpty from 'lodash/isEmpty';

	const props = defineProps({
		modelValue: {
			type: String
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['update:modelValue', 'update:valid']);

	const innerValue = ref(props.modelValue);

	const userCodeErrorMessage = computed(() => {
		const validationResult = validateUserCode(props.modelValue);
		return typeof validationResult === 'boolean' ? '' : validationResult;
	});
	const isUserCodeValid = computed(() => !userCodeErrorMessage.value);

	function validateUserCode(val) {
		let errorsMessage = '';

		if (!val) {
			return 'User code should not be empty.';
		}

		if (val.match(/[^1-9a-z_-]/)) {
			errorsMessage =
				'Only english letters (lowercase) and 1-9 numbers allowed for User code.';
		}

		if (val.match(/^[0-9]/)) {
			errorsMessage += `${isEmpty(errorsMessage) ? '' : ' '}User code should not start with number.`;
		}

		return errorsMessage || true;
	}

	async function updateUserCode(val) {
		await nextTick(() => {
			innerValue.value = val;
			emits('update:modelValue', val);
		});
	}

	watch(
		() => props.modelValue,
		() => {
			if (innerValue.value !== props.modelValue) {
				innerValue.value = props.modelValue;
			}
		},
		{ immediate: true }
	);

	watch(
		() => isUserCodeValid.value,
		(val, oldVal) => {
			if (val !== oldVal) {
				emits('update:valid', val);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	.user-code-field {
		position: relative;
		width: 100%;
	}
</style>
