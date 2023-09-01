/**
 * Created by sergey on 14.05.16.
 */

var getView = function () {
	var data

	if (localStorage.getItem('view')) {
		data = JSON.parse(localStorage.getItem('view'))
	} else {
		data = {
			table: {
				columns: [
					{ key: 'name', options: { styles: { width: 108 }, sort: 'ASC' } },
					{
						key: 'short_name',
						options: { styles: { width: 138 }, sort: null },
					},
					{ id: 5, options: { styles: { width: 120 }, sort: null } },
				],
				filters: [{ id: 5, options: { query: 'russia', enabled: false } }],
				folding: false,
				grouping: [
					{
						id: 7,
						options: {
							styles: { width: 178 },
							sort: 'DESC',
							isFolded: false,
						},
					},
				],
				sorting: {
					group: {
						id: 5,
						key: null,
						sort: 'DESC',
					},
					column: {
						id: null,
						key: 'name',
						sort: 'ASC',
					},
				},
			},
			tableAdditions: {
				additionsType: '', //editor, table
				foreignEntityId: 1,
				entityType: 'transaction',
				table: {
					columns: [
						{
							key: 'transaction_class',
							options: { styles: { width: 108 }, sort: 'ASC' },
						},
						{
							key: 'transaction_currency',
							options: { styles: { width: 140 }, sort: null },
						},
					],
					filters: [],
					sorting: {
						column: {
							key: 'transaction_class',
							sort: 'ASC',
						},
					},
				},
			},
			tabs: [
				{
					id: 1,
					name: 'General',
					layout: {
						columns: 3,
						rows: 2,
						fields: [
							{
								name: 'Name',
								row: 1,
								column: 1,
								colspan: 1,
								type: 'field',
							},
							{
								name: 'Notes',
								row: 1,
								column: 2,
								colspan: 1,
								type: 'field',
							},
							{
								row: 1,
								column: 3,
								colspan: 1,
								type: 'empty',
							},
							{
								row: 2,
								column: 1,
								colspan: 1,
								type: 'empty',
							},
							{
								row: 2,
								column: 2,
								colspan: 1,
								type: 'empty',
							},
							{
								id: 6,
								row: 2,
								column: 3,
								colspan: 1,
								type: 'field',
							},
						],
					},
				},
				{
					id: 2,
					name: 'Attributes',
					layout: {
						columns: 2,
						rows: 1,
						fields: [
							{
								id: 1,
								row: 1,
								column: 1,
								colspan: 1,
								type: 'field',
							},
							{
								id: 7,
								row: 1,
								column: 2,
								colspan: 1,
								type: 'field',
							},
						],
					},
				},
				{
					id: 3,
					name: 'Custom',
					layout: {
						columns: 1,
						rows: 1,
						fields: [
							{
								name: 'Short name',
								row: 1,
								column: 1,
								colspan: 1,
								type: 'field',
							},
						],
					},
				},
			],
		}
		localStorage.setItem('view', JSON.stringify(data))
	}

	return new Promise(function (resolve, reject) {
		resolve(data)
	})
}

var save = function (view) {
	return new Promise(function (resolve, reject) {
		localStorage.setItem('view', JSON.stringify(view))
		resolve(undefined)
	})
}

export default {
	getView: getView,
	save: save,
}
