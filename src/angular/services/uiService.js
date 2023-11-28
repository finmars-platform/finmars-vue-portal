/**
 * Created by szhitenev on 16.06.2016.
 */

import ToastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService'
import ErrorService from '@/angular/shell/scripts/app/services/errorService'
import CookieService from '@/angular/shell/scripts/app/services/cookieService'
import XhrService from '@/angular/shell/scripts/app/services/xhrService'
import EcosystemDefaultService from './ecosystemDefaultService'
import MetaContentTypesService from './metaContentTypesService'

import UiService from './uiServiceNew'

const cookieService = new CookieService()
const toastNotificationService = new ToastNotificationService()
const errorService = new ErrorService(toastNotificationService)
const xhrService = new XhrService(errorService, cookieService)
const ecosystemDefaultService = new EcosystemDefaultService(
	cookieService,
	xhrService
)
const metaContentTypesService = new MetaContentTypesService(
	cookieService,
	xhrService
)

export default new UiService(
	cookieService,
	xhrService,
	metaContentTypesService,
	null,
)
