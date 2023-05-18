/**
 * Created by szhitenev on 15.06.2016.
 *
 * This service needed for modules that import attributeTypeService by require()
 */
import ToastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService'
import ErrorService from '@/angular/shell/scripts/app/services/errorService'
import CookieService from '@/angular/shell/scripts/app/services/cookieService'
import XhrService from '@/angular/shell/scripts/app/services/xhrService'
import MetaRestrictionsService from './metaRestrictionsService'
import AttributeTypeService from './attributeTypeServiceNew'

const cookieService = new CookieService()
const toastNotificationService = new ToastNotificationService()
const errorService = new ErrorService(toastNotificationService)
const xhrService = new XhrService(errorService, cookieService)
const metaRestrictionsService = new MetaRestrictionsService()

export default new AttributeTypeService(
	cookieService,
	xhrService,
	metaRestrictionsService
)
