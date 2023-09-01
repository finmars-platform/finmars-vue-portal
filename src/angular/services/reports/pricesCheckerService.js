/**
 * Created by szhitenev on 06.11.2020.
 */
import baseUrlService from '@/angular/shell/scripts/app/services/baseUrlService'

export default function () {
	const baseUrl = baseUrlService.resolve()

	const check = function (data) {
		const prefix = baseUrlService.getMasterUserPrefix()
		const apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'reports/price-history-check/',
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		)
	}

	return {
		check: check,
	}
}
