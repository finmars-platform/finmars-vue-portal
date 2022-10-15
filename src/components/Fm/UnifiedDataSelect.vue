<template>

	<FmMenu :opened="menuIsOpened"
					:openOn="false"
					attach="body"
					class="width-100">

		<template #btn>
			<BaseInput :label="label"
								 v-model="inputText"
								 :error="error"
								 :class="{active: menuIsOpened, 'bi_no_borders': noBorders}"

								 @update:modelValue="onFilterInputChange"
								 @onFocus="onFilterInputFocus">

				<template v-if="!noBorders && !noIndicatorButton" #button>
					<FmIcon icon="menu" />
				</template>

				<template #rightBtn>
					<slot name="rightBtn" />
					<FmIcon :icon="menuIsOpened ? 'arrow_drop_up' : 'arrow_drop_down'" />
				</template>
			</BaseInput>
		</template>

		<div class="sel_menu_block">

			<div v-if="!processing" style="height: 369px; overflow-y: auto">

				<div v-if="localItems.length" class="text-bold opts_group_title">Local Records ({{localItemsTotal}})</div>

				<div v-if="localItems.length">

					<div v-for="option in localItems"
							 :key="option.user_code"
							 @click="selectLocalItem(option)"
							 class="sel_option">

						<div v-html="getHighlighted(option.name)"></div>

						<div v-html="getHighlighted(option.user_code)"></div>

					</div>

				</div>

				<div v-if="databaseItems.length"
						 class="text-bold opts_group_title"
						 style="bottom: 0;" >Global Records ({{databaseItemsTotal}})</div>

				<div v-if="databaseItems.length">

					<div v-for="option in databaseItems"
							 :key="content_type === 'currencies.currency' ? option.code : option.user_code"
							 @click="selectDatabaseItem(option)"
							 class="sel_option">

						<div v-html="getHighlighted(option.name)"></div>

						<div v-if="content_type !== 'currencies.currency'"
								 v-html="getHighlighted(option.user_code)"></div>

						<div v-if="content_type === 'currencies.currency'"
								 v-html="getHighlighted(option.code)"></div>


					</div>

				</div>

				<div v-if="noItemsFound">
					<span class="text-bold opts_group_title">Not records found</span>
				</div>

			</div>

			<div v-if="processing" class="flex-row fc-center">
				<FmLoader />
			</div>

		</div>

	</FmMenu>
</template>

<script setup>
let props = defineProps({
	label: String,
	modelValue: [String, Number],
	selectedOptionsName: String,
	/** Object with data of selected entity **/
	itemObject: Object,
	content_type: String,
	noBorders: Boolean,
	noIndicatorButton: Boolean,
	notNull: Boolean,
})

let emit = defineEmits(['update:modelValue', 'update:itemObject'])

let disabled = ref(false);
let processing = ref(false);

let error = ref('');
let menuIsOpened = ref(false);

let localItemsTotal = ref(0);
let databaseItemsTotal = ref(0);
let databaseItems = ref([]);
let localItems = ref([]);
let noItemsFound = computed(() => !localItems.value.length && !databaseItems.value.length);

/*let selItem = reactive({
	type: null,
	data: {
		name: ''
	}
});*/
let selItem = ref(props.itemObject || {name: ''});

let valueIsValid = ref(false);
let inputText = ref(selItem.value.name || '');

function getHighlighted (value) {

	var inputTextPieces = inputText.value.split(' ')

	var resultValue;

	// Case-insensitive regular expression for highlighting multiple parts inside results
	var reg = new RegExp("(?![^<]+>)(" + inputTextPieces.join("|") + ")", "ig");

	resultValue = value.replace(reg, '<span class="highlight">$1</span>');

	return resultValue

}

function closeMenu() {

	menuIsOpened.value = false;

	if (selItem.value.name) inputText.value = selItem.value.value;

}

function selectLocalItem(item) {

	closeMenu();

	if (item.id === props.modelValue) return;

	error.value = '';
	selItem.value = item;

	emit('update:modelValue', item.id);
	emit('update:itemObject', item);

	valueIsValid.value = true;
	inputText.value = item.short_name;

}

const onLoadItemError = function (error) {

	useNotify({
		type: 'error',
		title: 'Error',
		text: error
	});

	emit('update:modelValue', null);

	selItem.value = {name: ''};

};

async function loadItemsFromCbonds(item) {

	const config = {
		body: {
			currency_code: item.code,
			mode: 1
		}
	};

	let res = await useApi('importCurrencyCbonds.post', config);

	if (res.errors.length) {

		onLoadItemError(res.errors[0]);

	} else if (res.error) {

		onLoadItemError(res.error.message);

	} else {

		emit('update:modelValue', res.result_id);
		emit('update:itemObject', {id: res.result_id, name: item.name, user_code: item.code});

		valueIsValid.value = true;

	}

	disabled.value = false;
	processing.value = false;

}

