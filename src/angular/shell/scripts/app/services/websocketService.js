/**
 * Created by szhitenev on 17.12.2020.
 */

'use strict'

let callbacks = {}

import toastNotificationService from '@/angular/core/services/toastNotificationService'
import cookieService from '@/angular/core/services/cookieService'

const PROJECT_ENV = '__PROJECT_ENV__' // changed when building project by minAllScripts()

const send = function (data) {


	if (isOnline()) {
		window.ws.send(JSON.stringify(data))
	}
}

function addEventListener(event, callback) {
	if (!callbacks[event]) {
		callbacks[event] = []
	}

	callbacks[event].push(callback)

	if (isOnline()) {
		window.ws.onmessage = function (message) {


			try {
				var parsedMessage = JSON.parse(message.data)

				if (parsedMessage.hasOwnProperty('type')) {
					if (callbacks[parsedMessage.type]) {
						callbacks[parsedMessage.type].forEach(function (callback) {
							callback(parsedMessage.payload)
						})
					}
				} else {

				}
			} catch (error) {


			}
		}
	}
}

function removeEventListener(event) {
	if (callbacks[event]) {
		delete callbacks[event]
	}
}

function isOnline() {
	return !!window.ws
}

function connect(isReconnect) {
	try {
		// window.ws = new WebSocket("__WS_HOST__");
		window.ws = new WebSocket(window.WS_HOST)



		if (window.ws) {
			window.ws.onopen = function () {

				window.openedSocket = true
				window.ws.send(
					JSON.stringify({
						action: 'initial_auth',
						data: {
							access_token: cookieService.getCookie('access_token'),
						},
					})
				)
			}

			// window.ws.on("message", (data) => {
			// 	;
			// });

			window.ws.onclose = function (err) {

				window.openedSocket = false

				// toastNotificationService.error("Websocket connection is closed")
			}

			window.ws.onerror = function (err) {


				// if (PROJECT_ENV !== 'local') toastNotificationService.error("Websocket connection is closed");

				window.openedSocket = false
			}
		} else {
			if (!isReconnect) {
				toastNotificationService.error('Could not connect to Websocket Server')
			}
		}
	} catch (error) {
		console.error('Catch unhandled error ', error)
		// if (!isReconnect) {
		//     toastNotificationService.error("Websocket connection is closed")
		// }
	}
}

function reconnect() {


	try {
		connect(true)
	} catch (err) {

	}
}

function reconnectIfError() {
	setInterval(() => {
		if (window.openedSocket == false) {
			reconnect()
		}
	}, 5000)
}

export default {
	send: send,
	addEventListener: addEventListener,
	removeEventListener: removeEventListener,
	isOnline: isOnline,
	connect: connect,
	reconnectIfError: reconnectIfError,
}
