import rvSubtotalService from './rv-subtotal.service'

function getMatrixUniqueValues(itemList, key, valueKey) {
	var result = []
	var foundItems = []

	itemList.forEach(function (item) {
		var itemKey = item[key] || '-'
		var itemTotal = null

		if (
			(item[valueKey] || item[valueKey] === 0) &&
			typeof item[valueKey] === 'number'
		) {
			itemTotal = item[valueKey]
		}

		var itemIndex = foundItems.indexOf(itemKey)

		if (itemIndex === -1) {
			var itemObj = {
				key: itemKey,
				total: itemTotal,
			}

			result.push(itemObj)
			foundItems.push(itemObj.key)
		} else {
			if ((itemTotal || itemTotal === 0) && result[itemIndex].total === null) {
				result[itemIndex].total = 0
			}

			if (itemTotal) {
				result[itemIndex].total += itemTotal
			}
		}
	})

	result = result.sort(function (a, b) {
		if (a.key.indexOf('-') !== 0 && b.key.indexOf('-') === 0) {
			return 1
		}

		if (a.key.indexOf('-') === 0 && b.key.indexOf('-') !== 0) {
			return -1
		}

		if (a.key.indexOf('-') === 0 && b.key.indexOf('-') === 0) {
			// if both words starts with '-', filter as usual

			var aWithoutDash = a.key.slice(1)
			var bWithoutDash = b.key.slice(1)

			if (aWithoutDash > bWithoutDash) {
				return 1
			}

			if (aWithoutDash < bWithoutDash) {
				return -1
			}
		}

		if (a.key > b.key) {
			return 1
		}

		if (a.key < b.key) {
			return -1
		}

		return 0
	})

	return result
}

function getMatrix(
	itemList,
	rows,
	columns,
	rowsKey,
	columnsKey,
	valueKey,
	subtotal_formula_id
) {
	subtotal_formula_id = subtotal_formula_id || 1

	subtotal_formula_id = parseInt(subtotal_formula_id, 10)

	console.log('getMatrix.subtotal_formula_id', subtotal_formula_id)

	var result = []

	rows.forEach(function (row) {
		// creating data structure for matrix

		var matrixRowData = {
			index: result.length,
			row_name: row.key,
			items: [],
		}

		columns.forEach(function (column) {
			var matrixColumnData = {
				index: matrixRowData.items.length,
				column_name: column.key,
				data: {
					flatListItems: [],
					value: 0,
				},
			}

			matrixRowData.items.push(matrixColumnData)
		})

		result.push(matrixRowData)
	})

	itemList.forEach(function (item) {
		// find items for matrix cells

		var rowName = item[rowsKey] || '-'
		var colName = item[columnsKey] || '-'

		/*if (rowName && colName) {

                var r, c;
                rowsLoop: for (r = 0; r < result.length; r++) {
                    var row = result[r];

                    if (row.row_name === rowName) {

                        for (c = 0; c < row.items.length; c++) {
                            var column = row.items[c];

                            if (column.column_name === colName) {

                                column.data.flatListItems.push(item);
                                break rowsLoop;

                            }

                        }

                    }
                }

            }*/

		var r, c
		rowsLoop: for (r = 0; r < result.length; r++) {
			var row = result[r]

			if (row.row_name === rowName) {
				for (c = 0; c < row.items.length; c++) {
					var column = row.items[c]

					if (column.column_name === colName) {
						column.data.flatListItems.push(item)
						break rowsLoop
					}
				}
			}
		}
	})

	console.log('getMatrix.result', result)

	result.forEach(function (row) {
		// calculating values of matrix's cells

		row.items.forEach(function (column) {
			var cellHasNumericVal = false

			if (column.data.flatListItems.length) {
				for (var i = 0; i < column.data.flatListItems.length; i++) {
					// check if at least one flatListItem has number in valueKey

					var flItem = column.data.flatListItems[i]

					if (
						(flItem[valueKey] && typeof flItem[valueKey] === 'number') ||
						flItem[valueKey] === 0
					) {
						cellHasNumericVal = true
						break
					}
				}

				if (cellHasNumericVal) {
					var columnData = {
						key: valueKey,
						report_settings: {
							subtotal_formula_id: subtotal_formula_id,
						},
					}

					var colValueObj = rvSubtotalService.calculateColumn(
						column.data.flatListItems,
						columnData
					)
					column.data.value = colValueObj[valueKey]
				} else {
					column.data.value = null
				}
			} else {
				column.data.value = null
			}

			delete column.data.flatListItems
		})
	})

	return result
}

/*function getMatrixTotals(matrix) {

        var result = {
            rows: [],
            columns: [],
            total: 0
        };

        var rowTotal;

        matrix.forEach(function (rowItem) {

            rowTotal = 0;

            rowItem.items.forEach(function (columnItem, index) {

                rowTotal = rowTotal + columnItem.data.value;

                if (!result.columns[index]) {
                    result.columns[index] = {
                        column_name: columnItem.column_name,
                        total: 0
                    }
                }

                result.columns[index].total = result.columns[index].total + columnItem.data.value;

                result.total = result.total + columnItem.data.value

            });

            result.rows.push({
                row_name: rowItem.row_name,
                total: rowTotal
            })

        });

        return result

    }*/

/*function hideEmptyRows (matrix) {

        matrix.forEach(function (row, rowIndex) {

            var removeRow = true;

            row.items.forEach(function (column) {

                if (column.data.value) {
                    removeRow = false;
                }

            });

            if (removeRow) {
                matrix.splice(rowIndex, 1);
            }

        });

    }

    function hideEmptyCols (matrix, columns) {

        var colsToDelete = [];

        matrix.forEach(function (row) {

            var i;
            for (i = 0; i < columns.length; i++) {

                if (colsToDelete.indexOf(columns[i]) < 0 && !row.items[i].data.value) {

                    columns.splice();
                    colsToDelete.push(columns[i]);

                }

            }

        });

        matrix.forEach(function (row) {

            row.items.forEach(function (column, colIndex) {

                if (colsToDelete.indexOf(column.column_name) > -1) {
                    row.items.splice(colIndex, 1)
                }

            });

        });

        return columns;
    }*/

export default {
	getMatrixUniqueValues: getMatrixUniqueValues,
	getMatrix: getMatrix,
	//getMatrixTotals: getMatrixTotals,

	/*hideEmptyRows: hideEmptyRows,
        hideEmptyCols: hideEmptyCols*/
}
