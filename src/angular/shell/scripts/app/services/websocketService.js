/**
 * Created by szhitenev on 17.12.2020.
 */

'use strict'

let callbacks = {}

import toastNotificationService from '@/angular/core/services/toastNotificationService'
import cookieService from '@/angular/core/services/cookieService'

const PROJECT_ENV = '__PROJECT_ENV__' // changed when building project by minAllScripts()

const send = function (data) {
	console.log('websocket send', data)

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
			console.log('Websocket.message ', message)

			try {
				var parsedMessage = JSON.parse(message.data)

				if (parsedMessage.hasOwnProperty('type')) {
					if (callbacks[parsedMessage.type]) {
						callbacks[parsedMessage.type].forEach(function (callback) {
							callback(parsedMessage.payload)
						})
					}
				} else {
					console.log('Websocket onmessage error. Type is not set', message)
				}
			} catch (error) {
				console.log('Websocket onmessage error. Error: ', error)
				console.log('Websocket onmessage error. Message: ', message)
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

		console.log('client try to connect...')

		if (window.ws) {
			window.ws.onopen = function () {
				console.log('Websocket. Initial Auth')
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
			// 	console.log(data);
			// });

			window.ws.onclose = function (err) {
				console.log('WEBSOCKET_CLOSE: connection closed %o', err)
				window.openedSocket = false

				// toastNotificationService.error("Websocket connection is closed")
			}

			window.ws.onerror = function (err) {
				console.log('WEBSOCKET_ERROR: Error', new Error(err.message))

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
	console.log('Trying to reconnect to Websocket Server')

	try {
		connect(true)
	} catch (err) {
		console.log('WEBSOCKET_RECONNECT: Error', new Error(err.message))
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
