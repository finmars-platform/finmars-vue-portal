<template>
	<div class="container">
		<h1 class="title">Layouts</h1>
		<div class="wrapp-btn">
			<FmBtn
				type="primary"
				class="btn-transaction mr-20"
				@click="complexTransactionUserFieldCreate()"
				>Dashboard Layout Manager</FmBtn
			>
			<FmBtn
				type="primary"
				class="btn-transaction"
				@click="complexTransactionUserFieldCreate()"
				>Context Menu Layout Manager</FmBtn
			>
		</div> 
		<FmInputText label="(o) Search by name"></FmInputText>

		<FmExpansionPanel title="Portfolio">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Instrument">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Responsible">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Counterparty">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Currency">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 1">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 2">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 3">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account Type">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Instrument Type">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Transaction Type">
			<span>This entity has no layouts.</span>
		</FmExpansionPanel>
	</div>
</template>


<style lang="scss" scoped>
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr;

		gap: 10px 5px;
	}
	.container {
		padding: 30px;
	}
	.title {
		margin-bottom: 24px;
		font-weight: 700;
	}
	.transaction-fields {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto auto;
		grid-template-areas:
			'title-block title-block title-block'
			'. . .';

		gap: 20px 20px;
		// .transaction-fields__block

		&__block {
		}

		// .transaction-fields__title

		&__title {
			font-weight: 700;
			font-size: 16px;
			margin: 20px 0;
		}
	}
	.complex-input {
		display: flex;
		flex-direction: column;
		// .complex-input__header

		&__header {
			display: flex;
			align-items: center;
			margin-bottom: 5px;
		}

		// .complex-input__name

		&__name {
			font-weight: 700;
			font-size: 16px;
			margin-right: 10px;
		}

		// .complex-input__lable

		&__lable {
			font-weight: 400;
			font-size: 11px;
			color: grey;
		}
		// .complex-input__body
		&__body {
			display: flex;
			align-items: center;
		}
	}
	.title {
		grid-area: title-block;
	}
	.footer {
		grid-area: footer;
	}
	.btn-transaction {
		margin-bottom: 20px;
	}

	@media (max-width: 1200px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
	@media (max-width: 767px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
</style>
