/**
 * Created by szhitenev on 05.05.2016.
 */

import afterLoginEventsService from '../services/afterLoginEventsService'
// import usersService from '../services/usersService';
import uiService from '../services/uiService'

// import systemMessageService from '../services/systemMessageService';
import baseUrlService from '../services/baseUrlService'
var baseUrl = baseUrlService.resolve()

export default function (
	$scope,
	$state,
	$mdDialog,
	authorizerService,
	usersService,
	globalDataService,
	systemMessageService,
	redirectionService
) {
	console.log('Home Controller')

	var vm = this

	/* const PROJECT_ENV = '__PROJECT_ENV__'; // changed when building project by minAllScripts()

        if (PROJECT_ENV !== 'local') {
            console.log("redirection homeController redirection");
            window.open(redirectionService.getUrl('app.portal.home'), '_self');
        } */

	vm.systemMessages = []
	// vm.currentMasterUser = null;
	vm.eventsProcessing = false
	vm.dashboardsListReady = false

	var currentMasterUser = globalDataService.getMasterUser()

	vm.getFileUrl = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return (
			baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'file-reports/file-report/' +
			id +
			'/view/'
		)
	}

	vm.downloadFile = function ($event, item) {
		systemMessageService.viewFile(item.file_report).then(function (data) {
			console.log('data', data)

			$mdDialog.show({
				controller: 'FilePreviewDialogController as vm',
				templateUrl: 'views/dialogs/file-preview-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						content: data,
						info: item,
					},
				},
			})
		})
	}

	/* vm.getMasterUsersList = function () {

            return authorizerService.getMasterUsersListLight().then(function (data) {

                vm.masterUsers = data.results;

                vm.currentMasterUser = vm.masterUsers.filter(function (master) {
                    return master.is_current;
                })[0];

                $scope.$apply();

            });

        }; */

	var processEventsPromise = function () {
		/*return new Promise(function (resolve, reject) {

                usersService.getOwnMemberSettings().then(function (data) {

                    var info = JSON.parse(sessionStorage.getItem('afterLoginEvents'));

                    var member = data.results[0];

                    var showEventsDialogs = false;

                    if (!info) {
                        showEventsDialogs = true;
                    }

                    if (info && info.indexOf(currentMasterUser.id) === -1) {
                        showEventsDialogs = true;
                    }

                    // 1 = Do not notify
                    // 3 = Email only notifications

                    if (member.notification_level === 1 || member.notification_level === 3) {
                        showEventsDialogs = false;
                    }

                    if (showEventsDialogs) {

                        vm.eventsProcessing = true;

                        afterLoginEventsService.getAndShowEvents($mdDialog).then(function (value) {

                            vm.eventsProcessing = false;
                            resolve();

                        }).catch(function () {
                            resolve();
                        });

                        if (info) {
                            info.push(currentMasterUser.id);
                        } else {
                            info = [currentMasterUser.id];
                        }

                        sessionStorage.setItem('afterLoginEvents', JSON.stringify(info));


                    } else {
                        vm.eventsProcessing = false;
                        resolve();
                    }

                });

            });*/
		return new Promise(function (resolve, reject) {
			var info = JSON.parse(sessionStorage.getItem('afterLoginEvents'))

			var member = globalDataService.getMember()

			var showEventsDialogs = false

			if (!info) {
				showEventsDialogs = true
			}

			if (info && info.indexOf(currentMasterUser.id) === -1) {
				showEventsDialogs = true
			}

			// 1 = Do not notify
			// 3 = Email only notifications

			if (member.notification_level === 1 || member.notification_level === 3) {
				showEventsDialogs = false
			}

			if (showEventsDialogs) {
				vm.eventsProcessing = true

				afterLoginEventsService
					.getAndShowEvents($mdDialog)
					.then(function (value) {
						vm.eventsProcessing = false
						resolve()
					})
					.catch(function () {
						resolve()
					})

				if (info) {
					info.push(currentMasterUser.id)
				} else {
					info = [currentMasterUser.id]
				}

				sessionStorage.setItem('afterLoginEvents', JSON.stringify(info))
			} else {
				vm.eventsProcessing = false
				resolve()
			}
		})
	}

	var getDashboardsList = function () {
		return new Promise(function (resolve, reject) {
			uiService.getDashboardLayoutList().then(function (data) {
				vm.dashboardsList = data.results
				vm.dashboardsListReady = true

				resolve()
			})
		})
	}

	vm.getSystemMessages = function () {
		// get latest
		systemMessageService
			.getList({
				sort: {
					direction: 'DESC',
					key: 'created',
				},
			})
			.then(function (data) {
				vm.systemMessages = data.results

				vm.systemMessages = vm.systemMessages.map(function (item) {
					// SECTION_GENERAL = 0
					// SECTION_EVENTS = 1
					// SECTION_TRANSACTIONS = 2
					// SECTION_INSTRUMENTS = 3
					// SECTION_DATA = 4
					// SECTION_PRICES = 5
					// SECTION_REPORT = 6
					// SECTION_IMPORT = 7
					// SECTION_ACTIVITY_LOG = 8
					// SECTION_SCHEDULES = 9

					// TYPE_INFORMATION = 1
					// TYPE_WARNING = 2
					// TYPE_ERROR = 3
					// TYPE_SUCCESS = 4

					item.verbose_created = moment(new Date(item.created)).format(
						'DD-MM-YYYY HH:mm'
					)

					if (item.type === 1) {
						item.verbose_type = 'Information'
					} else if (item.type === 2) {
						item.verbose_type = 'Warning'
					} else if (item.type === 3) {
						item.verbose_type = 'Error'
					} else if (item.type === 4) {
						item.verbose_type = 'Success'
					}

					console.log('item', item)

					if (item.section === 0) {
						item.verbose_section = 'General'
					} else if (item.section === 1) {
						item.verbose_section = 'Events'
					} else if (item.section === 2) {
						item.verbose_section = 'Transactions'
					} else if (item.section === 3) {
						item.verbose_section = 'Instruments'
					} else if (item.section === 4) {
						item.verbose_section = 'Data'
					} else if (item.section === 5) {
						item.verbose_section = 'Prices'
					} else if (item.section === 6) {
						item.verbose_section = 'Report'
					} else if (item.section === 7) {
						item.verbose_section = 'Import'
					} else if (item.section === 8) {
						item.verbose_section = 'Activity Log'
					} else if (item.section === 9) {
						item.verbose_section = 'Schedules'
					}

					item.attachments = item.attachments.map(function (attachment) {
						attachment.file_report_url = vm.getFileUrl(attachment.file_report)

						return attachment
					})

					return item
				})

				// newest at the bottom
				vm.systemMessages = vm.systemMessages.reverse()

				vm.systemMessagesReady = true

				$scope.$apply()

				setTimeout(function () {
					var elem = document.querySelector('.homepage-messages-container')

					if (elem) {
						elem.scrollTop = elem.scrollHeight
					}
				}, 300)
			})
	}

	vm.reactToEvents = function () {
		processEventsPromise()
	}

	vm.init = async function () {
		/* vm.getMasterUsersList().then(function () {

				var promises = [];

				promises.push(processEventsPromise());
				promises.push(getDashboardsList());

				Promise.all(promises).then(function () {
					$scope.$apply();
				}).catch(function () {
					$scope.$apply();
				});

            }); */

		vm.getSystemMessages()

		var promises = []

		// promises.push(processEventsPromise());
		promises.push(getDashboardsList())

		await Promise.all(promises)
		$scope.$apply()
	}

	vm.init()
}
