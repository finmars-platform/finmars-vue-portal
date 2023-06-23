import tooltipRepository from '../repositories/tooltipsRepository'

var getTooltipsList = function (options) {
	return tooltipRepository.getList(options)
}

var updateTooltipsList = function (tooltipsList) {
	return tooltipRepository.update(tooltipsList)
}

export default {
	getTooltipsList: getTooltipsList,
	updateTooltipsList: updateTooltipsList,
}
