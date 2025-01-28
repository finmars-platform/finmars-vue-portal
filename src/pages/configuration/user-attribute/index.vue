<template>
	<section class="user-attributes-page">
		<h3 class="font-bold text-[18px] mb-[24px]">User Attributes</h3>

		<UserAttributesBlock
			v-for="block in attributeBlocks"
			:key="block.key"
			:block="block"
		/>
	</section>
</template>

<script setup>
	import UserAttributesBlock from '~/components/pages/configuration/user-attribute/UserAttributesBlock.vue';

	const attributeBlocks = [
		{
			key: 'portfolio',
			title: 'Portfolio Attributes',
			apiRoute: 'portfolioAttrTypeList'
		},
		{
			key: 'account',
			title: 'Account Attributes',
			apiRoute: 'accountAttrTypeList'
		},
		{
			key: 'instrument',
			title: 'Instruments Attributes',
			apiRoute: 'instrumentAttrTypeList'
		},
		{
			key: 'responsible',
			title: 'Responsible Attributes',
			apiRoute: 'responsibleAttrTypeList'
		},
		{
			key: 'counterparty',
			title: 'Counterparty Attributes',
			apiRoute: 'counterpartyAttrTypeList'
		},
		{
			key: 'currency',
			title: 'Currency Attributes',
			apiRoute: 'currencyAttrTypeList'
		},
		{
			key: 'strategy1',
			title: 'Strategy 1 Attributes',
			apiRoute: 'strategy1AttrTypeList'
		},
		{
			key: 'strategy2',
			title: 'Strategy 2 Attributes',
			apiRoute: 'strategy2AttrTypeList'
		},
		{
			key: 'strategy3',
			title: 'Strategy 3 Attributes',
			apiRoute: 'strategy3AttrTypeList'
		},
		{
			key: 'account-type',
			title: 'Account Type Attributes',
			apiRoute: 'accountTypeAttrTypeList'
		},
		{
			key: 'instrument-type',
			title: 'Instrument Type Attributes',
			apiRoute: 'instrumentTypeAttrTypeList'
		},
		{
			key: 'transaction-type',
			title: 'Transaction Type Attributes',
			apiRoute: 'transactionTypeAttrTypeList'
		}
	];
</script>

<style lang="scss" scoped>
	.user-attributes-page {
		--user-attributes-page-loader-bg: rgba(0, 0, 0, 0.05);

		position: relative;
		width: 100%;
		color: var(--on-surface);
		padding: 24px;
	}
</style>
