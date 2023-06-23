export default function (viewModel, $scope, $mdDialog) {
	const vm = viewModel

	let groups, columns, filters

	//region format data for SELECTED tab
	// Victor 2020.11.30 This block transferred from gModalReportComponent to use in gModalReportTransactionComponent and gModalReportPnlComponent (DRY)
	var selectedGroups = []
	var selectedColumns = []
	var selectedFilters = []

	var updateSelectedAttr = function (attr, selectedAttrs) {
		const existingAttrIndex = selectedAttrs.findIndex(
			(selAttr) => attr.key === selAttr.key
		)

		if (existingAttrIndex < 0) {
			selectedAttrs.push(attr)
		} else {
			selectedAttrs[existingAttrIndex] = attr
		}
	}

	/**
	 *
	 * @param attributes {Array.<Object>} - array of attributes. Can be balanceAttrs, portfolioDynamicAttrs, custom etc
	 * @param attrsVmKey {string}
	 */
	var separateSelectedAttrs = function (attributes, attrsVmKey) {
		for (let i = 0; i < attributes.length; i++) {
			const attribute = JSON.parse(angular.toJson(attributes[i]))
			attribute['attrsVmKey'] = attrsVmKey

			if (attribute.groups) {
				updateSelectedAttr(attribute, selectedGroups)
			}

			if (attribute.columns) {
				updateSelectedAttr(attribute, selectedColumns)
			}

			if (attribute.filters) {
				updateSelectedAttr(attribute, selectedFilters)
			}
		}
	}

	var isAttrInsideOfAnotherGroup = function (attrKey, groupType) {
		const areasGroups = { groups, columns, filters }
		const anotherGroups = Object.keys(areasGroups).filter(
			(group) => group !== groupType
		)

		return anotherGroups.some((key) => {
			return areasGroups[key].find((attr) => attr.key === attrKey)
		})

		/*            let group1, group2;

            switch (groupType) {
                case 'groups':
                    group1 = columns;
                    group2 = filters;
                    break;

                case 'columns':
                    group1 = groups;
                    group2 = filters;
                    break;

                case 'filters':
                    group1 = groups;
                    group2 = columns;
                    break;
            }

            let attrIndex = group1.findIndex(attr => {return attr.key === attrKey});

            if (attrIndex < 0) {
                attrIndex = group2.findIndex(attr => {return attr.key === attrKey});
            }

            return attrIndex > -1;*/
	}

	/**
	 * Order used in report viewer table attributes the same as they are ordered inside the table.
	 * Recently unselected attributes at the end of their last groups (groups, columns, filters).
	 *
	 * @param insideTable {Array.<Object>} - groups, columns or filters from report viewer
	 * @param selectedAttrs {Array.<Object>} - attributes used as groups, columns or filters of report viewer
	 * @param groupType {string} - can be 'groups', 'columns', 'filters'
	 * @returns {Array} - selected attributes organized as in report viewer layout
	 */
	var organizeSelectedAttrs = function (insideTable, selectedAttrs, groupType) {
		let selectedAttrsObj = {}
		let inactiveAttrs = []

		selectedAttrs.forEach((attr) => {
			if (attr[groupType]) {
				selectedAttrsObj[attr.key] = attr
			} else if (!isAttrInsideOfAnotherGroup(attr.key, groupType)) {
				inactiveAttrs.push(attr)
			}
		})

		let orderedAttrs = []

		insideTable.forEach((attr) => {
			const selectedAttrData = selectedAttrsObj[attr.key]

			if (selectedAttrData) {
				orderedAttrs.push(selectedAttrData)
			} else {
				// Report viewer layout can use unavailable attribute (e.g. deleted user attribute)

				const groupName = groupType.slice(0, -1)

				const unavailableAttrData = {
					key: attr.key,
					name: attr.layout_name || attr.name,
					[groupType]: true,
					error_data: {
						descriptions:
							'The ' + groupName + ' does not exist in the Configuration',
					},
				}

				orderedAttrs.push(unavailableAttrData)
			}
		})

		orderedAttrs = orderedAttrs.concat(inactiveAttrs)

		return orderedAttrs.filter((attr) => !!attr) // filter undefined items
	}

	/**
	 *
	 * @param attributesVmKeysList {Array.<string>} - 'instrumentAttrs', 'portfolioDynamicAttrs', 'custom' etc.
	 * @param attrGroups {{groups: Array.<Object>, columns: Array.<Object>, filters: Array.<Object>}} - contains report viewer's groups, columns, filters
	 */
	const getSelectedAttrs = function (attributesVmKeysList, attrGroups) {
		groups = attrGroups.groups
		columns = attrGroups.columns
		filters = attrGroups.filters

		// Victor 2020.11.30 #66 If user uncheck item, it doesn't disappear from view constructor
		selectedGroups = vm.selectedGroups
		selectedColumns = vm.selectedColumns
		selectedFilters = vm.selectedFilters

		attributesVmKeysList.forEach((attributeKey) =>
			separateSelectedAttrs(vm[attributeKey], attributeKey)
		)

		// Order selected as they are inside the table
		vm.selectedGroups = organizeSelectedAttrs(groups, selectedGroups, 'groups')
		vm.selectedColumns = organizeSelectedAttrs(
			columns,
			selectedColumns,
			'columns'
		)
		vm.selectedFilters = organizeSelectedAttrs(
			filters,
			selectedFilters,
			'filters'
		)
	}
	//endregion format data for SELECTED tab

	const onDropToSelectedFilter = function (attributesList, attributeKey) {
		var draggedAttribute = attributesList.find(
			(attr) => attr.key === attributeKey
		)

		draggedAttribute.columns = false
		draggedAttribute.groups = false
		draggedAttribute.filters = true

		return attributesList
	}

	return {
		getSelectedAttrs: getSelectedAttrs,

		onDropToSelectedFilter: onDropToSelectedFilter,
	}
}
