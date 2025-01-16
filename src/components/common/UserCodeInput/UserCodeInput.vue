<template>
	<div class="user-code-input">
		<template v-if="disabled">
			<FmTextField
				:model-value="userCode"
				outlined
				label="User code"
				hide-details
				disabled
			/>
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

			<FmTextField
				:model-value="userCodeEnd"
				label="User Code"
				outlined
				hide-details
				:rules="[validateUserCodeEnd]"
				:disabled="isLoading"
				@init="userCodeFieldComponent = $event?.component"
				@update:model-value="updateUserCodeEnd"
			>
				<template #append-inner>
					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIcon
								class="user-code-input__tooltip"
								v-bind="props"
								icon="mdi-information-slab-circle-outline"
							/>
						</template>

						<span>
							Allowed symbols: Numbers: 0-9, Letters: a-z (lowercase) Special
							Symbols: _, - (underscore, dash)
						</span>
					</FmTooltip>
				</template>
			</FmTextField>

			<div class="user-code-input__result">
				<i>Result: </i> {{ editedUserCode }}
			</div>
		</div>
	</div>
</template>

<script setup>
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

	const {
		userCodeFieldComponent,
		isLoading,
		editedUserCode,
		userCodeEnd,
		configurationCodes,
		configurationCode,
		validateUserCodeEnd,
		updateUserCodeEnd,
		updateConfigurationCode
	} = useUserCodeInput(props, emits);
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

		&__tooltip {
			cursor: pointer;
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
		}
	}
</style>