const entitiesDataList = [
	{
		name: "Dashboard",
		entity: 'dashboard',
		key: "ui.dashboard"
	},
	{
		name: "Account Type",
		entity: 'account-type',
		key: "accounts.accounttype"
	},
	{
		name: "Account",
		entity: 'account',
		key: "accounts.account"
	},
	{
		name: "Counterparty",
		entity: 'counterparty',
		key: "counterparties.counterparty"
	},
	{
		name: "Responsible",
		entity: 'responsible',
		key: "counterparties.responsible"
	},
	{
		name: "Currency",
		entity: 'currency',
		key: "currencies.currency"
	},
	{
		name: "Currency history",
		entity: 'currency-history',
		key: "currencies.currencyhistory"
	},
	{
		name: "Instrument",
		entity: 'instrument',
		key: "instruments.instrument"
	},
	{
		name: "Generated Event",
		entity: 'generated-event',
		key: "instruments.generatedevent"
	},
	{
		name: 'Pricing Policy',
		entity: 'pricing-policy',
		key: 'instruments.pricingpolicy'
	},
	{
		name: 'Price History',
		entity: 'price-history',
		key: 'instruments.pricehistory'
	},
	{
		name: "Portfolio",
		entity: 'portfolio',
		key: "portfolios.portfolio"
	},
	{
		name: "Portfolio Register",
		entity: 'portfolio-register',
		key: "portfolios.portfolioregister"
	},
	{
		name: "Portfolio Register Record",
		entity: 'portfolio-register-record',
		key: "portfolios.portfolioregisterrecord"
	},
	{
		name: "Instrument Type",
		entity: 'instrument-type',
		key: "instruments.instrumenttype"
	},
	{
		name: "Transaction",
		entity: 'transaction',
		key: "transactions.transaction"
	},
	{
		name: "Transaction Type",
		entity: 'transaction-type',
		key: "transactions.transactiontype"
	},
	{
		name: "Transaction Type Group",
		entity: 'transaction-type-group',
		key: "transactions.transactiontypegroup"
	},
	{
		name: "Counterparty group",
		entity: 'counterparty-group',
		key: "counterparties.counterpartygroup"
	},
	{
		name: "Responsible group",
		entity: 'responsible-group',
		key: "counterparties.responsiblegroup"
	},
	{
		name: "Strategy 1",
		entity: 'strategy-1',
		key: "strategies.strategy1"
	},
	{
		name: "Strategy 2",
		entity: 'strategy-2',
		key: "strategies.strategy2"
	},
	{
		name: "Strategy 3",
		entity: 'strategy-3',
		key: "strategies.strategy3"
	},
	{
		name: "Strategy 1 group",
		entity: 'strategy-1-group',
		key: "strategies.strategy1group"
	},
	{
		name: "Strategy 2 group",
		entity: 'strategy-2-group',
		key: "strategies.strategy2group"
	},
	{
		name: "Strategy 3 group",
		entity: 'strategy-3-group',
		key: "strategies.strategy3group"
	},
	{
		name: "Strategy 1 subgroup",
		entity: 'strategy-1-subgroup',
		key: "strategies.strategy1subgroup"
	},
	{
		name: "Strategy 2 subgroup",
		entity: 'strategy-2-subgroup',
		key: "strategies.strategy1subgroup"
	},
	{
		name: "Strategy 3 subgroup",
		entity: 'strategy-3-subgroup',
		key: "strategies.strategy1subgroup"
	},
	{
		name: "Balance report",
		entity: 'balance-report',
		key: "reports.balancereport"
	},
	{
		name: "P&L report",
		entity: 'pl-report',
		key: "reports.plreport"
	},
	{
		name: "Transaction report",
		entity: 'transaction-report',
		key: "reports.transactionreport"
	},
	{
		name: "Cash flow projection report",
		entity: 'cash-flow-projection-report',
		key: "reports.cashflowreport"
	},
	{
		name: "Performance report",
		entity: 'performance-report',
		key: "reports.performancereport"
	},
	{
		name: "Transaction",
		entity: 'complex-transaction',
		key: "transactions.complextransaction"
	},
	{
		name: "Balance Report Custom Field",
		entity: 'balance-report-custom-field',
		key: "reports.balancereportcustomfield"
	},
	{
		name: "PL Report Custom Field",
		entity: 'pl-report-custom-field',
		key: "reports.plreportcustomfield"
	},
	{
		name: "Transaction Report Custom Field",
		entity: 'transaction-report-custom-field',
		key: "reports.transactionreportcustomfield"
	},
	{
		name: 'Price History Error',
		entity: 'price-history-error',
		key: 'pricing.pricehistoryerror'
	},
	{
		name: "Currency History Error",
		entity: 'currency-history-error',
		key: "pricing.currencyhistoryerror"
	},
	{
		name: 'Audit transaction',
		entity: 'audit-transaction',
		key: 'audit.objecthistory4entry'
	},

	{
		name: 'Audit instrument',
		entity: 'audit-instrument',
		key: 'audit.objecthistory4entry'
	}
];

