<template>

	<BaseUnifiedDataSelect
		v-bind="$attrs"
		:modelValue="selItem"
		:processing="processing"
		:importingEntity="importingEntity"
		:databaseItems="databaseItems"
		:databaseItemsTotal="databaseItemsTotal"
		:localItems="localItems"
		:localItemsTotal="localItemsTotal"
		:disabled="disabled || importingEntity"
		@update:modelValue="selectItem"
		@update:errorData="newVal => emit('update:errorData', newVal)"
		@loadItems="getList"
		@openModal="modalIsOpened = true"
	/>

	<FmUnifiedDataSelectModal
		:content_type="content_type"
		:selectedItem="selItem"
		:propId="propId"
		v-model:opened="modalIsOpened"
		@localItemSelected="applyItem"
		@databaseItemSelected="selectDatabaseItemModal"
	/>
</template>

<script setup>
	import * as commonMethods from "./helper"

	let props = defineProps({
		modelValue: [String, Number],
		propId: {
			type: String,
			default: 'id',
		},
		selectedItemName: {
			type: String,
			default: '',
		},
		/** Object with data of selected entity **/
		// itemObject: Object,
		content_type: String,
	});

	let emit = defineEmits([
		"update:modelValue",
		"update:errorData",
		"itemSelected",
	])

	let disabled = ref(false);
	let processing = ref(false);
	let importingEntity = ref(false);

	let modalIsOpened = ref(false)
	let menuIsOpened = ref(false)

	let localItemsTotal = ref(0)
	let databaseItemsTotal = ref(0)
	let databaseItems = ref([])
	let localItems = ref([])

	let selItem = ref({name: ""});

	let inputText = ref(selItem.value.name || "");

	let taskIntervalId;
	let intervalTime = 5000;

	watch(
		() => [props.modelValue, props.selectedItemName],
		() => {

			if (props.modelValue) {

				selItem.value = {
					[props.propId]: props.modelValue,
					name: props.selectedItemName,
				};

			} else {

				selItem.value = {name: ''};

			}

		}
	)

	function selectDatabaseItemModal(data) {

		setInputStates(true);

		const currentName = selItem.value.name;

		selItem.value = {
			id: data.id,
			user_code: data.user_code,
			name: data.name,
		}

		taskIntervalId = importItemI(data.task, currentName);

	}

	function setInputStates(state) {
		disabled.value = state;
		processing.value = state;
		importingEntity.value = state;
	}
	function onImportError (errorMessage) {

		clearInterval(taskIntervalId);

		useNotify( {type: 'error', title: errorMessage} );

		setInputStates(false);

	}

	/**
	 * @param {Object} resultData - value of importTaskResponse.result_object
	 * @param {Number} resultData.result_id - id of imported entity
	 * @param {String} resultData.name
	 * @param {String} resultData.short_name
	 * @param {String} resultData.user_code
	 **/
	function applyDbItem(resultData) {

		const prop = props.propId === 'id' ? 'result_id' : props.propId;

		selItem.value = {
			id: resultData.result_id,
			name: resultData.name,
			user_code: resultData.user_code,
		};

		emit( "update:modelValue", resultData[prop] );
		emit( "itemSelected", JSON.parse(JSON.stringify(selItem.value)) );

	}

	/** Select item after task for import of item finishes its work */
	function importItemI(taskId, currentlySelItem) {

		return setInterval(async () => {

			const taskRes = await useApi(
				"task.get",
				{
					params: {id: taskId}
				}
			);

			if ( Object.keys(taskRes).length === 1 && taskRes.error ) {

				clearInterval(taskIntervalId);

				selItem.value = currentlySelItem;

				setInputStates(false);

				throw taskRes.error;

			}
			else {

				const resultData = taskRes.result_object;
				let tasksMessagesData = {
					'T': 'Import timed out',
					'C': 'Import aborted',
					'E': taskRes.error,
				}

				if (taskRes.status === 'D') { // import DONE

					setInputStates(false);
					applyDbItem(resultData);

					useNotify( {type: 'success', title: `${ entitiesDataList[props.content_type] } has been loaded` } );

					clearInterval(taskIntervalId);

				} else if ( tasksMessagesData.hasOwnProperty(taskRes.status) ) {

					selItem.value = currentlySelItem;
					applyDbItem(resultData);

					onImportError( tasksMessagesData[taskRes.error] );

				}

			}

		}, intervalTime);

	}

	async function selDatabaseItem(item) {

		let res;
		const currentlySelItem = JSON.parse(JSON.stringify(selItem.value));

		selItem.value = {
			id: item.id,
			user_code: item.user_code,
			name: item.name,
		}

		setInputStates(true);

		res = await commonMethods.startImport(props.content_type, item);

		if ( Object.keys(res).length === 1 && res._$error ) {

			setInputStates(false);

		}
		else if (res.errors) {

			onImportError( res.errors );

		}
		else {

			taskIntervalId = importItemI(res.task, currentlySelItem);

		}

	}

	function applyItem(item) {

		selItem.value = structuredClone(item);
		delete item.frontOptions;

		emit( "update:modelValue", item[props.propId] );
		emit("itemSelected", item);

	}

	async function selectItem(newVal) {

		if (!newVal) return;

		let item;

		if (newVal.frontOptions.type === 'database') {
			item = await selDatabaseItem(newVal);

		} else {
			item = newVal;
		}

		applyItem(item);

	}

	const entitiesDataList = [
		{
			name: "Dashboard",
			entity: "dashboard",
			key: "ui.dashboard",
		},
		{
			name: "Account Type",
			entity: "account-type",
			key: "accounts.accounttype",
		},
		{
			name: "Account",
			entity: "account",
			key: "accounts.account",
		},
		{
			name: "Counterparty",
			entity: "counterparty",
			key: "counterparties.counterparty",
		},
		{
			name: "Responsible",
			entity: "responsible",
			key: "counterparties.responsible",
		},
		{
			name: "Currency",
			entity: "currency",
			key: "currencies.currency",
		},
		{
			name: "Currency history",
			entity: "currency-history",
			key: "currencies.currencyhistory",
		},
		{
			name: "Instrument",
			entity: "instrument",
			key: "instruments.instrument",
		},
		{
			name: "Generated Event",
			entity: "generated-event",
			key: "instruments.generatedevent",
		},
		{
			name: "Pricing Policy",
			entity: "pricing-policy",
			key: "instruments.pricingpolicy",
		},
		{
			name: "Price History",
			entity: "price-history",
			key: "instruments.pricehistory",
		},
		{
			name: "Portfolio",
			entity: "portfolio",
			key: "portfolios.portfolio",
		},
		{
			name: "Portfolio Register",
			entity: "portfolio-register",
			key: "portfolios.portfolioregister",
		},
		{
			name: "Portfolio Register Record",
			entity: "portfolio-register-record",
			key: "portfolios.portfolioregisterrecord",
		},
		{
			name: "Instrument Type",
			entity: "instrument-type",
			key: "instruments.instrumenttype",
		},
		{
			name: "Transaction",
			entity: "transaction",
			key: "transactions.transaction",
		},
		{
			name: "Transaction Type",
			entity: "transaction-type",
			key: "transactions.transactiontype",
		},
		{
			name: "Transaction Type Group",
			entity: "transaction-type-group",
			key: "transactions.transactiontypegroup",
		},
		{
			name: "Counterparty group",
			entity: "counterparty-group",
			key: "counterparties.counterpartygroup",
		},
		{
			name: "Responsible group",
			entity: "responsible-group",
			key: "counterparties.responsiblegroup",
		},
		{
			name: "Strategy 1",
			entity: "strategy-1",
			key: "strategies.strategy1",
		},
		{
			name: "Strategy 2",
			entity: "strategy-2",
			key: "strategies.strategy2",
		},
		{
			name: "Strategy 3",
			entity: "strategy-3",
			key: "strategies.strategy3",
		},
		{
			name: "Strategy 1 group",
			entity: "strategy-1-group",
			key: "strategies.strategy1group",
		},
		{
			name: "Strategy 2 group",
			entity: "strategy-2-group",
			key: "strategies.strategy2group",
		},
		{
			name: "Strategy 3 group",
			entity: "strategy-3-group",
			key: "strategies.strategy3group",
		},
		{
			name: "Strategy 1 subgroup",
			entity: "strategy-1-subgroup",
			key: "strategies.strategy1subgroup",
		},
		{
			name: "Strategy 2 subgroup",
			entity: "strategy-2-subgroup",
			key: "strategies.strategy1subgroup",
		},
		{
			name: "Strategy 3 subgroup",
			entity: "strategy-3-subgroup",
			key: "strategies.strategy1subgroup",
		},
		{
			name: "Balance report",
			entity: "balance-report",
			key: "reports.balancereport",
		},
		{
			name: "P&L report",
			entity: "pl-report",
			key: "reports.plreport",
		},
		{
			name: "Transaction report",
			entity: "transaction-report",
			key: "reports.transactionreport",
		},
		{
			name: "Cash flow projection report",
			entity: "cash-flow-projection-report",
			key: "reports.cashflowreport",
		},
		{
			name: "Performance report",
			entity: "performance-report",
			key: "reports.performancereport",
		},
		{
			name: "Transaction",
			entity: "complex-transaction",
			key: "transactions.complextransaction",
		},
		{
			name: "Balance Report Custom Field",
			entity: "balance-report-custom-field",
			key: "reports.balancereportcustomfield",
		},
		{
			name: "PL Report Custom Field",
			entity: "pl-report-custom-field",
			key: "reports.plreportcustomfield",
		},
		{
			name: "Transaction Report Custom Field",
			entity: "transaction-report-custom-field",
			key: "reports.transactionreportcustomfield",
		},
		{
			name: "Price History Error",
			entity: "price-history-error",
			key: "pricing.pricehistoryerror",
		},
		{
			name: "Currency History Error",
			entity: "currency-history-error",
			key: "pricing.currencyhistoryerror",
		},
		{
			name: "Audit transaction",
			entity: "audit-transaction",
			key: "audit.objecthistory4entry",
		},

		{
			name: "Audit instrument",
			entity: "audit-instrument",
			key: "audit.objecthistory4entry",
		},
	]

	async function getList(filterText) {

		processing.value = true;

		const res = await commonMethods.getList(props.content_type, filterText);

		databaseItems.value = res.databaseData.items;
		databaseItemsTotal.value = res.databaseData.itemsTotal;
		localItems.value = res.localData.items;
		localItemsTotal.value = res.localData.itemsTotal;

		processing.value = false;

	}

	if (props.modelValue) {

		const selObj = {
			name: props.selectedItemName,
		};

		selObj[props.propId] = props.modelValue;

		selItem.value = selObj;

	}

</script>

<style lang="scss" scoped></style>
