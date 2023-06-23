import ToastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService'
import ErrorService from '@/angular/shell/scripts/app/services/errorService'
import CookieService from '@/angular/shell/scripts/app/services/cookieService'
import XhrService from '@/angular/shell/scripts/app/services/xhrService'
import TransactionTypeRepository from '../repositories/transactionTypeRepository'

const cookieService = new CookieService()
const toastNotificationService = new ToastNotificationService()
const errorService = new ErrorService(toastNotificationService)
const xhrService = new XhrService(errorService, cookieService)

export default new TransactionTypeRepository(cookieService, xhrService)
