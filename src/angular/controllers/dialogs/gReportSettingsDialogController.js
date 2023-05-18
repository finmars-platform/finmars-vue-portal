/**
 * Created by szhitenev on 15.11.2016.
 */

import metaService from '../../services/metaService'
import pricingPolicyService from '../../services/pricingPolicyService'
import currencyService from '../../services/currencyService'

import portfolioService from '../../services/portfolioService'
import accountService from '../../services/accountService'
import strategyService from '../../services/strategyService'
import transactionClassService from '../../services/transaction/transactionClassService'

export default function (
	$scope,
	$mdDialog,
	customFieldService,
	ecosystemDefaultService,
	uiService,
	data
) {
	var vm = this

	vm.evDataService = data.evDataService
	vm.evEventService = data.evEventService
	vm.attributeDataService = data.attributeDataService

	// vm.reportOptions = JSON.parse(JSON.stringify(reportOptions));
	vm.reportOptions = JSON.parse(
		JSON.stringify(vm.evDataService.getReportOptions())
	)
	vm.reportLayoutOptions = JSON.parse(
		JSON.stringify(vm.evDataService.getReportLayoutOptions())
	)

	if (vm.reportOptions.accounts_cash && vm.reportOptions.accounts_cash.length) {
		vm.accountsCash = vm.reportOptions.accounts_cash[0]
	} else {
		vm.accountsCash = 0
	}

	if (
		vm.reportOptions.accounts_position &&
		vm.reportOptions.accounts_position.length
	) {
		vm.accountsPosition = vm.reportOptions.accounts_position[0]
	} else {
		vm.accountsPosition = 0
	}

	if (!vm.reportOptions.depth_level) {
		vm.reportOptions.depth_level = 'base_transaction'
	}

	/* vm.selectOptions = [
            {
                value: 0,
                caption: "Ignore"
            },
            {
                value: 1,
                caption: "Independent"
            }
        ]; */
	vm.selectOptions = [
		{
			id: 0,
			name: 'Ignore',
		},
		{
			id: 1,
			name: 'Independent',
		},
	]

	/*vm.strategiesSelectOptions = [
            {
                value: 0,
                caption: "Ignore"
            },
            {
                value: 1,
                caption: "Independent"
            },
            {
                value: 2,
                caption: 'Offsetting (Interdependent - 0/100, 100/0, 50/50)'
            }
        ];*/
	vm.strategiesSelectOptions = [
		{
			id: 0,
			name: 'Ignore',
		},
		{
			id: 1,
			name: 'Independent',
		},
		{
			id: 2,
			name: 'Offsetting (Interdependent - 0/100, 100/0, 50/50)',
		},
	]

	vm.tableFontSizeOptions = [
		{ id: 'small', name: 'Small' },
		{ id: 'medium', name: 'Medium' },
		{ id: 'large', name: 'Large' },
	]

	vm.dateFieldOptions = [
		{ id: 'transaction_date', name: 'Transaction Date' },
		{ id: 'accounting_date', name: 'Accounting Date' },
		{ id: 'cash_date', name: 'Cash Date' },
		{ id: 'date', name: 'Complex Transaction Date' },
		{ id: 'user_date_1', name: 'User Date 1' },
		{ id: 'user_date_2', name: 'User Date 2' },
		{ id: 'user_date_3', name: 'User Date 3' },
		{ id: 'user_date_4', name: 'User Date 4' },
		{ id: 'user_date_5', name: 'User Date 5' },
		// {id: 'user_date_6', name: 'User Date 6'},
		// {id: 'user_date_7', name: 'User Date 7'},
		// {id: 'user_date_8', name: 'User Date 8'},
		// {id: 'user_date_9', name: 'User Date 9'},
		// {id: 'user_date_10', name: 'User Date 10'},
	]

	vm.depthLevelOptions = [
		{ id: 'complex_transaction', name: 'Complex Transaction' },
		{ id: 'base_transaction', name: 'Base Transaction' },
		{ id: 'entry', name: 'Entry' },
	]

	vm.costMethod = [
		{ id: 1, name: 'AVCO' },
		{ id: 2, name: 'FIFO' },
	]

	vm.approachMultiplierOptions = [
		{
			id: 0,
			name: '0/100',
		},
		{
			id: 0.5,
			name: '50/50',
		},
		{
			id: 1,
			name: '100/0',
		},
	]

	vm.calculationGroupOptions = [
		{
			id: 'portfolio',
			name: 'Portfolio',
		},
		{
			id: 'account',
			name: 'Account',
		},
		{
			id: 'strategy1',
			name: 'Strategy 1',
		},
		{
			id: 'strategy2',
			name: 'Strategy 2',
		},
		{
			id: 'strategy3',
			name: 'Strategy 3',
		},
	]

	if (vm.reportOptions.table_font_size) {
		vm.tableFontSize = vm.reportOptions.table_font_size
	} else {
		vm.tableFontSize = vm.tableFontSizeOptions[0].id
	}

	/* vm.entityType = options.entityType;
        vm.disableChangesSaving = options.disableChangesSaving; // when opened inside dashboard */
	vm.entityType = vm.evDataService.getEntityType()
	vm.disableChangesSaving = data.disableChangesSaving // when opened inside dashboard

	vm.disableDatepicker = false

	vm.readyStatus = {
		pricingPolicy: false,
		currency: false,
		// portfolio: false,
		// account: false,
		// strategy1: false,
		// strategy2: false,
		// strategy3: false,
		transactionClass: false,
	}

	vm.getPricingPolicies = async function () {
		vm.readyStatus.pricingPolicy = false

		var opitons = {
			pageSize: 1000,
			page: 1,
		}

		await pricingPolicyService.getListLight(opitons).then(function (data) {
			vm.pricingPolicies = data.results.map(function (pPolicy) {
				return {
					id: pPolicy.id,
					name: pPolicy.short_name,
				}
			})

			vm.readyStatus.pricingPolicy = true

			$scope.$apply()
		})
	}

	vm.onSearchChange = function ($event) {
		$event.stopPropagation()
	}

	vm.getCurrencies = async function () {
		vm.readyStatus.currency = false

		var options = {
			page: 1,
			pageSize: 1000,
		}

		await currencyService.getListLight(options).then(function (data) {
			vm.currencies = data.results.map(function (currency) {
				return {
					id: currency.id,
					name: currency.short_name,
				}
			})

			vm.readyStatus.currency = true

			$scope.$apply()
		})
	}

	/*vm.getPortfolios = function () {

            vm.readyStatus.portfolio = false;

            portfolioService.getList().then(function (data) {

                vm.portfolios = data.results;
                vm.readyStatus.portfolio = true;

                $scope.$apply();

            });
        };*/
	vm.optionsForMultiselect = {
		page: 1,
		pageSize: 1000,
	}

	vm.getPortfolios = function (options) {
		return portfolioService.getListLight(options)
	}

	/*vm.getAccounts = function () {

            vm.readyStatus.account = false;

            accountService.getList().then(function (data) {

                vm.accounts = data.results;
                vm.readyStatus.account = true;

                $scope.$apply();

            });
        };*/
	vm.getAccounts = function (options) {
		return accountService.getListLight(options)
	}

	/*vm.getStrategies1 = function () {

            vm.readyStatus.strategy1 = false;

            strategyService.getList(1).then(function (data) {

                vm.strategies1 = data.results;
                vm.readyStatus.strategy1 = true;

                $scope.$apply();

            });
        };*/

	vm.getStrategies1 = function (options) {
		return strategyService.getListLight(1, options)
	}

	/*vm.getStrategies2 = function () {

            vm.readyStatus.strategy2 = false;

            strategyService.getList(2).then(function (data) {

                vm.strategies2 = data.results;
                vm.readyStatus.strategy2 = true;

                $scope.$apply();

            });
        };*/

	vm.getStrategies2 = function (options) {
		return strategyService.getListLight(2, options)
	}

	/*vm.getStrategies3 = function () {

            vm.readyStatus.strategy3 = false;

            strategyService.getList(3).then(function (data) {

                vm.strategies3 = data.results;
                vm.readyStatus.strategy3 = true;

                $scope.$apply();

            });
        };*/

	vm.getStrategies3 = function (options) {
		return strategyService.getListLight(3, options)
	}

	vm.getTransactionClasses = function () {
		vm.readyStatus.transactionClass = false

		transactionClassService.getList().then(function (data) {
			vm.transactionClasses = data
			vm.readyStatus.transactionClass = true

			$scope.$apply()
		})
	}

	vm.checkReadyStatus = function () {
		var ready = true

		var keys = Object.keys(vm.readyStatus)

		for (var i = 0; i < keys.length; i = i + 1) {
			//console.log(keys[i], vm.readyStatus[keys[i]]);

			if (vm.readyStatus[keys[i]] == false) {
				ready = false
			}
		}

		return ready
	}

	vm.saveSettings = function () {
		// console.log('saveSettings.reportOptions', vm.reportOptions);
		// console.log('saveSettings.accountsCash', vm.accountsCash);
		// console.log('saveSettings.accountsPosition', vm.accountsPosition);

		if (vm.accountsCash === 1) {
			vm.reportOptions.accounts_cash[0] = 1
		} else {
			vm.reportOptions.accounts_cash = []
		}

		if (vm.accountsPosition === 1) {
			vm.reportOptions.accounts_position[0] = 1
		} else {
			vm.reportOptions.accounts_position = []
		}

		vm.reportOptions.table_font_size = vm.tableFontSize

		vm.reportOptions.complex_transaction_statuses_filter =
			vm.complex_transaction_statuses_filter.join(',')

		$mdDialog.hide({
			status: 'agree',
			data: {
				reportOptions: vm.reportOptions,
				reportLayoutOptions: vm.reportLayoutOptions,
			},
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.selectedCustomFieldsChanged = function () {
		console.log('vm.selectedCustomFields', vm.selectedCustomFields)

		vm.reportOptions.custom_fields_to_calculate =
			vm.selectedCustomFields.join(',')
	}

	vm.getCustomFields = function () {
		customFieldService.getList(vm.entityType).then(function (data) {
			if (vm.reportOptions.custom_fields_to_calculate) {
				vm.selectedCustomFields =
					vm.reportOptions.custom_fields_to_calculate.split(',')
			}
			vm.customFields = data.results
			vm.customFieldsNames = data.results.map(function (item) {
				return {
					id: item.name,
					name: item.name,
				}
			})

			$scope.$apply()
		})
	}

	let ecosystemDefaultData = null

	const getEcosystemDefaultCurrencies = async () => {
		if (!ecosystemDefaultData) {
			ecosystemDefaultData = await ecosystemDefaultService
				.getList()
				.then((res) => res.results[0])
		}

		vm.currencies.push({
			id: ecosystemDefaultData.currency_object.id,
			name: ecosystemDefaultData.currency_object.short_name,
		})

		vm.reportOptions.report_currency = ecosystemDefaultData.currency_object.id
	}

	const getEcosystemDefaultPricingPolicies = async () => {
		if (!ecosystemDefaultData) {
			ecosystemDefaultData = await ecosystemDefaultService
				.getList()
				.then((res) => res.results[0])
		}
		vm.pricingPolicies.push(ecosystemDefaultData.pricing_policy_object)
		vm.reportOptions.pricing_policy =
			ecosystemDefaultData.pricing_policy_object.id
	}

	vm.init = async function () {
		await Promise.allSettled([vm.getPricingPolicies(), vm.getCurrencies()])

		if (vm.entityType === 'transaction-report') {
			vm.transactionsUserDates = []

			let options = {
				pageSize: 1000,
				page: 1,
			}

			metaService
				.loadDataFromAllPages(uiService.getTransactionFieldList, [options])
				.then(function (transactionFields) {
					vm.transactionsUserDates = transactionFields
						.filter(function (field) {
							return [
								'user_date_1',
								'user_date_2',
								'user_date_3',
								'user_date_4',
								'user_date_5',
							].includes(field.key)
						})
						.map(function (dateField) {
							return { name: dateField.name, id: dateField.key }
						})

					vm.transactionsUserDates.push({
						name: 'Transaction date',
						id: null,
					})
				})
		}

		let ecosystemDefProms = []
		if (!vm.currencies.length) {
			// await getEcosystemDefaultCurrencies();
			ecosystemDefProms.push(getEcosystemDefaultCurrencies())
		}

		if (!vm.pricingPolicies.length) {
			// await getEcosystemDefaultPricingPolicies();
			ecosystemDefProms.push(getEcosystemDefaultPricingPolicies())
		}

		await Promise.allSettled(ecosystemDefProms)

		if (vm.reportOptions.complex_transaction_statuses_filter) {
			vm.complex_transaction_statuses_filter =
				vm.reportOptions.complex_transaction_statuses_filter.split(',')
		} else {
			vm.complex_transaction_statuses_filter = ['booked']
		}

		// vm.getPortfolios();
		// vm.getAccounts();
		vm.getTransactionClasses()
		// vm.getStrategies1();
		// vm.getStrategies2();
		// vm.getStrategies3();

		vm.getCustomFields()

		const viewContext = vm.evDataService.getViewContext()
		vm.disableDatepicker =
			viewContext === 'split_panel' && vm.reportLayoutOptions.useDateFromAbove

		uiService.getTransactionFieldList({ pageSize: 1000 }).then(function (data) {
			vm.fieldsReady = true

			console.log('transactionFields transactionFields', data.results)

			data.results.forEach(function (field) {
				vm.dateFieldOptions.forEach(function (item) {
					if (field.key === item.id) {
						item.name = field.name
					}
				})
			})

			$scope.$apply()
		})
	}

	vm.init()
}
