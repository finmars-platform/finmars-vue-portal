<template>
	<div class="user-code-input">
		<template v-if="disabled">
			<FmTextField :model-value="userCode" outlined label="User code" hide-details disabled />
		</template>

		<div v-else class="user-code-input__row">
			<div class="user-code-input__cell">
				<FmSelect
					variant="outlined"
					label="Configuration"
					:options="configurationCodes"
					:model-value="configurationCode"
					:disabled="isLoading"
					@update:model-value="updateConfigurationCode"
				/>
			</div>

			<div class="user-code-input__cell">
				<FmTextField
					class="user-code-input__value"
					:model-value="userCodeEnd"
					label="User Code"
					autofocus
					outlined
					hide-details
					:disabled="isLoading"
					:error="!!userCodeEndErrorMessage"
					:error-messages="userCodeEndErrorMessage"
					@update:model-value="updateUserCodeEnd"
				>
					<template #append-inner>
						<span />
					</template>
				</FmTextField>

				<FmTooltip location="top" type="secondary">
					<template #activator="{ props }">
						<FmIcon
							class="user-code-input__tooltip"
							v-bind="props"
							size="20"
							icon="mdi-information-slab-circle-outline"
						/>
					</template>

					<span>
						Allowed symbols: Numbers: 0-9, Letters: a-z (lowercase) Special Symbols: _, -
						(underscore, dash). User code should not be empty and start with number.
					</span>
				</FmTooltip>
			</div>

			<div v-if="isEmpty(userCodeEndErrorMessage)" class="user-code-input__result">
				<i>Result: </i> {{ editedUserCode }}
			</div>

			<div v-else :class="['user-code-input__result', 'user-code-input__result--error']">
				{{ userCodeEndErrorMessage }}
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import { FmIcon, FmSelect, FmTextField, FmTooltip } from '@finmars/ui';
	import useUserCodeInput from './useUserCodeInput';

	const props = defineProps({
		/*
		'item' is {
				configuration_code: string;
				content_type: string;
				user_code: string; // `${configuration_code}:${content_type}:${user_code_editable_string}`
			}
		 */
		item: {
			type: Object
		},
		contentType: {
			type: String
		},
		userCode: {
			type: String
		},
		error: {
			type: String
		},
		occupiedUserCodes: {
			type: Array
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits([
		'update:userCode',
		'update:item',
		'update:configurationCode',
		'update:valid'
	]);

	const propsValue = computed(() => props);

	const {
		isLoading,
		editedUserCode,
		userCodeEnd,
		userCodeEndErrorMessage,
		configurationCodes,
		configurationCode,
		updateUserCodeEnd,
		updateConfigurationCode
	} = useUserCodeInput(propsValue, emits);
</script>

<style lang="scss" scoped>
	.user-code-input {
		position: relative;
		width: 100%;

		&__row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 16px;
			padding-bottom: 22px;
		}

		&__cell {
			position: relative;
		}

		&__value {
			:deep(.v-field) {
				padding-inline-end: 30px;
			}
		}

		&__tooltip {
			position: absolute;
			cursor: pointer;
			top: 18px;
			right: 6px;
			z-index: 1;
		}

		&__result {
			position: absolute;
			bottom: 0;
			font-size: 14px;
			font-weight: 500;
			color: var(--primary);

			i {
				color: var(--on-surface);
			}

			&--error {
				i {
					color: var(--error);
				}
			}
		}
	}
</style>
