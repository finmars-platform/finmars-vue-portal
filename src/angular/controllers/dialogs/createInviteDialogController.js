import membersAndGroupsService from '../../services/membersAndGroupsService'
// import authorizerService from '../../services/authorizerService';

export default function (
	$scope,
	$mdDialog,
	authorizerService,
	globalDataService
) {
	let vm = this

	vm.username = ''

	vm.groupsList = []
	vm.assignedGroupsList = []

	vm.readyStatus = { content: false }

	vm.usernameError = false

	/* vm.checkUniqueness = function ($event){

            var authorizerUrl = baseUrlService.getAuthorizerUrl();

            return window.fetch(authorizerUrl + '/user-check-existence/?username=' + vm.username, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': 'Token ' + cookieService.getCookie('access_token'),
                    Accept: 'application/json',
                    'Content-type': 'application/json'
                }
            }).then(function (data) {
                return data.json();
            }).then(function (data){

                if (data.exist) {
                    vm.usernameError = false
                } else {
                    vm.usernameError = true;
                }

                $scope.$apply();

            })


        } */

	vm.agree = function ($event) {
		authorizerService.checkUsernameUniqueness(vm.username).then((data) => {
			if (data.exist) {
				vm.usernameError = false

				const groups = vm.assignedGroupsList
					.map(function (group) {
						return group.name
					})
					.join(',')

				authorizerService
					.inviteUser({
						username: vm.username,
						groups: groups,
						base_api_url: vm.currentMasterUser.base_api_url,
					})
					.then(function (data) {
						$mdDialog
							.show({
								controller: 'SuccessDialogController as vm',
								templateUrl: 'views/dialogs/success-dialog-view.html',
								locals: {
									success: {
										title: '',
										description: 'You successfully send an invitation',
									},
								},
								targetEvent: $event,
								preserveScope: true,
								multiple: true,
								autoWrap: true,
								skipHide: true,
							})
							.then(function () {
								$mdDialog.hide({ status: 'agree' })
							})
					})
					.catch(function (reason) {
						// $mdDialog.show({
						// 	controller: 'ValidationDialogController as vm',
						// 	templateUrl: 'views/dialogs/validation-dialog-view.html',
						// 	targetEvent: $event,
						// 	locals: {
						// 		validationData: data
						// 	},
						// 	preserveScope: true,
						// 	autoWrap: true,
						// 	skipHide: true,
						// 	multiple: true
						// }).then(function () {
						// 	$mdDialog.hide({status: 'agree'});
						// });
					})
			} else {
				vm.usernameError = true
				$scope.$apply()
			}
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		vm.currentMasterUser = globalDataService.getMasterUser()

		membersAndGroupsService.getGroupsList().then(function (data) {
			vm.groupsList = data.results

			vm.groupsList = vm.groupsList.filter(function (group) {
				if (group.name === 'Guests') {
					vm.assignedGroupsList.push(group)

					return false
				}
				return true
			})

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.init()
}
