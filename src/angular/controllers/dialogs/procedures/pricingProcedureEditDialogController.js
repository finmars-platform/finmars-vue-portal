/**
 * Created by szhitenev on 30.01.2020.
 */

import pricingProcedureService from '@/angular/services/procedures/pricingProcedureService'

/*import portfolioService from '@/angular/services/portfolioService';
    import instrumentTypeService from '@/angular/services/instrumentTypeService';
    import pricingPolicyService from '@/angular/services/pricingPolicyService';

    import instrumentPricingSchemeService from '@/angular/services/pricing/instrumentPricingSchemeService';
    import currencyPricingSchemeService from '@/angular/services/pricing/currencyPricingSchemeService';*/

var getAndOverwriteKeysPairs = {
	price_get_principal_prices: 'price_overwrite_principal_prices',
	price_get_accrued_prices: 'price_overwrite_accrued_prices',
	price_get_fx_rates: 'price_overwrite_fx_rates',
}

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.itemId = data.item.id

	vm.readyStatus = { procedure: false, other: false }
	vm.processing = false

	vm.entityType = 'pricing-procedure'

	vm.portfolios = []
	vm.pricingPolicies = []
	vm.instrumentTypes = []
	vm.instrumentPricingSchemes = []
	vm.currencyPricingSchemes = []

	vm.portfolio_filters = []
	vm.pricing_policy_filters = []
	vm.instrument_type_filters = []
	vm.instrument_pricing_scheme_filters = []
	vm.currency_pricing_scheme_filters = []

	vm.toggleStatus = {
		price_date_from: 'datepicker',
		price_date_to: 'datepicker',
	}

	vm.toggle = function (key) {
		if (vm.toggleStatus[key] === 'datepicker') {
			vm.toggleStatus[key] = 'expr'
		} else {
			vm.toggleStatus[key] = 'datepicker'
		}

		vm.item[key] = null
		vm.item[key + '_expr'] = null
	}

	vm.item = {}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.processing = true
		var pprocedureData = JSON.parse(angular.toJson(vm.item))

		if (pprocedureData.price_date_from_expr) {
			pprocedureData.price_date_from = null
		}

		if (pprocedureData.price_date_to_expr) {
			pprocedureData.price_date_to = null
		}

		if (pprocedureData.portfolio_filters) {
			pprocedureData.portfolio_filters =
				pprocedureData.portfolio_filters.join(',')
		}

		if (pprocedureData.pricing_policy_filters) {
			pprocedureData.pricing_policy_filters =
				pprocedureData.pricing_policy_filters.join(',')
		}

		if (pprocedureData.instrument_type_filters) {
			pprocedureData.instrument_type_filters =
				pprocedureData.instrument_type_filters.join(',')
		}

		if (pprocedureData.instrument_pricing_scheme_filters) {
			pprocedureData.instrument_pricing_scheme_filters =
				pprocedureData.instrument_pricing_scheme_filters.join(',')
		}

		if (pprocedureData.instrument_pricing_condition_filters) {
			pprocedureData.instrument_pricing_condition_filters =
				pprocedureData.instrument_pricing_condition_filters.join(',')
		}

		if (pprocedureData.currency_pricing_scheme_filters) {
			pprocedureData.currency_pricing_scheme_filters =
				pprocedureData.currency_pricing_scheme_filters.join(',')
		}

		if (pprocedureData.currency_pricing_condition_filters) {
			pprocedureData.currency_pricing_condition_filters =
				pprocedureData.currency_pricing_condition_filters.join(',')
		}

		pricingProcedureService.update(pprocedureData.id, pprocedureData).then(
			function (data) {
				$mdDialog.hide({ status: 'agree', data: { item: data } })
			},
			function () {
				vm.processing = false
			}
		)
	}

	/*vm.getPortfolios = function () {

            return new Promise(function (resolve, reject) {

                portfolioService.getList({
                    pageSize: 1000
                }).then(function (data) {

                    vm.portfolios = data.results.map(function (item) {

                        return {
                            id: item.user_code,
                            name: item.user_code
                        }

                    });

                    resolve();

                }).catch(function (e) { reject(e); });

            });

        };

        vm.getInstrumentPricingSchemes = function () {

            return new Promise(function (resolve, reject) {

                instrumentPricingSchemeService.getList({
                    pageSize: 1000
                }).then(function (data) {

                    vm.instrumentPricingSchemes = data.results.map(function (item) {

                        return {
                            id: item.user_code,
                            name: item.user_code
                        }

                    });

                    resolve();

                }).catch(function (e) { reject(e) });

            });

        };

        vm.getCurrencyPricingSchemes = function () {

            return new Promise(function (resolve, reject) {

                currencyPricingSchemeService.getList({
                    pageSize: 1000
                }).then(function (data) {

                    vm.currencyPricingSchemes = data.results.map(function (item) {

                        return {
                            id: item.user_code,
                            name: item.user_code
                        }

                    });

                    resolve();

                }).catch(function (e) { reject(e) });

            });

        };

        vm.getInstrumentTypes = function () {

            return new Promise(function (resolve, reject) {

                instrumentTypeService.getList({
                    pageSize: 1000
                }).then(function (data) {

                    vm.instrumentTypes = data.results.map(function (item) {

                        return {
                            id: item.user_code,
                            name: item.user_code
                        }

                    });

                    console.log('vm.instrumentTypes', vm.instrumentTypes);
                    resolve();

                }).catch(function (e) { reject(e); });

            });

        };

        vm.getPricingPolicies = function () {

            return new Promise(function (resolve, reject) {

                pricingPolicyService.getList({
                    pageSize: 1000
                }).then(function (data) {

                    vm.pricingPolicies = data.results.map(function (item) {

                        return {
                            id: item.user_code,
                            name: item.user_code
                        }

                    });

                    resolve();

                }).catch(function (e) { reject(e) });

            });

        };*/

	vm.getItem = function () {
		vm.readyStatus.procedure = false

		return new Promise(function (resolve, reject) {
			pricingProcedureService
				.getByKey(vm.itemId)
				.then(function (data) {
					vm.originalItem = JSON.parse(JSON.stringify(data))

					vm.item = data

					Object.keys(getAndOverwriteKeysPairs).forEach(vm.checkOverwriteValue)

					if (vm.item.portfolio_filters) {
						vm.item.portfolio_filters = vm.item.portfolio_filters.split(',')
					}

					if (vm.item.pricing_policy_filters) {
						vm.item.pricing_policy_filters =
							vm.item.pricing_policy_filters.split(',')
					}

					if (vm.item.instrument_type_filters) {
						vm.item.instrument_type_filters =
							vm.item.instrument_type_filters.split(',')
					}

					if (vm.item.instrument_pricing_scheme_filters) {
						vm.item.instrument_pricing_scheme_filters =
							vm.item.instrument_pricing_scheme_filters.split(',')
					}

					if (vm.item.instrument_pricing_condition_filters) {
						vm.item.instrument_pricing_condition_filters =
							vm.item.instrument_pricing_condition_filters.split(',')
					}

					if (vm.item.currency_pricing_scheme_filters) {
						vm.item.currency_pricing_scheme_filters =
							vm.item.currency_pricing_scheme_filters.split(',')
					}

					if (vm.item.currency_pricing_condition_filters) {
						vm.item.currency_pricing_condition_filters =
							vm.item.currency_pricing_condition_filters.split(',')
					}

					if (vm.item.price_date_from_expr) {
						vm.toggleStatus.price_date_from = 'expr'
					}

					if (vm.item.price_date_to_expr) {
						vm.toggleStatus.price_date_to = 'expr'
					}

					vm.readyStatus.procedure = true

					resolve()
				})
				.catch(function (e) {
					reject(e)
				})
		})
	}

	vm.checkOverwriteValue = function (getKey) {
		if (!vm.item[getKey]) {
			var overwriteKey = getAndOverwriteKeysPairs[getKey]

			vm.item[overwriteKey] = false
		}
	}

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: vm.originalItem,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getItem().then(function () {
						$scope.$apply()
					})
				}
			})
	}

	vm.init = function () {
		/*var promisesList = [
                vm.getItem(),

                vm.getInstrumentTypes(),
                vm.getPricingPolicies(),
                vm.getPortfolios(),

                vm.getInstrumentPricingSchemes(),
                vm.getCurrencyPricingSchemes(),
            ];

            Promise.all(promisesList).then(function () {

                vm.readyStatus.other = true;
                $scope.$apply();

            });*/

		Promise.all([vm.getItem(), pricingProcedureService.loadRelatedData()]).then(
			function (data) {
				var relatedData = data[1]

				vm.instrumentTypes = relatedData.instrumentTypes
				vm.pricingPolicies = relatedData.pricingPolicies
				vm.portfolios = relatedData.portfolios

				vm.instrumentPricingSchemes = relatedData.instrumentPricingSchemes
				vm.currencyPricingSchemes = relatedData.currencyPricingSchemes

				vm.readyStatus.other = true
				$scope.$apply()
			}
		)
	}

	vm.init()
}
