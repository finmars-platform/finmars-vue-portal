/**
 * Created by szhitenev on 22.07.2016.
 */

import logService from '@/angular/core/services/logService'
import auditService from '../../services/auditService'

export default function ($scope) {
	logService.controller('AuditController', 'initialized')

	var vm = this
	vm.readyStatus = { transaction: false, instrument: false }
	vm.itemPerPage = 20

	vm.checkActiveTab = function (tab) {
		if (window.location.hash.split('tab=')[1] == tab) {
			return true
		}
		return false
	}

	vm.setActiveTab = function (tab) {
		window.location.hash = '#/system/audit?tab=' + tab
		vm.instrumentCurrent = 1
		vm.transactionCurrent = 1
	}

	vm.changePage = function (tab, page) {
		if (tab === 'instrument') {
			vm.instrumentCurrent = page
			getInstruments()
		} else {
			getTransaction()
			vm.transactionCurrent = page
		}

		console.log('--------', tab, page)
	}

	function getInstruments() {
		vm.instrumentCurrent = vm.instrumentCurrent || 1
		vm.readyStatus.instrument = false

		auditService
			.getList({
				filters: { content_type: 'instruments.instrument' },
				page: vm.instrumentCurrent,
			})
			.then(function (data) {
				vm.instruments = data.results.map(function (item) {
					item.dateFormatted = moment(new Date(item.created)).format(
						'DD/MM/YYYY'
					)
					item.timeFormatted = moment(new Date(item.created)).format('HH:ss')
					return item
				})

				vm.instrumentTotal = data.count

				vm.readyStatus.instrument = true
				$scope.$apply()
			})
	}

	getInstruments()

	// function getTransaction() {

	//     vm.transactionCurrent = vm.transactionCurrent || 1;
	//     vm.readyStatus.transaction = false;

	//     auditService.getList({filters: {'content_type': 'transactions.transaction'}, page: vm.transactionCurrent}).then(function (data) {
	//         vm.transactions = data.results.map(function (item) {
	//             item.dateFormatted = moment(new Date(item.created)).format('DD/MM/YYYY');
	//             return item
	//         });

	//         vm.transactionTotal = data.count;

	//         vm.readyStatus.transaction = true;
	//         $scope.$apply();
	//     });
	// }

	// getTransaction();
}
