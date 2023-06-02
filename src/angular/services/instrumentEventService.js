import instrumentEventRepository from '../repositories/instrumentEventRepository'

var getList = function (options) {
	return instrumentEventRepository.getList(options)
}

var getEventAction = function (eventId, actionId) {
	return instrumentEventRepository.getEventAction(eventId, actionId)
}

var putEventAction = function (eventId, actionId, data, status) {
	return instrumentEventRepository.putEventAction(
		eventId,
		actionId,
		data,
		status
	)
}

var informedEventAction = function (id) {
	return instrumentEventRepository.informedEventAction(id)
}

var errorEventAction = function (id, actionId, data) {
	return instrumentEventRepository.errorEventAction(id, actionId, data)
}

var generateEvents = function () {
	return instrumentEventRepository.generateEvents()
}

var generateEventsRange = function (options) {
	return instrumentEventRepository.generateEventsRange(options)
}

var generateAndProcessAsSystem = function () {
	return instrumentEventRepository.generateAndProcessAsSystem()
}

var generateEventsRangeForSingleInstrument = function (options) {
	return instrumentEventRepository.generateEventsRangeForSingleInstrument(
		options
	)
}

export default {
	getList: getList,
	getEventAction: getEventAction,
	putEventAction: putEventAction,
	informedEventAction: informedEventAction,
	errorEventAction: errorEventAction,
	generateEvents: generateEvents,
	generateEventsRange: generateEventsRange,
	generateAndProcessAsSystem: generateAndProcessAsSystem,
	generateEventsRangeForSingleInstrument:
		generateEventsRangeForSingleInstrument,
}
