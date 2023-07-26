/**
 * Created by szhitenev on 22.03.2018.
 */

import entitySchemesAttributesRepository from '../../repositories/import/entitySchemesAttributesRepository'
import metaService from '../metaService'
import attributeTypeService from '../attributeTypeService'
import baseUrlService from '../baseUrlService'

var baseUrl = baseUrlService.resolve()

var getRelatedAttributesList = function () {
	return entitySchemesAttributesRepository.getRelatedAttributesList()
}

var getMatchingAttributesList = function (entity) {
	// return metaService.getEntityAttrs(entity).then(function (entityAttributes) {
	var processedEntity = entity.toLowerCase()
	if (processedEntity.indexOf(' ') != -1) {
		processedEntity = processedEntity.split(' ').join('-')
	}

	var eAttrs = metaService.getEntityAttrs(processedEntity),
		relatedAttrs = getRelatedAttributesList(),
		attrMatchingAttributes = []

	eAttrs.forEach(function (eAttr) {
		var attrMatch = {}

		if (eAttr.value_type == 'mc_field') {
			for (var i = 0; i < relatedAttrs.length; i++) {
				var rAttr = relatedAttrs[i]

				// check if attribute related
				if (eAttr.key == rAttr.key) {
					attrMatch.name = eAttr.name
					attrMatch.value_type = 'mc_field'
					attrMatch.expression = ''
					attrMatchingAttributes.push(attrMatch)
					break
				}
			}
		} else if (eAttr.value_type == 20 || eAttr.value_type == 10) {
			attrMatch.name = eAttr.name
			attrMatch.value_type = eAttr.value_type
			attrMatch.expression = ''
			attrMatchingAttributes.push(attrMatch)
		}
	})

	// Adding dynamic attributes to the list
	return attributeTypeService
		.getList(processedEntity, { pageSize: 1000 })
		.then(function (dynamicAttributes) {
			if (dynamicAttributes.results && dynamicAttributes.results.length > 0) {
				var dynamicAttrs = dynamicAttributes.results

				dynamicAttrs.forEach(function (dAttr) {
					var dAttrMatch = {}
					dAttrMatch.name = dAttr.name
					dAttrMatch.value_type = dAttr.value_type
					dAttrMatch.expression = ''
					attrMatchingAttributes.push(dAttrMatch)
				})
			}

			return attrMatchingAttributes
		})
}

var create = function (attrs, schemeId) {
	return entitySchemesAttributesRepository.create(attrs, schemeId)
}

export default {
	getRelatedAttributesList: getRelatedAttributesList,
	getMatchingAttributesList: getMatchingAttributesList,
	create: create,
}
