export default function () {
	var defaultSortingSettings = {
		columns: null,
		valueOrder: null, // value number from multiple values to use in sorting
		reverse: false,
	}

	var data = {
		tableData: null,
		sortingSettings: Object.assign({}, defaultSortingSettings),
	}

	function setTableData(tableData) {
		data.tableData = tableData
	}

	function getTableData() {
		return data.tableData
	}

	function getTemplateRow() {
		return data.tableData.templateRow
	}

	function getRow(rowOrder) {
		/* if (typeof rowOrder === 'string') {

                 for (var i = 0; i < data.tableData.body.length; i++) {

                     if (data.tableData.body[i].order === rowOrder) {
                         return data.tableData.body[i];
                     }

                 }

            } else {
                return data.tableData.body[rowOrder];
            } */
		if (rowOrder === 'header') {
			throw "Can't get data from header row"
		}

		return data.tableData.body[rowOrder]
	}

	function getRowByKey(rowKey) {
		for (var i = 0; i < data.tableData.body.length; i++) {
			if (data.tableData.body[i].key === rowKey) {
				return data.tableData.body[i]
			}
		}
	}

	function deleteRows(rows) {
		if (Array.isArray(rows)) {
			rows.forEach(function (row) {
				for (var i = 0; i < data.tableData.body.length; i++) {
					if (data.tableData.body[i].key === row.key) {
						data.tableData.body.splice(i, 1)
						break
					}
				}
			})
		} else {
			if (rows.order === 'header') {
				throw "'Header row deletion is prohibited'"
			}

			data.tableData.body.splice(rows.order, 1)
		}

		data.tableData.body.forEach(function (row, index) {
			row.order = index
		})
	}

	function getSelectedRows() {
		var rows = data.tableData.body.filter(function (row) {
			return row.isActive
		})

		return rows
	}

	function getCell(rowOrder, cellOrder) {
		if (rowOrder === 'header') {
			throw "'Can't get data from header row'"
		}

		if (rowOrder === 'templateRow') {
			return data.tableData.templateRow.columns[cellOrder]
		} else {
			return data.tableData.body[rowOrder].columns[cellOrder]
		}
		// return data.tableData.body[rowOrder].columns[cellOrder];
	}

	function getCellByKey(rowOrder, colKey) {
		if (rowOrder === 'header') {
			throw new Error('This method does not work for header row')
		}

		if (rowOrder === 'templateRow') {
			var row = data.tableData.templateRow
		} else {
			var row = getRow(rowOrder)
		}

		for (var i = 0; i < row.columns.length; i++) {
			if (row.columns[i].key === colKey) {
				return row.columns[i]
			}
		}
	}

	function setSortingSettings(colOrder, options) {
		if (data.sortingSettings.column === colOrder) {
			data.sortingSettings.reverse = !data.sortingSettings.reverse
		} else {
			data.sortingSettings = Object.assign({}, defaultSortingSettings) // reset sorting settings on column change
			data.sortingSettings.column = colOrder
		}

		if (options) {
			Object.keys(options).forEach(function (sortOnsProp) {
				data.sortingSettings[sortOnsProp] = options[sortOnsProp]
			})
		}
	}

	function getSortingSettings() {
		return data.sortingSettings
	}

	return {
		setTableData: setTableData,
		getTableData: getTableData,

		getTemplateRow: getTemplateRow,
		getRow: getRow,
		getRowByKey: getRowByKey,
		getSelectedRows: getSelectedRows,
		deleteRows: deleteRows,

		getCell: getCell,
		getCellByKey: getCellByKey,

		setSortingSettings: setSortingSettings,
		getSortingSettings: getSortingSettings,
	}
}
