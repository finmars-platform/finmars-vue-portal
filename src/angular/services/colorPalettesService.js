import colorPalettesRepository from '../repositories/colorPalettesRepository'

var getList = function (options) {
	return colorPalettesRepository.getList(options)
}

var create = function (palette) {
	return colorPalettesRepository.create(palette)
}

var updateById = function (id, palettes) {
	return colorPalettesRepository.updateById(id, palettes)
}

var deleteById = function (paletteId) {
	return colorPalettesRepository.deleteById(paletteId)
}

export default {
	getList: getList,
	create: create,
	updateById: updateById,
	deleteById: deleteById,
}
