<template>
	<div class="simple-tab-scheme">
		<div class="simple-tab-scheme__row">
			<div class="simple-tab-scheme__col simple-tab-scheme__col-1">
				<div class="simple-tab-scheme__col-row">
					<div class="simple-tab-scheme__block simple-tab-scheme__calculated">
						<div class="simple-tab-scheme__block-label">Calculated Columns</div>

						<div class="simple-tab-scheme__block-body">
							<SimpleTabSchemeCalculated
								:scheme="scheme"
								:loading="loading"
								@update:valid="isBlockValid.calculated_inputs = $event"
								@update:block="updateBlock('calculated_inputs', $event)"
							/>
						</div>
					</div>
				</div>

				<div class="simple-tab-scheme__col-row">
					<div class="simple-tab-scheme__block simple-tab-scheme__imported">
						<div class="simple-tab-scheme__block-label">Imported Columns</div>

						<div class="simple-tab-scheme__block-body">2</div>
					</div>
				</div>
			</div>

			<div class="simple-tab-scheme__col simple-tab-scheme__col-2">
				<div class="simple-tab-scheme__block simple-tab-scheme__matching">
					<div class="simple-tab-scheme__block-label">Data matching</div>

					<div class="simple-tab-scheme__block-body">3</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import SimpleTabSchemeCalculated from './SimpleTabSchemeCalculated.vue';

	const props = defineProps({
		scheme: {
			type: Object
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:scheme', 'update:valid']);

	const isBlockValid = ref({
		calculated_inputs: true,
		csv_fields: true,
		entity_fields: true
	});

	const isTabValid = computed(
		() =>
			isBlockValid.value.calculated_inputs &&
			isBlockValid.value.csv_fields &&
			isBlockValid.value.entity_fields
	);

	function updateBlock(block, value) {
		const updateScheme = cloneDeep(props.scheme);
		updateScheme[block] = value;
		emits('update:scheme', updateScheme);
	}

	watch(
		() => isTabValid.value,
		(val, oVal) => {
			if (oVal !== val) {
				emits('update:valid', val);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	.simple-tab-scheme {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;
		color: var(--on-surface);

		&__row {
			position: relative;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			column-gap: 16px;
		}

		&__col {
			position: relative;
			height: 100%;

			&-1 {
				width: 60%;
				display: flex;
				flex-direction: column;
				row-gap: 16px;
				justify-content: space-between;
				align-items: flex-start;
			}

			&-2 {
				width: 40%;
			}

			&-row {
				position: relative;
				width: 100%;
				height: 50%;
				flex-grow: 1;
			}
		}

		&__block {
			position: relative;
			width: 100%;
			height: 100%;
			padding-top: 5px;

			&-label {
				position: absolute;
				left: 12px;
				top: -4px;
				font-size: 12px;
				font-weight: 400;
				line-height: 18px;
				color: var(--on-surface-variant);
				background-color: var(--surface);
				padding: 0 4px;
				z-index: 1;
			}

			&-body {
				position: relative;
				width: 100%;
				height: 100%;
				padding: 8px;
				border-radius: 8px;
				border: 1px solid var(--outline-variant);
				overflow-y: auto;
			}
		}
	}
</style>
