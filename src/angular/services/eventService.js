export default function () {
	var events = {}

	function addEventListener(eventName, callback) {
		if (!events.hasOwnProperty(eventName)) {
			events[eventName] = []
		}

		events[eventName].push(callback)

		return events[eventName].length - 1
	}

	function removeEventListener(eventName, index) {
		if (!events.hasOwnProperty(eventName)) {
			throw 'Event is not exist'
		}

		if (index < 0) {
			throw 'Index is 0 or lesser'
		}

		if (index > events[eventName].length) {
			throw 'Index is greater then listeners count'
		}

		delete events[eventName][index]
	}

	function dispatchEvent(eventName, argumentsObj) {
		// ;

		if (events.hasOwnProperty(eventName)) {
			events[eventName].forEach(function (callback) {
				if (argumentsObj) {
					callback(argumentsObj)
				} else {
					callback()
				}
			})
		} /* else {

                // console.warn('Event ' + eventName + ' is not listened');
                // throw "Event is not listened"
            } */
	}

	function getListeners() {
		return events
	}

	return {
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		dispatchEvent: dispatchEvent,
		getListeners: getListeners,
	}
}
