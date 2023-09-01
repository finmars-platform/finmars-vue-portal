/**
 * Created by szhitenev on 08.06.2016.
 */

import referenceTablesService from '../../services/referenceTablesService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = data.item



	vm.readyStatus = { content: false }

	vm.file = null
	vm.mode = 'skip'

	vm.checkExtension = function (file, extension, $event) {


		if (file) {
			var ext = file.name.split('.')[1]

			if (ext !== extension) {
				$mdDialog
					.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						locals: {
							success: {
								title: 'Warning!',
								description: 'You are trying to load incorrect file',
							},
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
					.then(function () {
						vm.file = null
					})
			}
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		var reader = new FileReader()

		reader.readAsText(vm.file)

		reader.onload = function (evt) {
			try {


				var file = evt.target.result



				var lines = file.split(/\r\n|\n|\r/)



				lines.splice(0, 1)



				if (vm.mode === 'skip') {
					var itemsExists = []

					vm.referenceTable.rows.forEach(function (item) {
						itemsExists.push(item.key)
					})

					lines.forEach(function (line) {
						var pieces = line.split(',')
						var key = pieces[0]
						var value = pieces[1]

						if (itemsExists.indexOf(key) === -1) {
							vm.referenceTable.rows.push({
								key: key,
								value: value,
							})
						}
					})

					vm.referenceTable.rows = vm.referenceTable.rows.filter(function (
						row
					) {
						return row.key !== '' && row.value !== ''
					})

					referenceTablesService
						.update(vm.referenceTable.id, vm.referenceTable)
						.then(function () {
							$mdDialog
								.show({
									controller: 'SuccessDialogController as vm',
									templateUrl: 'views/dialogs/success-dialog-view.html',
									targetEvent: $event,
									locals: {
										success: {
											title: 'Success!',
											description:
												'You are successfully import Reference Table',
										},
									},
									multiple: true,
									preserveScope: true,
									autoWrap: true,
									skipHide: true,
								})
								.then(function (value) {
									$mdDialog.hide({ status: 'agree' })
								})
						})
				}

				if (vm.mode === 'overwrite') {
					$mdDialog
						.show({
							controller: 'WarningDialogController as vm',
							templateUrl: 'views/dialogs/warning-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							clickOutsideToClose: false,
							locals: {
								warning: {
									title: 'Warning',
									description:
										'The current Reference Table will be permanently deleted and all the assigned keys for this Reference Table will be lost.<br/> Do you want to proceed?',
									actionsButtons: [
										{
											name: 'CANCEL',
											response: {},
										},
										{
											name: 'OK, PROCEED',
											response: { status: 'agree' },
										},
									],
								},
							},
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
							multiple: true,
						})
						.then(function (res) {

							if (res.status === 'agree') {
								vm.referenceTable.rows = []

								lines.forEach(function (line) {
									var pieces = line.split(',')
									var key = pieces[0]
									var value = pieces[1]

									vm.referenceTable.rows.push({
										key: key,
										value: value,
									})
								})

								vm.referenceTable.rows = vm.referenceTable.rows.filter(
									function (row) {
										return row.key !== '' && row.value !== ''
									}
								)

								referenceTablesService
									.update(vm.referenceTable.id, vm.referenceTable)
									.then(function () {
										$mdDialog
											.show({
												controller: 'SuccessDialogController as vm',
												templateUrl: 'views/dialogs/success-dialog-view.html',
												targetEvent: $event,
												locals: {
													success: {
														title: 'Success!',
														description:
															'You are successfully import Reference Table',
													},
												},
												multiple: true,
												preserveScope: true,
												autoWrap: true,
												skipHide: true,
											})
											.then(function (value) {
												$mdDialog.hide({ status: 'agree' })
											})
									})
							}
						})
				}
			} catch (error) {


				$mdDialog.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Error',
							description: 'Unable to read it. This file is corrupted.',
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
				})

				vm.file = null
			}
		}
	}

	vm.getReferenceTable = function () {
		vm.readyStatus.content = false

		referenceTablesService.getByKey(vm.item.id).then(function (data) {
			vm.referenceTable = data

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getReferenceTable()
	}

	vm.init()
}
