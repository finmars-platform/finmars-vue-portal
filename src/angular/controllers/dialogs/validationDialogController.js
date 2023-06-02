/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, validationData) {
	var vm = this

	vm.errorData = validationData.errorData
	vm.errorMessage = null
	if (vm.errorData && vm.errorData.message) {
		vm.errorMessage = vm.errorData.message
	}

	vm.columnsNames = validationData.tableColumnsNames

	var entityType = validationData.entityType

	vm.errorRows = []

	vm.showDevInfo = false

	//vm.errorKeys = [];

	/*function removeUnderscores(key) {

            var result = '';

            result = key.split('_').join(' ');

            return result.charAt(0).toUpperCase() + result.slice(1);

        }

        var i;
        var keys = Object.keys(vm.validationData);

        for (i = 0; i < keys.length; i = i + 1) {
            vm.errorKeys.push({caption: removeUnderscores(keys[i]), value: vm.validationData[keys[i]]});
        }

        vm.bindValue = function (item) {

            //console.log('ITEM', item);

            if (Array.isArray(item.value)) {

                var result = '';

                item.value.forEach(function (itemError, index) {

                    var keys = Object.keys(itemError);

                    if (keys.length > 0) {
                        if (itemError.hasOwnProperty('name')) {
                            result = result + ("<br/>&nbsp;&nbsp;" + (index + 1) + " " + itemError.name[0]);

                        } else {
                            result = result + JSON.stringify(itemError);
                        }

                    }
                });

                return result;
            }

            return JSON.stringify(item.value);

        };*/

	var parseEvErrorMessage = function () {
		if (vm.errorMessage) {
			Object.keys(vm.errorMessage).forEach(function (messageKey) {
				var errorMessages = vm.errorMessage[messageKey]

				errorMessages.forEach(function (eMessage) {
					var errorObj = {
						name: messageKey,
						action_notes: eMessage,
					}

					vm.errorRows.push(errorObj)
				})
			})
		}
	}

	var parseComplexTransactionErrorMessage = function () {
		if (vm.errorMessage && vm.errorMessage.values) {
			Object.keys(vm.errorMessage.values).forEach(function (messageKey) {
				var errorMessages = vm.errorMessage.values[messageKey]

				errorMessages.forEach(function (eMessage) {
					var errorObj = {
						name: messageKey,
						action_notes: eMessage,
					}

					vm.errorRows.push(errorObj)
				})
			})
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	var init = function () {
		if (entityType === 'complex-transaction') {
			parseComplexTransactionErrorMessage()
		} else {
			parseEvErrorMessage()
		}
	}

	init()

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.validationDialogElemToResize'
		)
	}, 100)
}
