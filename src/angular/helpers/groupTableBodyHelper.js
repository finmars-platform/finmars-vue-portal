function returnValue(attribute) {
	if (attribute['attribute_type_object'].value_type == 30) {
		return attribute['classifier']
	} else {
		if (attribute['attribute_type_object'].value_type == 40) {
			return attribute['value_date']
		} else {
			if (attribute['attribute_type_object'].value_type == 20) {
				return attribute['value_float']
			} else {
				if (
					attribute['attribute_type_object'].value_type == 10 &&
					attribute['value_string'] !== ''
				) {
					return attribute['value_string']
				} else {
					return null
				}
			}
		}
	}
}

var findGroupedItemAttribute = function (groupedItem, attributeId) {
	var result = ''

	if (groupedItem.attributes) {
		groupedItem.attributes.forEach(function (item) {
			if (item.attribute_type_object.id == attributeId) {
				result = returnValue(item)
			}
		})
	}

	return result
}

export default {
	findGroupedItemAttribute: findGroupedItemAttribute,
}
