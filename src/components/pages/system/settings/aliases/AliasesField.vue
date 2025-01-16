<template>
	<div class="field">
		<div class="field__title">
			<b>{{ data.key }}</b>

			<span v-if="!data.id" class="field__info"> Not created yet </span>
		</div>

		<div class="field__content">
			<FmTooltip type="secondary" location="top">
				<template #activator="{ props }">
					<FmCheckbox
						v-if="block !== 'instrument'"
						v-bind="props"
						:model-value="data.is_active"
						@update:model-value="update('is_active', $event)"
					/>
				</template>

				<span>Check to show the Field in the Transaction Layouts</span>
			</FmTooltip>

			<FmTextField
				:model-value="data.name"
				compact
				hide-details
				@update:model-value="update('name', $event)"
			/>
		</div>
	</div>
</template>

<script setup>
	import cloneDeep from 'lodash/cloneDeep';
	import { FmCheckbox, FmTextField, FmTooltip } from '@finmars/ui';

	const props = defineProps({
		data: {
			type: Object,
			required: true
		},
		block: {
			type: String,
			required: true,
			validator: (value) =>
				['complexTransaction', 'transaction', 'instrument'].includes(value)
		}
	});

	const emits = defineEmits(['update:data']);

	function update(key, value) {
		const updatedField = cloneDeep(props.data);
		updatedField[key] = value;
		emits('update:data', updatedField);
	}
</script>

<style lang="scss" scoped>
	.field {
		position: relative;
		width: 100%;
		max-width: 280px;
		margin-bottom: 8px;
		display: flex;
		flex-direction: column;

		&__title {
			position: relative;
			height: 24px;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 6px;
		}

		&__info {
			font: var(--label-small-font);
			color: var(--outline);
		}

		&__content {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;

			:deep(.fm-text-field) {
				--backgroundColor-fmTextField: transparent;
			}
		}
	}
</style>
