/**
 * Created by szhitenev on 15.06.2016.
 */

import pricingPolicyService from '../../services/pricingPolicyService'

export default function ($scope) {
	console.log(
		'{"controller": "DataPricingPolicyController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'pricing-policy' // deprecated
	vm.contentType = 'instruments.pricingpolicy'

	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// pricingPolicyService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return pricingPolicyService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
