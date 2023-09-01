/**
 * Created by szhitenev on 06.11.2019.
 */

export default function ($scope, $customDialog, data) {


	var vm = this

	vm.text = 'Processing'

	if (data.text) {
		vm.text = data.text
	}

	vm.cancel = function () {


		$customDialog.hide({ status: 'disagree' })
	}
}
