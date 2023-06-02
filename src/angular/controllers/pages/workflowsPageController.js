/**
 * Created by szhitenev on 24.01.2023.
 */

import baseUrlService from '../../services/baseUrlService'
import explorerService from '../../services/explorerService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

var baseUrl = baseUrlService.resolve()

export default function workflowsPageController(
	$scope,
	$sce,
	authorizerService,
	globalDataService,
	$mdDialog
) {
	var vm = this

	vm.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src)
	}

	vm.resolveWorkflowIframeUrl = function () {
		vm.iframeUrl = 'http://0.0.0.0:8084/space00000/workflow/'

		if (window.location.href.indexOf('finmars') !== -1) {
			vm.iframeUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				'/' +
				baseUrlService.getMasterUserPrefix() +
				'/workflow/'
		}
	}

	vm.init = function () {
		vm.resolveWorkflowIframeUrl()
	}

	vm.init()
}