watch(
	() => props.itemObject,
	() => {
		selItem.value = props.itemObject || {name: ''};
		inputText.value = selItem.value.name;
	}
)

function getEntityTypeByContentType() {
	return entitiesDataList.find(data => data.key === props.content_type).entity;
}

async function loadItemsFromUnifiedDatabase(item) {

	error.value = '';

	const config = {
		body: {
			id: item.id,
			entity_type: getEntityTypeByContentType(),
		}
	};

	selItem.value = item;

	processing.value = true;
	disabled.value = true;


	let res = await useApi('importUnifiedData.post', config);

	if (res.errors.length) {
		onLoadItemError(res.errors[0]);

	} else if (res.error) {
		onLoadItemError(res.error.message);

	}
	else {

		emit('update:modelValue', res.id);
		emit('update:itemObject', {id: res.id, name: item.name, user_code: item.user_code});

		valueIsValid.value = true;

	}

	disabled.value = false;
	processing.value = false;

}

async function selectDatabaseItem(item) {

	console.log('selectDatabaseItem.item', item);
	menuIsOpened.value = false;

	selItem.value = item;
	inputText.value = item.name;

	if (props.content_type === 'currencies.currency') {
		loadItemsFromCbonds(item);

	} else {

		// Download here?
		loadItemsFromUnifiedDatabase(item);

	}

}

async function findEntities() {

	databaseItems.value = [];

	if (props.content_type === 'currencies.currency') {

		const options = {
			filters: {
				name: inputText.value || '',
				page: 0,
			}
		}

		const res = await useApi('currencyDatabaseSearch.get', options);

		if (res.error) {

			console.error("Unified Database error occurred", res.error);

		} else {

			databaseItemsTotal.value = res.resultCount;
			// TODO make request for currencyDatabaseSearch.get return empty array instead of object
			if (Array.isArray(res.foundItems)) {
				databaseItems.value = res.foundItems;
			}

		}

		return;

	}

	const options = {
		filters: {
			query: inputText.value || '',
		}
	}

	const res = await useApi('counterpartiesUnifiedData.get', options);

	if (res.error) {

		console.error("Unified Database error occurred", res.error);

	} else {
		databaseItemsTotal.value = res.count;
		databaseItems.value = res.results;
	}

}

async function findEntitiesByUserCode() {

	const options = {
		listLight: true,
		filters: {
			pageSize: 500,
			user_code: inputText.value || '',
		}
	};

	let res = await useResolveEntityApi(props.content_type, 'get', options);

	if (!res.error) {
		localItemsTotal.value = res.count;
		localItems.value = res.results;
	}

}

async function getList() {

	processing.value = true;

	var promises = [];

	promises.push(findEntities());

	/*promises.push(new Promise(function (resolve, reject) {


		entityResolverService.getListLight(scope.entityType, {
			pageSize: 500,
			filters: {
				user_code: scope.inputText
			}
		}).then(function (data) {

			scope.localItemsTotal = data.count;

			scope.localItems = data.results;

			resolve()


		})

	}))*/
	promises.push(findEntitiesByUserCode())


	await Promise.allSettled(promises);

	databaseItems.value = databaseItems.value.filter(function (databaseItem) {

		let userCodeProp = (props.content_type === 'currencies.currency') ? 'code' : 'user_code';

		let exist = !!localItems.value.find(item => item.user_code === databaseItem[userCodeProp]);

		return !exist;

	})

	/*setTimeout(function () {

		$('.unified-data-select-options-group-title').on('click', function () {

			$(this).next()[0].scrollIntoView({block: 'start', behavior: 'smooth'});
		});

	}, 100)*/

	processing.value = false;

}

function onFilterInputFocus() {

	menuIsOpened.value = true;

	inputText.value = '';
	getList();

}

function onFilterInputChange(newValue) {
	inputText.value = newValue;
	getList();
}

function onFilterInputBlur() {
	inputText.value = selItem.value.name;
	menuIsOpened.value = false;
}

</script>

<style lang="scss" scoped>
.sel_menu_block {
	max-height: 380px;
	min-width: 280px;
	max-width: 280px;
	width: 280px;

	.sel_option {
		padding: 11px 16px 2px 16px;
		box-sizing: border-box;
		width: 100%;
		border-bottom: $opts-borders;

		&:first-child {
			border-top: $opts-borders;
		}

		&:hover {
			background: inherit;
			background-color: rgba(0, 0, 0, 0.03);
			/*border: none;
			border-radius: 0px;*/
			-moz-box-shadow: none;
			-webkit-box-shadow: none;
			box-shadow: none;
		}

		span.highlight {
			color: #F05A22;
			font-weight: bold;
		}

	}
}

.opts_group_title {
	font-size: 14px;
	color: #333333;
	margin: 8px;
	padding-left: 10px;
	position: sticky;
	background: #fff;
	cursor: pointer;
	height: 30px;
	padding-top: 9px;
	box-sizing: border-box;
}
</style>
