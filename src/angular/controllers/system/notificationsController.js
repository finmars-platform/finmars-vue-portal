/**
 * Created by szhitenev on 14.06.2016.
 */

import logService from '@/angular/core/services/logService'

import notificationsService from '../../services/notificationsService'

export default function ($scope, $state, $stateParams) {
	logService.controller('NotificationsController', 'initialized')

	var vm = this

	vm.itemPerPage = 20
	vm.notificationsReady = true

	if (
		$stateParams.notificationsListType &&
		$stateParams.notificationsListType.length
	) {
		vm.notificationsListType = $stateParams.notificationsListType
	} else {
		vm.notificationsListType = 'all'
	}



	vm.changePage = function (page) {
		vm.notificationsCurrent = page
		vm.getNotifications()
	}

	vm.getNotifications = function () {
		vm.notificationsCurrent = vm.notificationsCurrent || 1
		vm.notificationsReady = false

		notificationsService
			.getList(vm.notificationsCurrent, vm.notificationsListType)
			.then(function (data) {
				vm.notificationsTotal = data.count
				vm.notifications = data.results
				//vm.markNotificationAsReaded(vm.notifications);
				vm.notificationsReady = true
				$scope.$apply()
			})
	}

	vm.getNotifications()

	vm.markNotificationAsReaded = function (notificationsList) {
		notificationsList.map(function (item) {
			var notificationId = item.id
			var notificationsReadedDate = {
				create_date: item.create_date,
				read_date: moment(new Date()).format('YYYY-MM-DD[T]HH:mm:ssZZ'),
			}
			if (item.read_date == null) {
				// ;
				notificationsService.markAsReaded(
					notificationId,
					notificationsReadedDate
				)
			}
		})
	}

	vm.markAllNotificationsAsReaded = function () {
		notificationsService.markAllAsReaded()
	}

	vm.hideShowReadedNotifications = function (type) {
		vm.notificationsListType = type
		vm.notificationsCurrent = 1
		vm.getNotifications()
	}

	vm.markAsRead = function (item) {
		var notificationId = item.id
		var read_date = moment(new Date()).format('YYYY-MM-DD[T]HH:mm:ssZZ')
		var notificationsReadedDate = {
			create_date: item.create_date,
			read_date: read_date,
		}
		item.read_date = read_date
		notificationsService.markAsReaded(notificationId, notificationsReadedDate)
	}
}
