<template>
	<BaseModal title="Option settings" class="w-1/3">
		<div class="flex flex-row gap-1">
			<div class="w-full">
				<FmTextField
					v-model="selectedItem.name"
					:rules="[rules.required]"
					label="Name"
					outlined
				/>
			</div>
			<div class="w-full">
				<FmSelect
					v-model="selectedItem.action"
					:options="actions"
					label="Action"
					variant="outlined"
				/>
				<span v-if="!selectedItem.action" class="error-text">
					Field is required
				</span>
			</div>
		</div>
		<template #controls>
			<div class="flex aic sb">
				<FmButton type="secondary" @click="closeModal"> Close </FmButton>
				<FmButton
					type="primary"
					@click="confirmModal"
					:disabled="!selectedItem?.name || !selectedItem?.action"
				>
					Save
				</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { FmButton, FmSelect, FmTextField } from '@finmars/ui';
	import cloneDeep from 'lodash/cloneDeep';

	const props = defineProps({
		item: {
			type: Object,
			default() {
				return {};
			}
		},
		modalType: {
			type: String,
			default: 'create'
		}
	});

	const emit = defineEmits(['edit', 'create', 'close']);
	const actions = [
		{
			title: 'Edit Transaction',
			value: 'rebook_transaction'
		},
		{
			title: 'Duplicate Transaction',
			value: 'copy_transaction'
		},
		{
			title: 'Edit Instrument',
			value: 'edit_instrument'
		},
		{
			title: 'Edit Account',
			value: 'edit_account'
		},
		{
			title: 'Edit Portfolio',
			value: 'edit_portfolio'
		},
		{
			title: 'Edit Price',
			value: 'edit_price'
		},
		{
			title: 'Edit FX Rate',
			value: 'edit_fx_rate'
		},
		{
			title: 'Edit Pricing FX Rate',
			value: 'edit_pricing_currency_fx_rate'
		},
		{
			title: 'Edit Accrued FX Rate',
			value: 'edit_accrued_currency_fx_rate'
		},
		{
			title: 'Edit Currency',
			value: 'edit_currency'
		},
		{
			title: 'Edit Pricing Currency',
			value: 'edit_pricing_currency'
		},
		{
			title: 'Edit Accrued Currency',
			value: 'edit_accrued_currency'
		},
		{
			title: 'Open Book Manager',
			value: 'book_transaction'
		},
		{
			title: 'Book Specific Transaction Type',
			value: 'book_transaction_specific'
		},
		{
			title: 'Open Layout',
			value: 'open_layout'
		},
		{
			title: 'Mark row',
			value: 'mark_row'
		},
		{
			title: 'Add Instrument',
			value: 'add_instrument'
		},
		{
			title: 'Add Account',
			value: 'add_account'
		},
		{
			title: 'Add Currency',
			value: 'add_currency'
		},
		{
			title: 'Add Portfolio',
			value: 'add_portfolio'
		},
		{
			title: 'Add Price',
			value: 'add_price'
		},
		{
			title: 'Add FX Rate',
			value: 'add_fx_rate'
		}
	];
	const selectedItem = ref({});

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const closeModal = () => {
		emit('close');
	};

	const confirmModal = () => {
		emit(`${props.modalType}`, selectedItem.value);
	};

	function init() {
		selectedItem.value =
			props.modalType !== 'create' ? cloneDeep(props.item) : {};
	}

	init();
</script>

<style scoped lang="scss">
	.error-text {
		font-size: var(--spacing-12);
		color: var(--error-color);
		margin: var(--spacing-12);
	}
</style>
