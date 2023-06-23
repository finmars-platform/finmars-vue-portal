/**
 * Created by szhitenev on 16.06.2016.
 *
 * This service needed for modules that import entityResolverService by require()
 */
import EntityResolverService from './entityResolverServiceNew'
import CookieService from '@/angular/shell/scripts/app/services/cookieService'
import ToastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService'
import ErrorService from '@/angular/shell/scripts/app/services/errorService'
import XhrService from '@/angular/shell/scripts/app/services/xhrService'
import InstrumentService from './instrumentService'
import PriceHistoryService from './priceHistoryService'
import CurrencyHistoryService from './currencyHistoryService'
import ReportService from './reportService'
import GridTableHelperService from '../helpers/gridTableHelperService'

import MultitypeFieldService from './multitypeFieldService'
import uiService from './uiService'
import transactionTypeService from './transactionTypeService'

const cookieService = new CookieService()
const toastNotificationService = new ToastNotificationService()
const errorService = new ErrorService(toastNotificationService)
const xhrService = new XhrService(errorService, cookieService)
const multitypeFieldService = new MultitypeFieldService()

const gridTableHelperService = new GridTableHelperService(multitypeFieldService)

const instrumentService = new InstrumentService(
	cookieService,
	xhrService,
	uiService,
	gridTableHelperService,
	multitypeFieldService
)
const priceHistoryService = new PriceHistoryService(cookieService, xhrService)
const currencyHistoryService = new CurrencyHistoryService(
	cookieService,
	xhrService
)
const reportService = new ReportService(cookieService, xhrService)

export default new EntityResolverService(
	instrumentService,
	transactionTypeService,
	priceHistoryService,
	currencyHistoryService,
	reportService
)
