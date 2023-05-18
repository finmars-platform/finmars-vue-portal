/**
 * Created by szhitenev on 08.06.2016.
 */

import csvImportSchemeService from '@/angular/services/import/csvImportSchemeService'
import complexImportSchemeService from '@/angular/services/import/complexImportSchemeService'
import pricingProcedureService from '@/angular/services/procedures/pricingProcedureService'
import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'
import instrumentDownloadSchemeService from '@/angular/services/import/instrumentDownloadSchemeService'

module.exports =
	function dashboardConstructorButtonSetComponentDialogController(
		$scope,
		$mdDialog,
		metaContentTypesService,
		transactionTypeService,
		uiService,
		dashboardConstructorMethodsService,
		item,
		dataService
	) {
		var vm = this

		vm.readyStatus = {
			transactionTypes: false,
			pricingProcedures: false,
			simpleImportSchemes: false,
			transactionImportSchemes: false,
			complexImportSchemes: false,
			dashboardLayouts: false,
			instrumentDownloadSchemes: false,
		}

		console.log('item', item)

		if (item) {
			vm.item = item
		} else {
			vm.item = {
				type: 'button_set',
				id: null, // should be generated before create
				name: '',
				settings: {},
			}
		}

		vm.componentsTypes = []

		vm.cancel = function () {
			$mdDialog.hide({ status: 'disagree' })
		}

		vm.initGrid = function () {
			if (!vm.item.settings.grid) {
				vm.item.settings.rows = 6
				vm.item.settings.columns = 6

				vm.item.settings.grid = {
					rows: [],
				}

				for (var i = 0; i < 6; i = i + 1) {
					var row = {
						items: [],
						index: i,
					}

					for (var x = 0; x < 6; x = x + 1) {
						var button = {
							options: {},
						}

						row.items.push(button)
					}

					vm.item.settings.grid.rows.push(row)
				}
			} else {
				vm.item.settings.grid.rows.forEach(function (row) {
					row.items = row.items.map(function (button) {
						if (!button.options) {
							button.optiions = {}
						}

						return button
					})
				})
			}
		}

		vm.actions = [
			{
				name: 'Book Transaction',
				value: 'book_transaction',
			},
			{
				name: 'Create New Record',
				value: 'create_new_record',
			},
			{
				name: 'Open Report',
				value: 'open_report',
			},
			{
				name: 'Open Data Viewer',
				value: 'open_data_viewer',
			},
			{
				name: 'Open Dashboard',
				value: 'open_dashboard',
			},
			{
				name: 'Run Valuation Procedure',
				value: 'run_valuation_procedure',
			},

			{
				name: 'Import Data From File',
				value: 'import_data_from_file',
			},
			{
				name: 'Import Transactions From File',
				value: 'import_transactions_from_file',
			},
			{
				name: 'Complex Import From File',
				value: 'complex_import_from_file',
			},
			{
				name: 'Download Instrument',
				value: 'download_instrument',
			},
			{
				name: 'Go To',
				value: 'go_to',
			},
		]

		vm.targets = {
			book_transaction: [],
			create_new_record: [
				{
					value: 'portfolio',
					name: 'Portfolio',
				},
				{
					value: 'account',
					name: 'Account',
				},
				{
					value: 'instrument',
					name: 'Instrument',
				},
				{
					value: 'currency',
					name: 'Currency',
				},
				{
					value: 'currency-history',
					name: 'FX Rate',
				},
				{
					value: 'price-history',
					name: 'Price',
				},

				{
					value: 'responsible',
					name: 'Responsible',
				},
				{
					value: 'counterparty',
					name: 'Counterparty',
				},

				{
					value: 'strategy-1',
					name: 'Strategy 1',
				},

				{
					value: 'strategy-2',
					name: 'Strategy 2',
				},

				{
					value: 'strategy-3',
					name: 'Strategy 3',
				},

				{
					value: 'transaction-type',
					name: 'Transaction Type',
				},
				{
					value: 'account-type',
					name: 'Account Type',
				},
				{
					value: 'instrument-type',
					name: 'Instrument Type',
				},
				{
					value: 'pricing-policy',
					name: 'Pricing Policy',
				},
			],
			open_report: [
				{
					value: 'reports.balancereport',
					name: 'Balance Report',
				},
				{
					value: 'reports.plreport',
					name: 'P&L Report',
				},
				{
					value: 'reports.transactionreport',
					name: 'Transaction Report',
				},
			],
			open_data_viewer: [],
			open_dashboard: [],
			run_valuation_procedure: [],
			import_data_from_file: [],
			import_transactions_from_file: [],
			complex_import_from_file: [],
			download_instrument: [],
			go_to: [
				{
					value: '/',
					name: 'Homepage',
				},
				{
					value: '/dashboard',
					name: 'Dashboard',
				},
				{
					value: '/reports/balance',
					name: 'Balance Report',
				},
				{
					value: '/reports/profit-and-lost',
					name: 'P&L Report',
				},
				{
					value: '/reports/transaction',
					name: 'Transaction Report',
				},
				{
					value: '/reports/check-for-events',
					name: 'Events',
				},
				{
					value: '/data/portfolios',
					name: 'Portfolios',
				},
				{
					value: '/data/accounts',
					name: 'Accounts',
				},
				{
					value: '/data/instruments',
					name: 'Instruments',
				},
				{
					value: '/data/counterparties',
					name: 'Counterparties',
				},
				{
					value: '/data/responsibles',
					name: 'Responsibles',
				},
				{
					value: '/data/currency',
					name: 'Currencies',
				},
				{
					value: '/data/strategy/1',
					name: 'Strategy 1',
				},
				{
					value: '/data/strategy/2',
					name: 'Strategy 2',
				},
				{
					value: '/data/strategy/3',
					name: 'Strategy 3',
				},
				{
					value: '/data/complex-transactions',
					name: 'Transactions',
				},
				{
					value: '/data/transactions',
					name: 'Base Transactions',
				},
				{
					value: '/data/pricing',
					name: 'Prices',
				},
				{
					value: '/data/pricing-errors',
					name: 'Prices Errors',
				},
				{
					value: '/data/currencies',
					name: 'FX Rates',
				},
				{
					value: '/data/currencies-errors',
					name: 'FX Rates Errors',
				},
				{
					value: '/run-pricing-procedures',
					name: 'Run Pricing',
				},
				{
					value: '/import/simple-entity-import',
					name: 'Import Data (From File)',
				},
				{
					value: '/import/transaction-import',
					name: 'Import Transactions (From File)',
				},
				{
					value: '/import/complex-import',
					name: 'Import Data and Transactions (From File)',
				},
				{
					value: '/import/instrument-import',
					name: 'Import Instrument (From Provider)',
				},
				{
					value: '/import/prices-import',
					name: 'Import Prices/FX (From Provider)',
				},
				{
					value: '/import/mapping-tables-import',
					name: 'Mapping Tables',
				},
				{
					value: '/forum',
					name: 'Forum',
				},
			],
		}

		vm.targetSpecifics = {
			open_report: {},
			open_data_viewer: {},
		}

		vm.getTargetSpecifics = function ($event, item) {
			return new Promise(function (resolve, reject) {
				if (vm.targetSpecifics[item.action].hasOwnProperty(item.target)) {
					resolve(vm.targetSpecifics[item.action][item.target])
				} else {
					var entityType

					if (item.action === 'open_report') {
						entityType = metaContentTypesService.findEntityByContentType(
							item.target
						)

						uiService.getListLayout(entityType).then(function (data) {
							vm.targetSpecifics[item.action][item.target] = data.results.map(
								function (item) {
									return {
										value: item.user_code,
										name: item.name,
									}
								}
							)

							resolve(vm.targetSpecifics[item.action][item.target])
						})
					}

					if (item.action === 'open_data_viewer') {
						entityType = metaContentTypesService.findEntityByContentType(
							item.target
						)

						uiService.getListLayout(entityType).then(function (data) {
							vm.targetSpecifics[item.action][item.target] = data.results.map(
								function (item) {
									return {
										value: item.user_code,
										name: item.name,
									}
								}
							)

							resolve(vm.targetSpecifics[item.action][item.target])
						})
					}
				}
			})
		}

		vm.agree = function () {
			console.log('vm.item', vm.item)

			if (vm.item.id) {
				/*vm.componentsTypes = vm.componentsTypes.map(function (item) {

                    if (item.id === vm.item.id) {
                        return vm.item
                    }

                    return item;
                })*/
				dataService.updateComponentById(vm.item)
			} else {
				var pattern = new Date().getTime() + '_' + vm.componentsTypes.length

				vm.item.id = dataService.___generateId(pattern)

				vm.componentsTypes.push(vm.item)
			}

			dataService.setComponents(vm.componentsTypes)

			$mdDialog.hide({ status: 'agree' })
		}

		vm.getTransactionTypes = function () {
			vm.readyStatus.transactionTypes = false

			transactionTypeService
				.getListLight({ pageSize: 1000 })
				.then(function (data) {
					vm.targets['book_transaction'] = data.results.map(function (item) {
						return {
							value: item.user_code,
							name: item.short_name,
						}
					})

					vm.readyStatus.transactionTypes = true

					$scope.$apply()
				})
		}

		vm.getPricingProcedures = function () {
			vm.readyStatus.pricingProcedures = false

			pricingProcedureService.getList().then(function (data) {
				vm.targets['run_valuation_procedure'] = data.results.map(function (
					item
				) {
					return {
						value: item.user_code,
						name: item.name,
					}
				})

				vm.readyStatus.pricingProcedures = true

				$scope.$apply()
			})
		}

		vm.getSimpleImportSchemes = function () {
			vm.readyStatus.simpleImportSchemes = false

			csvImportSchemeService.getListLight().then(function (data) {
				vm.targets['import_data_from_file'] = data.results.map(function (item) {
					return {
						value: item.user_code,
						name: item.user_code,
					}
				})

				vm.readyStatus.simpleImportSchemes = true

				$scope.$apply()
			})
		}

		vm.getTransactionImportSchemes = function () {
			vm.readyStatus.transactionImportSchemes = false

			transactionImportSchemeService.getListLight().then(function (data) {
				vm.targets['import_transactions_from_file'] = data.results.map(
					function (item) {
						return {
							value: item.user_code,
							name: item.user_code,
						}
					}
				)

				vm.readyStatus.transactionImportSchemes = true

				$scope.$apply()
			})
		}

		vm.getComplexImportSchemes = function () {
			vm.readyStatus.complexImportSchemes = false

			complexImportSchemeService.getList().then(function (data) {
				vm.targets['complex_import_from_file'] = data.results.map(function (
					item
				) {
					return {
						value: item.user_code,
						name: item.user_code,
					}
				})

				vm.readyStatus.complexImportSchemes = true

				$scope.$apply()
			})
		}

		vm.getDashboardLayouts = function () {
			vm.readyStatus.dashboardLayouts = false

			uiService.getDashboardLayoutList().then(function (data) {
				vm.targets['open_dashboard'] = data.results.map(function (item) {
					return {
						value: item.user_code,
						name: item.name,
					}
				})

				vm.readyStatus.dashboardLayouts = true

				$scope.$apply()
			})
		}

		vm.getInstrumentDownloadSchemes = function () {
			vm.readyStatus.instrumentDownloadSchemes = false

			instrumentDownloadSchemeService.getList().then(function (data) {
				vm.targets['download_instrument'] = data.results.map(function (item) {
					return {
						value: item.user_code,
						name: item.user_code,
					}
				})

				vm.readyStatus.instrumentDownloadSchemes = true

				$scope.$apply()
			})
		}

		vm.getContentTypes = function () {
			var contentTypes = metaContentTypesService.getListForUi()

			var excludes = []

			vm.targets['open_report'].forEach(function (item) {
				excludes.push(item.value)
			})

			vm.targets['open_data_viewer'] = contentTypes
				.map(function (item) {
					return {
						value: item.key,
						name: item.name,
					}
				})
				.filter(function (item) {
					return excludes.indexOf(item.value) === -1
				})

			console.log('vm.targets', vm.targets)
		}

		vm.checkReadyStatus = function () {
			var result = true

			Object.keys(vm.readyStatus).forEach(function (key) {
				if (!vm.readyStatus[key]) {
					result = false
				}
			})

			return result
		}

		// Victor 2020.10.26 Issue #47
		vm.exportToDashboards = function () {
			dashboardConstructorMethodsService.exportComponentToDashboards(
				vm,
				$mdDialog,
				dataService
			)
		}

		vm.init = function () {
			vm.getTransactionTypes()
			vm.getPricingProcedures()
			vm.getSimpleImportSchemes()
			vm.getTransactionImportSchemes()
			vm.getComplexImportSchemes()
			vm.getDashboardLayouts()
			vm.getInstrumentDownloadSchemes()
			vm.getContentTypes()

			console.log('dataService', dataService)

			vm.componentsTypes = dataService.getComponents()

			vm.initGrid()

			console.log('vm.item.settings', vm.item)
		}

		vm.init()
	}
