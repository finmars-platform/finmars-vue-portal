/**
 * Created by szhitenev on 04.08.2016.
 */

import logService from '@/angular/core/services/logService'

import importInstrumentService from '../../services/importInstrumentService'

export default function ($scope) {
	logService.controller(
		'SettingsBloomberImportInstrumentController',
		'initialized'
	)

	var vm = this

	vm.readyStatus = { content: false }

	importInstrumentService.getInstrumentMappingList().then(function (data) {
		vm.mapping = data.results
		vm.readyStatus.content = true
		$scope.$apply()
	})
}
