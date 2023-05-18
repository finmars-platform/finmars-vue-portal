'use strict'

import instrumentTypeService from '../../services/instrumentTypeService'
import metaService from '../../services/metaService'
import portfolioRegisterService from '../../services/portfolioRegisterService'
import pricingPolicyService from '../../services/pricingPolicyService'

export default function PortfolioRegisterDialogController(
	$scope,
	$mdDialog,
	data
) {
	const vm = this

	vm.title = data.title || ''

	vm.portfolioRegister = {}
	vm.instrument = {}

	vm.instrTypeId = null
	vm.instrTypeOpts = []

	vm.valueToShow = 'name'
	vm.selPortfolioData = data.portfolio

	if (vm.selPortfolioData !== undefined) {
		// select portfolio inside portfolioRegisterDialogController
		vm.portfolioId = vm.selPortfolioData ? vm.selPortfolioData.id : null
		vm.selPrtfName = vm.selPortfolioData ? vm.selPortfolioData.name : null
	}

	vm.selCurrencyData = data.currency
	vm.currencyId = vm.selCurrencyData ? vm.selCurrencyData.id : null
	vm.selCurrencyName = vm.selCurrencyData ? vm.selCurrencyData.name : null

	vm.pricingPolicyId = data.pricingPolicy
	vm.pricingPoliciesOpts = []

	vm.readyStatus = false

	vm.etPortfolio = 'portfolio'
	vm.etCurrency = 'currency'

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		const newPrtfRegister = { ...{}, ...vm.portfolioRegister }
		newPrtfRegister.new_linked_instrument = { ...{}, ...vm.instrument }
		newPrtfRegister.new_linked_instrument.instrument_type = vm.instrTypeId

		newPrtfRegister.valuation_currency = vm.currencyId
		newPrtfRegister.valuation_pricing_policy = vm.pricingPolicyId

		$mdDialog.hide({ status: 'agree', data: newPrtfRegister })
	}

	const init = function () {
		const options = {
			pageSize: 1000,
			page: 1,
		}

		const iTypeProm = new Promise((resolve, reject) => {
			metaService
				.loadDataFromAllPages(instrumentTypeService.getListLight, [options])
				.then((instrTypesList) => {
					vm.instrTypeOpts = instrTypesList.map((iType) => {
						return { id: iType.id, name: iType.short_name }
					})

					resolve()
				})
				.catch((error) => reject(error))
		})

		const ppProm = new Promise((resolve, reject) => {
			metaService
				.loadDataFromAllPages(pricingPolicyService.getListLight, [options])
				.then((ppList) => {
					vm.pricingPoliciesOpts = ppList.map((pPolicy) => {
						return { id: pPolicy.id, name: pPolicy.short_name }
					})

					resolve()
				})
				.catch((error) => reject(error))
		})

		Promise.all([iTypeProm, ppProm]).then(() => {
			vm.readyStatus = true
			$scope.$apply()
		})
	}

	init()

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.twoInputsDialogElemToResize'
		)
		$scope.$apply()
	}, 100)
}
