<template>
	<div>
		<div class="grid grid-cols-[40px_1fr_1fr_60px] gap-8 px-4 mb-2">
			<div class="text-center">Order</div>
			<div>Type</div>
			<div>Code</div>
			<div></div>
		</div>

		<draggable
			v-model="currentItemProceduresList"
			item-key="index"
			@end="updateOrderNumbers"
			:animation="200"
			ghost-class="drag-ghost"
			handle=".drag-handle"
		>
			<template #item="{ element: proc, index }">
				<div class="grid grid-cols-[40px_1fr_1fr_60px] gap-8 px-4 items-center drag-handle">
					<div class="text-center mb-2 cursor-grab">
						<span>{{index+1}}</span>
						<span class="ml-4 max-w-20">☰</span>
					</div>
					<div class="mb-2 select-wrapper">
						<FmSelect
							v-model="proc.type"
							:options="proceduresTypeOptions"
							@update:modelValue="(value) => changeOption(proc, value)"
						/>
					</div>
					<div class="mb-2 select-wrapper">
						<FmSelect
							v-model="proc.user_code"
							:options="getOptionsForRow(proc)"
							@update:modelValue="updateItem"
							:disabled="!proc.type"
						/>
					</div>
					<div class="flex justify-center mb-2">
						<FmButton type="secondary" @click="removeItem(proc)" rounded>
							Delete
						</FmButton>
					</div>
				</div>
			</template>
		</draggable>
	</div>
</template>

<script setup>
	import { FmButton, FmSelect } from '@finmars/ui';
	import draggable from 'vuedraggable';

	const props = defineProps({
		procedures: Array
	});

	const pricingProcedures = ref([]);
	const dataProcedures = ref([]);
	const expressionProcedures = ref([]);

	const currentItemProceduresList = ref([]);

	const proceduresTypeOptions = [
		{ title: 'Pricing Procedure', value: 'pricing_procedure' },
		{ title: 'Data Procedure', value: 'data_procedure' },
		{ title: 'Expression Procedure', value: 'expression_procedure' }
	];

	const emit = defineEmits(['removeItem', 'updateItem']);

	const getOptionsForRow = (proc) => {
		switch (proc.type) {
			case 'pricing_procedure': return pricingProcedures.value;
			case 'data_procedure': return dataProcedures.value;
			case 'expression_procedure': return expressionProcedures.value;
			default: return [];
		}
	};

	const removeItem = (proc) => {
		const index = currentItemProceduresList.value.indexOf(proc);
		if (index !== -1) {
			currentItemProceduresList.value.splice(index, 1);
		}
		emit('removeItem', currentItemProceduresList.value);
	};

	const changeOption = (proc, opt) => {
		proc.type = opt;
		proc.user_code = null;
	};

	const updateItem = () => {
		emit('updateItem', currentItemProceduresList.value);
	};

	const updateOrderNumbers = () => {
		currentItemProceduresList.value.forEach((proc, index) => {
			proc.order = index + 1;
		});
		emit('updateItem', currentItemProceduresList.value);
	};

	const filteredProcedures = (item) => {
		return item.map((el) => ({
			title: `${el.name} (${el.user_code})`,
			value: el.user_code
		}));
	};

	async function getPricingProcedures() {
		const res = await useApi('pricingProc.get');
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			pricingProcedures.value = filteredProcedures(res.results);
		}
	}

	async function getDataProcedures() {
		const res = await useApi('importBankProc.get');
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			dataProcedures.value = filteredProcedures(res.results);
		}
	}

	async function getExpressionProcedures() {
		const res = await useApi('expressionProcedureList.get');
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error?.details?.errors?.[0].detail?.toUpperCase() });
		} else {
			expressionProcedures.value = filteredProcedures(res.results);
		}
	}

	async function init() {
		currentItemProceduresList.value = props?.procedures;
		await getPricingProcedures();
		await getDataProcedures();
		await getExpressionProcedures();
	}

	init();
</script>

<style scoped lang="scss">
	.select-wrapper {
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: var(--spacing-8) 0;
	}

	/* Style for dragging */
	.drag-ghost {
		opacity: 0.5;
		background: #f0f0f0;
	}

	.cursor-grab {
		cursor: move;
	}
</style>
