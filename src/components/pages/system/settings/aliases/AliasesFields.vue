<template>
	<div class="fields">
		<h4 class="font-bold text-[18px] mb-[24px]">{{ title }}</h4>

		<div class="fields__content">
			<div class="relative w-[33.3%]">
				<template v-if="size(fieldsValues.text)">
					<h4 class="text-[18px] mb-[12px]">Text Fields</h4>

					<AliasesField
						v-for="field in fieldsValues.text"
						:key="field.key"
						:data="field"
						:block="block"
						@update:data="update('text', field.key, $event)"
					/>
				</template>
			</div>

			<div class="relative w-[33.3%]">
				<template v-if="size(fieldsValues.number)">
					<h4 class="text-[18px] mb-[12px]">Number Fields</h4>

					<AliasesField
						v-for="field in fieldsValues.number"
						:key="field.key"
						:data="field"
						:block="block"
						@update:data="update('number', field.key, $event)"
					/>
				</template>
			</div>

			<div class="relative w-[33.3%]">
				<template v-if="size(fieldsValues.date)">
					<h4 class="text-[18px] mb-[12px]">Date Fields</h4>

					<AliasesField
						v-for="field in fieldsValues.date"
						:key="field.key"
						:data="field"
						:block="block"
						@update:data="update('date', field.key, $event)"
					/>
				</template>
			</div>
		</div>

		<div class="fields__action">
			<FmButton rounded :disabled="!isBlockDirty || isProcessing" @click="save">
				Apply
			</FmButton>
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref, watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import isEqual from 'lodash/isEqual';
	import { FmButton } from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import useNotify from '~/composables/useNotify';
	import { DEFAULT_VALUES } from './constants';
	import AliasesField from './AliasesField.vue';

	const apiRoutes = {
		complexTransaction: 'complexTransactionUserFieldList',
		transaction: 'transactionUserFieldList',
		instrument: 'instrumentUserFieldList'
	};

	const props = defineProps({
		title: {
			type: String
		},
		block: {
			type: String,
			required: true,
			validator: (value) =>
				['complexTransaction', 'transaction', 'instrument'].includes(value)
		},
		configurationCode: {
			type: String
		}
	});
	const emits = defineEmits(['change:loading']);

	const isProcessing = ref(false);
	const isDirty = ref({
		text: false,
		number: false,
		date: false
	});

	const fieldsValues = ref({
		text: [],
		number: [],
		date: []
	});
	const initialFieldsValues = ref({
		text: [],
		number: [],
		date: []
	});

	const isBlockDirty = computed(
		() => isDirty.value.text || isDirty.value.number || isDirty.value.date
	);

	async function createField(item) {
		return useApi(`${apiRoutes[props.block]}.post`, { body: item });
	}

	async function updateField(item) {
		const { id } = item;
		if (!id) {
			throw new Error('[id] must be provided');
		}
		return useApi(`${apiRoutes[props.block]}.put`, {
			params: { id },
			body: item
		});
	}

	async function getFieldList() {
		if (!props.block || !props.configurationCode) {
			return [];
		}

		return useApi(`${apiRoutes[props.block]}.get`, {
			filters: {
				page: 1,
				page_size: 1000,
				configuration_code: props.configurationCode
			}
		});
	}

	async function getFieldsValues() {
		try {
			isProcessing.value = true;
			emits('change:loading', true);

			const data = await getFieldList();
			fieldsValues.value = {
				text: cloneDeep(DEFAULT_VALUES[props.block].TEXT_FIELDS),
				number: cloneDeep(DEFAULT_VALUES[props.block].NUMBER_FIELDS),
				date: cloneDeep(DEFAULT_VALUES[props.block].DATE_FIELDS)
			};
			Object.keys(fieldsValues.value).forEach((type) => {
				fieldsValues.value[type].forEach((item) => {
					const field = (data.results || []).find((f) => f.key === item.key);
					if (field) {
						props.block !== 'instrument' && (item.is_active = field.is_active);
						item.name = field.name;
						item.id = field.id;
					}
				});
			});
			initialFieldsValues.value = cloneDeep(fieldsValues.value);
		} catch (err) {
			console.error(
				`The error of the ${props.block} fields values loading. `,
				err
			);
		} finally {
			isProcessing.value = false;
			emits('change:loading', false);
		}
	}

	function update(subBlock, fieldKey, value) {
		const updatedFieldIndex = fieldsValues.value[subBlock].findIndex(
			(f) => f.key === fieldKey
		);
		if (updatedFieldIndex > -1) {
			fieldsValues.value[subBlock][updatedFieldIndex] = value;
			isDirty.value[subBlock] = true;
		}
	}

	async function save() {
		try {
			isProcessing.value = true;
			emits('change:loading', true);

			const promises = [];

			Object.keys(fieldsValues.value).forEach((type) => {
				fieldsValues.value[type].forEach((item, ind) => {
					if (!isEqual(initialFieldsValues.value[type][ind], item)) {
						const updatedData = {
							...item,
							configuration_code: props.configurationCode,
							user_code: `${props.configurationCode}:${item.key}`
						};

						if (item.id) {
							promises.push(updateField(updatedData));
						} else {
							promises.push(createField(updatedData));
						}
					}
				});
			});

			const result = await Promise.allSettled(promises);
			const rejectedPromiseIndex = result.findIndex(
				(p) => p.status === 'rejected'
			);

			if (rejectedPromiseIndex > -1) {
				useNotify({
					type: 'error',
					title: 'Error occurred while trying to save fields'
				});
			} else {
				useNotify({
					type: 'success',
					title: 'Changes have been saved'
				});
				isDirty.value = {
					text: false,
					number: false,
					date: false
				};
			}

			setTimeout(() => {
				getFieldsValues();
			}, 1000);
		} catch (err) {
			console.error('Error occurred while trying to save fields. ', err);
		} finally {
			isProcessing.value = false;
			emits('change:loading', false);
		}
	}

	onBeforeMount(async () => {
		await getFieldsValues();
	});

	watch(
		() => props.configurationCode,
		async (val, oldVal) => {
			if (val && val !== oldVal) {
				await getFieldsValues();
			}
		}
	);
</script>

<style lang="scss" scoped>
	.fields {
		position: relative;
		width: 100%;

		&__content {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: stretch;
		}

		&__action {
			padding: 24px 0;

			button {
				text-transform: none;
			}
		}
	}
</style>
