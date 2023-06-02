/**
 * Created by szhitenev on 23.07.2020.
 */

var requestCounter = 0
var requests = []
var consoleStatus = 'hidden'

var scrollPosition

var sessionTime = 0

var renderHeadContent = function () {
	var pendingRequests = requests.filter(function (item) {
		if (item.endTime) {
			return false
		}

		return true
	}).length

	var successRequests = requests.filter(function (item) {
		return item.status && item.status === 200
	}).length

	var errorRequests = requests.filter(function (item) {
		return item.error
	}).length

	var sessionTimeInMinutes = Math.floor(sessionTime / 60)
	var sessionTimeInSeconds = sessionTime - sessionTimeInMinutes * 60

	var result = "<div class='developer-console-head-content'>"

	result =
		result +
		"<div class='developer-console-head-row'>Session Time: " +
		sessionTimeInMinutes +
		'm ' +
		sessionTimeInSeconds +
		's</div>'

	result = result + "<div class='developer-console-column-holder'>"

	result = result + "<div class='developer-console-head-column'>"
	result =
		result +
		"<div>Total Requests: <span class='developer-console-head-column-value'>" +
		requestCounter +
		'</span></div>'
	result =
		result +
		"<div>Pending Requests: <span class='developer-console-head-column-value'>" +
		pendingRequests +
		'</span></div>'
	result = result + '</div>'

	result = result + "<div class='developer-console-head-column'>"
	result =
		result +
		"<div>Success Requests: <span class='developer-console-head-column-value'>" +
		successRequests +
		'</span></div>'
	result =
		result +
		"<div class='developer-console-color-red'>Error Requests: <span class='developer-console-head-column-value'>" +
		errorRequests +
		'</span></div>'
	result = result + '</div>'

	result = result + '</div>'
	result = result + '</div>'

	return result
}

var renderBodyContent = function () {
	var result = "<div class='developer-console-body-content'>"

	result = result + "<div class='developer-console-requests-container'>"
	result = result + "<div class='developer-console-requests-row-header'>"

	result = result + "<div class='developer-console-requests-row-url'>URL</div>"
	result =
		result +
		"<div class='developer-console-requests-row-content-length'>Size</div>"
	result =
		result +
		"<div class='developer-console-requests-row-processing-time'>Time</div>"

	result = result + '</div>'

	result =
		result + "<div class='developer-console-requests-container-scrollable'>"

	requests.forEach(function (item) {
		var url = '/api' + item.url.split('/api')[1]
		var time

		if (item.processingTime) {
			time = parseFloat(item.processingTime / 1000).toFixed(1)

			if (time > 60) {
				time = parseFloat(time / 60).toFixed(1) + 'm'
			} else {
				time = time + 's'
			}
		} else {
			time = '-'
		}

		var size

		if (item.error) {
			size = 'error'
		} else {
			if (item.contentLength) {
				size = parseFloat(item.contentLength / 1024).toFixed(1) + 'KB'
			} else {
				size = 'processing'
			}
		}

		var rowClasses = ['developer-console-requests-row']

		if (item.error) {
			rowClasses.push('row-status-error')
		} else if (size === 'processing') {
			rowClasses.push('row-status-processing')
		} else {
			rowClasses.push('row-status-done')
		}

		var row = "<div class='" + rowClasses.join(' ') + "'>"

		row =
			row +
			"<div class='developer-console-requests-row-url' title='" +
			url +
			"'>" +
			url +
			'</div>'
		row =
			row +
			"<div class='developer-console-requests-row-content-length'>" +
			size +
			'</div>'
		row =
			row +
			"<div class='developer-console-requests-row-processing-time'>" +
			time +
			'</div>'

		row = row + '</div>'

		result = result + row
	})

	result = result + '</div>'

	result = result + '</div>'
	result = result + '</div>'

	return result
}

var renderConsole = function () {
	var container = document.createElement('div')

	container.classList.add('developer-console')

	var result = '<div>'

	var headContent = renderHeadContent()
	result = result + headContent

	var bodyContent = renderBodyContent()
	result = result + bodyContent

	result = result + '</div>'

	container.innerHTML = result

	document.body.appendChild(container)

	setTimeout(function () {
		var scrollableContainer = document.querySelector(
			'.developer-console-requests-container-scrollable'
		)

		if (!scrollPosition) {
			scrollPosition = scrollableContainer.scrollHeight
		}

		scrollableContainer.scrollTop = scrollPosition
	}, 0)
}

var destroyConsole = function () {
	document.querySelector('.developer-console').remove()
}

var init = function () {
	console.log('Init Developer Console')

	document.addEventListener('keyup', function (event) {
		if (event.key === '`' || event.key === 'ё' || event.key === '~') {
			if (consoleStatus === 'hidden') {
				consoleStatus = 'shown'
				renderConsole()
			} else {
				destroyConsole()
				consoleStatus = 'hidden'
			}
		}
	})

	setInterval(function () {
		sessionTime = sessionTime + 1
	}, 1000)
}

var pushRequest = function (item) {
	item.startTime = new Date()

	requests.push(item)

	requestCounter = requestCounter + 1

	return requestCounter - 1 // return index
}

var resolveRequest = function (id, data) {
	requests[id].response = data
	requests[id].status = data.status

	new Promise(function (resolve, reject) {
		resolve(requests[id].response.text())
	}).then(function (data) {
		requests[id].endTime = new Date()
		requests[id].content = data
		requests[id].contentLength = requests[id].content.length
		requests[id].processingTime = requests[id].endTime - requests[id].startTime
	})
}

var rejectRequest = function (id, error) {
	requests[id].error = error

	requests[id].endTime = new Date()
	requests[id].processingTime = requests[id].endTime - requests[id].startTime
}

export default {
	init: init,
	pushRequest: pushRequest,
	resolveRequest: resolveRequest,
	rejectRequest: rejectRequest,
}
