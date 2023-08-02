<template>
	<div class="container">
		<h2 class="title">Complex Transaction Fields</h2>
		<div class="wrapp-select">
			<FmSelect
				v-model="configurationListActive"
				label="Configuration"
				:items="configurationListItems"
			/>
		</div>
		<div class="transaction-fields">
			<div class="transaction-fields__text">
				<h2 class="transaction-fields__title title-block">Text Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in textComplexTransactionUserFieldItems"
					:key="index"
				>
					<div class="complex-input">
						<!-- -->
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<!-- v-model="selected[item.is_active]" -->
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<div class="transaction-fields__number">
				<h2 class="transaction-fields__title title-block">Number Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in numberComplexTransactionUserFieldItems"
					:key="index"
				>
					<div class="complex-input">
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<div class="transaction-fields__date">
				<h2 class="transaction-fields__title title-block">Date Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in dateComplexTransactionUserFieldItems"
					:key="index"
				>
					<div class="complex-input">
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<FmBtn
				type="primary"
				class="btn-transaction"
				@click="complexTransactionUserFieldCreate()"
				>Apply</FmBtn
			>
		</div>

		<div class="transaction-fields">
			<h2 class="title">Instrument Fields</h2>
			<div class="transaction-fields__text">
				<h2 class="transaction-fields__title title-block">Text Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in textInstrumentTextFieldsItems"
					:key="index"
				>
					<div class="complex-input">
						<!-- -->
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<!-- v-model="selected[item.is_active]" -->
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<div></div>
			<div></div>

			<FmBtn
				type="primary"
				class="btn-transaction"
				@click="instrumentTextFieldsCreate()"
				>Apply</FmBtn
			>
		</div>

		<div class="transaction-fields">
			<h2 class="title">Transaction Fields</h2>

			<div class="transaction-fields__text">
				<h2 class="transaction-fields__title title-block">Text Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in textTransactionFieldsItems"
					:key="index"
				>
					<div class="complex-input">
						<!-- -->
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<!-- v-model="selected[item.is_active]" -->
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<div class="transaction-fields__number">
				<h2 class="transaction-fields__title title-block">Number Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in numberTransactionFieldsItems"
					:key="index"
				>
					<div class="complex-input">
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<div class="transaction-fields__date">
				<h2 class="transaction-fields__title title-block">Date Fields</h2>
				<div
					class="transaction-fields__block"
					v-for="(item, index) in dateTransactionFieldItems"
					:key="index"
				>
					<div class="complex-input">
						<div class="complex-input__header">
							<div class="complex-input__name">{{ item?.key }}</div>
							<div class="complex-input__lable">Not created yet</div>
						</div>
						<div class="complex-input__body">
							<FmCheckbox :size="18" v-model="item.is_active" />
							<FmInputText label="" v-model="item.name" />
						</div>
					</div>
				</div>
			</div>
			<FmBtn
				type="primary"
				class="btn-transaction"
				@click="transactionFieldsCreate()"
				>Apply</FmBtn
			>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Settings aliases',
				to: '/settings/aliases',
			},
		],
	})
	let defaultComplexTransactionTextFields = [
		{
			key: 'user_text_1',
			name: 'User Text 1',
		},
		{
			key: 'user_text_2',
			name: 'User Text 2',
		},
		{
			key: 'user_text_3',
			name: 'User Text 3',
		},
		{
			key: 'user_text_4',
			name: 'User Text 4',
		},
		{
			key: 'user_text_5',
			name: 'User Text 5',
		},
		{
			key: 'user_text_6',
			name: 'User Text 6',
		},
		{
			key: 'user_text_7',
			name: 'User Text 7',
		},
		{
			key: 'user_text_8',
			name: 'User Text 8',
		},
		{
			key: 'user_text_9',
			name: 'User Text 9',
		},
		{
			key: 'user_text_10',
			name: 'User Text 10',
		},
		{
			key: 'user_text_11',
			name: 'User Text 11',
		},
		{
			key: 'user_text_12',
			name: 'User Text 12',
		},
		{
			key: 'user_text_13',
			name: 'User Text 13',
		},
		{
			key: 'user_text_14',
			name: 'User Text 14',
		},
		{
			key: 'user_text_15',
			name: 'User Text 15',
		},
		{
			key: 'user_text_16',
			name: 'User Text 16',
		},
		{
			key: 'user_text_17',
			name: 'User Text 17',
		},
		{
			key: 'user_text_18',
			name: 'User Text 18',
		},
		{
			key: 'user_text_19',
			name: 'User Text 19',
		},
		{
			key: 'user_text_20',
			name: 'User Text 20',
		},
		{
			key: 'user_text_21',
			name: 'User Text 21',
		},
		{
			key: 'user_text_22',
			name: 'User Text 22',
		},
		{
			key: 'user_text_23',
			name: 'User Text 23',
		},
		{
			key: 'user_text_24',
			name: 'User Text 24',
		},
		{
			key: 'user_text_25',
			name: 'User Text 25',
		},
		{
			key: 'user_text_26',
			name: 'User Text 26',
		},
		{
			key: 'user_text_27',
			name: 'User Text 27',
		},
		{
			key: 'user_text_28',
			name: 'User Text 28',
		},
		{
			key: 'user_text_29',
			name: 'User Text 29',
		},
		{
			key: 'user_text_30',
			name: 'User Text 30',
		},
	]

	let defaultComplexTransactionNumberFields = [
		{
			key: 'user_number_1',
			name: 'User Number 1',
		},
		{
			key: 'user_number_2',
			name: 'User Number 2',
		},
		{
			key: 'user_number_3',
			name: 'User Number 3',
		},
		{
			key: 'user_number_4',
			name: 'User Number 4',
		},
		{
			key: 'user_number_5',
			name: 'User Number 5',
		},
		{
			key: 'user_number_6',
			name: 'User Number 6',
		},
		{
			key: 'user_number_7',
			name: 'User Number 7',
		},
		{
			key: 'user_number_8',
			name: 'User Number 8',
		},
		{
			key: 'user_number_9',
			name: 'User Number 9',
		},
		{
			key: 'user_number_10',
			name: 'User Number 10',
		},
		{
			key: 'user_number_11',
			name: 'User Number 11',
		},
		{
			key: 'user_number_12',
			name: 'User Number 12',
		},
		{
			key: 'user_number_13',
			name: 'User Number 13',
		},
		{
			key: 'user_number_14',
			name: 'User Number 14',
		},
		{
			key: 'user_number_15',
			name: 'User Number 15',
		},
		{
			key: 'user_number_16',
			name: 'User Number 16',
		},
		{
			key: 'user_number_17',
			name: 'User Number 17',
		},
		{
			key: 'user_number_18',
			name: 'User Number 18',
		},
		{
			key: 'user_number_19',
			name: 'User Number 19',
		},
		{
			key: 'user_number_20',
			name: 'User Number 20',
		},
	]

	let defaultComplexTransactionDateFields = [
		{
			key: 'user_date_1',
			name: 'User Date 1',
		},
		{
			key: 'user_date_2',
			name: 'User Date 2',
		},
		{
			key: 'user_date_3',
			name: 'User Date 3',
		},
		{
			key: 'user_date_4',
			name: 'User Date 4',
		},
		{
			key: 'user_date_5',
			name: 'User Date 5',
		},
	]

	let defaultTransactionTextFields = [
		{
			key: 'user_text_1',
			name: 'User Text 1',
		},
		{
			key: 'user_text_2',
			name: 'User Text 2',
		},
		{
			key: 'user_text_3',
			name: 'User Text 3',
		},
	]

	let defaultTransactionNumberFields = [
		{
			key: 'user_number_1',
			name: 'User Number 1',
		},
		{
			key: 'user_number_2',
			name: 'User Number 2',
		},
		{
			key: 'user_number_3',
			name: 'User Number 3',
		},
	]

	let defaultTransactionDateFields = [
		{
			key: 'user_date_1',
			name: 'User Date 1',
		},
		{
			key: 'user_date_2',
			name: 'User Date 2',
		},
		{
			key: 'user_date_3',
			name: 'User Date 3',
		},
	]
	var defaultInstrumentTextFields = [
		{
			key: 'user_text_1',
			name: 'User Text 1',
		},
		{
			key: 'user_text_2',
			name: 'User Text 2',
		},
		{
			key: 'user_text_3',
			name: 'User Text 3',
		},
	]

	const configurationListItems = ref([])
	const systemMessagesItems = ref([])
	const configurationListActive = ref([1])

	const instrumentUserFieldItems = ref([])
	let textInstrumentTextFieldsItems = defaultInstrumentTextFields.concat()

	const complexTransactionUserFieldItems = ref([])

	let textComplexTransactionUserFieldItems =
		defaultComplexTransactionTextFields.concat()
	let numberComplexTransactionUserFieldItems =
		defaultComplexTransactionNumberFields.concat()
	let dateComplexTransactionUserFieldItems =
		defaultComplexTransactionDateFields.concat()

	const transactionUserFieldItems = ref([])
	let textTransactionFieldsItems = defaultTransactionTextFields.concat()
	let numberTransactionFieldsItems = defaultTransactionNumberFields.concat()
	let dateTransactionFieldItems = defaultTransactionDateFields.concat()

	// const disabledBtn = ref(true)
	const ecosystemDefaults = ref([1])
	const BaseInputEcosystemDefaults = ref([])
	const test = ref('lol lol eeee')
	// fetchConfigurationList()
	init()

	// async function fetchConfigurationList() {
	// 	let res = await useApi('configurationList.get'),

	// 	configurationListItems.value = res.results.filter(function (item) {
	// 			return !item.is_package
	// 		}).map(function (item) {
	// 			return {
	// 				id: item.configuration_code,
	// 				name: item.configuration_code,
	// 			}
	// 		})
	// }
	async function init() {
		const res = await Promise.all([
			useApi('instrumentUserField.get'),
			// useApi('instrumentUserField.get', { params: { id: item.id }}),
			useApi('complexTransactionUserField.get'),
			// useApi('complexTransactionUserField.get', { params: { id: item.id }}),
			useApi('transactionUserField.get', {
				params: { id: configurationListActive.value },
			}),
		])

		instrumentUserFieldItems.value = res[0].results

		complexTransactionUserFieldItems.value = res[1].results
		transactionUserFieldItems.value = res[2].results
		complexTransactionUserFieldGet()
		async function complexTransactionUserFieldGet() {
			complexTransactionUserFieldItems.value.forEach(function (field) {
				console.log('instrumentUserFieldItems первый цикл', field)
				textComplexTransactionUserFieldItems.forEach(function (textField) {
					if (textField.key === field.key && field.key.includes('user_text')) {
						textField.is_active = field.is_active
						textField.name = field.name
						textField.id = field.id
					}
				})

				numberComplexTransactionUserFieldItems.forEach(function (numberField) {
					if (
						numberField.key === field.key &&
						field.key.includes('user_number')
					) {
						numberField.is_active = field.is_active
						numberField.name = field.name
						numberField.id = field.id
					}
				})

				dateComplexTransactionUserFieldItems.forEach(function (dateField) {
					if (dateField.key === field.key && field.key.includes('user_date')) {
						dateField.is_active = field.is_active
						dateField.name = field.name
						dateField.id = field.id
					}
				})
			})
		}
		transactionUserFieldGet()
		async function transactionUserFieldGet() {
			transactionUserFieldItems.value.forEach(function (field) {
				textTransactionFieldsItems.forEach(function (textField) {
					if (textField.key === field.key && field.key.includes('user_text')) {
						textField.is_active = field.is_active
						textField.name = field.name
						textField.id = field.id
					}
				})

				numberTransactionFieldsItems.forEach(function (numberField) {
					if (
						numberField.key === field.key &&
						field.key.includes('user_number')
					) {
						numberField.is_active = field.is_active
						numberField.name = field.name
						numberField.id = field.id
					}
				})

				dateTransactionFieldItems.forEach(function (dateField) {
					if (dateField.key === field.key && field.key.includes('user_date')) {
						dateField.is_active = field.is_active
						dateField.name = field.name
						dateField.id = field.id
					}
				})
			})
		}
		console.log(
			'instrumentUserFieldItems.value',
			transactionUserFieldItems.value
		)
		console.log(
			'textComplexTransactionUserFieldItems',
			textComplexTransactionUserFieldItems
		)
		// console.log(
		// 	textTransactionUserFieldItems.value,
		// 	'textTransactionUserFieldItems'
		// )

		// console.log(
		// 	transactionUserFieldItems.value,
		// 	'transactionUserFieldItems',
		// 	transactionUserFieldItems.value[2].key,
		// 	'transactionUserFieldItems.value[2].key'
		// 	// transactionUserFieldItems.value[2].key.match(/user_text/g))
		// )
		// console.log(configurationListActive, 'configurationListActive')
	}

	const filteredList = computed(() => {
		// return (textTransactionUserFieldItems = transactionUserFieldItems.filter(
		// 	function (elem) {
		// 		if (transactionUserFieldItems.key === indexOf("user_text")) return true
		// 	}
		// ))
		// console.log(test.value, "test.value")
		return test.value.filter((i) => i.key && i.key.match(/lol/g))
	})

	watch(
		configurationListActive,
		(newValue, oldValue) => {
			if (oldValue[0] === 1) {
			} else {
				init()
				// disabledBtn.value = false
			}
		},
		{ deep: true }
	),
	// complexTransactionUserFieldCreate()
	// async function complexTransactionUserFieldCreate() {
	// 	// let res = await useApi('complexTransactionUserField.post', {
			
	// 	// 	textTransactionFieldsItems.forEach(function (textField) {
	// 	// 		params: { id: textField.value.id },

	// 	// 	body: textField.value,
	// 	// 		})

	// 	// 		numberTransactionFieldsItems.forEach(function (numberField) {
	// 	// 			if (
	// 	// 				numberField.key === field.key &&
	// 	// 				field.key.includes('user_number')
	// 	// 			) {
	// 	// 				numberField.is_active = field.is_active
	// 	// 				numberField.name = field.name
	// 	// 				numberField.id = field.id
	// 	// 			}
	// 	// 		})

	// 	// 		dateTransactionFieldItems.forEach(function (dateField) {
	// 	// 			if (dateField.key === field.key && field.key.includes('user_date')) {
	// 	// 				dateField.is_active = field.is_active
	// 	// 				dateField.name = field.name
	// 	// 				dateField.id = field.id
	// 	// 			}
	// 	// 		})

	// 	// })

	// 	if (res.error) {
	// 		// console.error(res.error);
	// 		useNotify({ type: 'error', title: res.error.message || res.error.detail })
	// 		throw new Error(res.error)
	// 	} else {
	// 		useNotify({ type: 'success', title: `data saved on the server` })
	// 	}
	// }
	instrumentTextFieldsCreate()
	async function instrumentTextFieldsCreate() {
		let res = await useApi('complexTransactionUserField.post', {
			params: { id: ecosystemDefaults.value.id },
			body: ecosystemDefaults.value,
		})

		if (res.error) {
			// console.error(res.error);
			useNotify({ type: 'error', title: res.error.message || res.error.detail })
			throw new Error(res.error)
		} else {
			useNotify({ type: 'success', title: `data saved on the server` })
		}
	}
	transactionFieldsCreate()
	async function transactionFieldsCreate() {
		let res = await useApi('complexTransactionUserField.post', {
			params: { id: ecosystemDefaults.value.id },
			body: ecosystemDefaults.value,
		})

		if (res.error) {
			// console.error(res.error);
			useNotify({ type: 'error', title: res.error.message || res.error.detail })
			throw new Error(res.error)
		} else {
			useNotify({ type: 'success', title: `data saved on the server` })
		}
	}
	
</script>

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
