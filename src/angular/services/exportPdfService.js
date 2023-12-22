import cookieServiceI from '../shell/scripts/app/services/cookieService'

/**
 * Created by szhitenev on 13.01.2017.
 */
let cookieService = new cookieServiceI()

let generatePdf = function (data) {
	// return window.fetch('http://0.0.0.0:5001/generate/',
	return window
		.fetch('/services/pdf/generate/', {
			method: 'POST',
			credentials: 'include', // disable on local development
			body: JSON.stringify(data),
			headers: {
				'X-CSRFToken': cookieService.getCookie('csrftoken'), // need to pass through WAF
				Authorization: 'Token ' + cookieService.getCookie('access_token'),
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
		.then(function (data) {
			if (data.status !== 200) {
				throw new Error('Error while generating pdf')
			}

			return data.blob()
		})
}

export default {
	generatePdf: generatePdf,
}
