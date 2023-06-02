/**
 * Created by szhitenev on 13.01.2017.
 */

var generateExcel = function (data) {
	return window
		.fetch('/services/excel', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(data),
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
		.then(function (data) {
			return data.blob()
		})
}

export default {
	generateExcel: generateExcel,
}
