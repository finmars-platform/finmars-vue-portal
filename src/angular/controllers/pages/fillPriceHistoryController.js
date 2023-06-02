/**
 * Created by mevstratov on 24.06.2019.
 */

import logService from '@/angular/core/services/logService'

import importPricingService from '../../services/import/importPricingService'

import instrumentRecalculateAccruedPriceService from '../../services/instrument/instrumentRecalculateAccruedPriceService'

export default function ($scope, $mdDialog) {
	logService.controller('FillPriceHistoryController', 'initialized')

	var vm = this

	vm.readyStatus = {
		mapping: false,
		processing: false,
		recalculationProcessing: false,
		recalculationDone: false,
	}

	var d = new Date()
	d = new Date(d.setDate(d.getDate() - 1))

	vm.price = {
		date_from: d,
		date_to: d,
		date_both: d,
		balance_date: d,
		override_existed: false,
	}
	vm.priceSettings = { isRange: false }

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.uploadPrice = function ($event) {
		vm.readyStatus.processing = true

		if (!vm.price.date_both) {
			vm.price.date_both = vm.price.date_from
		}

		if (vm.priceSettings.isRange) {
			vm.price.date_from = moment(new Date(vm.price.date_from)).format(
				'YYYY-MM-DD'
			)
			vm.price.date_to = moment(new Date(vm.price.date_to)).format('YYYY-MM-DD')
			vm.price.balance_date = moment(new Date(vm.price.balance_date)).format(
				'YYYY-MM-DD'
			)
		} else {
			vm.price.date_from = moment(new Date(vm.price.date_both)).format(
				'YYYY-MM-DD'
			)
			vm.price.date_to = moment(new Date(vm.price.date_both)).format(
				'YYYY-MM-DD'
			)
			vm.price.balance_date = moment(new Date(vm.price.balance_date)).format(
				'YYYY-MM-DD'
			)
		}

		importPricingService.create(vm.price).then(function (data) {
			vm.price = data
			if (
				vm.price.task_object.status == 'P' ||
				vm.price.task_object.status == 'S' ||
				vm.price.task_object.status == 'W'
			) {
				setTimeout(function () {
					vm.uploadPrice()
				}, 5000)
			} else {
				if (
					vm.price.instrument_price_missed.length ||
					vm.price.currency_price_missed.length
				) {
					$mdDialog.show({
						controller: 'FillPriceManuallyInstrumentDialogController as vm',
						templateUrl:
							'views/dialogs/fill-price-manually-instrument-dialog-view.html',
						targetEvent: $event,
						locals: {
							data: {
								instruments: vm.price.instrument_price_missed,
								currencies: vm.price.currency_price_missed,
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				} else {
					$mdDialog.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						locals: {
							success: {
								title: 'Success',
								description: 'Prices download success',
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				}
				vm.readyStatus.processing = false
			}
			$scope.$apply()
		})
	}

	vm.startRecalculation = function () {
		vm.readyStatus.recalculationProcessing = true
		vm.readyStatus.recalculationDone = false
		vm.readyStatus.recalculationError = false
		var dateFrom

		var dateTo
		try {
			dateFrom = moment(new Date(vm.recalculate.date_from)).format('YYYY-MM-DD')
			dateTo = moment(new Date(vm.recalculate.date_to)).format('YYYY-MM-DD')
			instrumentRecalculateAccruedPriceService
				.recalculate(dateFrom, dateTo)
				.then(function () {
					vm.readyStatus.recalculationDone = true
					vm.readyStatus.recalculationProcessing = false
					$scope.$apply()
				})
		} catch (err) {
			vm.readyStatus.recalculationProcessing = false
			vm.readyStatus.recalculationError = true
		}
	}
}
