var getCellValueByKey = function (entityViewerDataService, key) {
	var data = entityViewerDataService.getUnfilteredFlatList()
	var result = []

	data.forEach(function (item) {
		var cellValue = ''

		if (item.hasOwnProperty('attributes') && key.indexOf('attributes.') === 0) {
			// if field is a dynamic attribute

			var dynamicAttrKey = key.slice(11)

			for (var da = 0; da < item.attributes.length; da++) {
				var dynamicAttributeData = item.attributes[da]

				if (
					dynamicAttributeData.attribute_type_object.user_code ===
					dynamicAttrKey
				) {
					if (dynamicAttributeData.attribute_type_object.value_type === 30) {
						if (dynamicAttributeData.classifier_object) {
							cellValue = dynamicAttributeData.classifier_object.name
						} else {
							cellValue = ''
						}

						break
					} else {
						switch (dynamicAttributeData.attribute_type_object.value_type) {
							case 10:
								cellValue = dynamicAttributeData.value_string
								break
							case 40:
								cellValue = dynamicAttributeData.value_date
								break
						}

						break
					}
				}
			}
		} else {
			if (item.hasOwnProperty(key)) {
				var fieldObjKey = key + '_object'

				if (item.hasOwnProperty(fieldObjKey)) {
					// if field is a relation field

					cellValue = item[fieldObjKey].name

					if (item[fieldObjKey].display_name) {
						cellValue = item[fieldObjKey].display_name
					}
				} else {
					cellValue = item[key]
				}
			}
		}

		if (cellValue && result.indexOf(cellValue) === -1) {
			result.push(cellValue)
		}
	})

	return result
}

export default {
	getCellValueByKey: getCellValueByKey,
}
