/**
 * Created by szhitenev on 30.06.2016.
 */

import logService from '@/angular/core/services/logService'
import evDataHelper from '../../helpers/ev-data.helper'

import metaService from '../../services/metaService'

export default function () {
	return {
		restrict: 'A',
		scope: {
			evDataService: '=',
			evEventService: '=',
		},
		link: function (scope, elem, attrs) {
			scope.entityType = scope.evDataService.getEntityType()
			scope.isReport = metaService.isReport(scope.entityType)

			if (scope.isReport) {
			} else {
				var handler = function (event) {



					console.time('Copying to buffer')

					var items = scope.evDataService
						.getProjection()
						.filter(function (item) {
							return item.___is_activated
						})

					var columns = scope.evDataService.getColumns()

					if (items.length) {
						//;

						var result = '<table>'

						var row = '<tr>'

						columns.forEach(function (column) {
							row = row + '<td>' + column.name + '</td>'
						})

						row = row + '</tr>'
						result = result + row

						items.forEach(function (item) {
							row = '<tr>'

							columns.forEach(function (column) {
								if (column.hasOwnProperty('key')) {
									if (item[column.key]) {
										row = row + '<td>' + item[column.key] + '</td>'
									} else {
										row = row + '<td></td>'
									}
								} else {
									item.attributes.forEach(function (attr) {
										if (attr.attribute_type_object.id === column.id) {
											if (attr.attribute_type_object.value_type === 10) {
												if (attr.value_string) {
													row = row + '<td>' + attr.value_string + '</td>'
												} else {
													row = row + '<td></td>'
												}
											}

											if (attr.attribute_type_object.value_type === 20) {
												if (attr.value_float) {
													row = row + '<td>' + attr.value_float + '</td>'
												} else {
													row = row + '<td></td>'
												}
											}

											if (attr.attribute_type_object.value_type === 30) {
												if (attr.classifier_object) {
													row =
														row + '<td>' + attr.classifier_object.name + '</td>'
												} else {
													row = row + '<td></td>'
												}
											}

											if (attr.attribute_type_object.value_type === 40) {
												if (attr.value_date) {
													row = row + '<td>' + attr.value_date + '</td>'
												} else {
													row = row + '<td></td>'
												}
											}
										}
									})
								}
							})

							row = row + '</tr>'
							result = result + row
						})
						result = result + '</table'



						if (event.clipboardData) {
							event.clipboardData.setData('text/html', result)
						}

						event.preventDefault() // We want our data, not data from any selection, to be written to the clipboard

						console.timeEnd('Copying to buffer')
					}
				}

				document.addEventListener('copy', handler)

				$(document).bind('copy', handler)

				scope.$on('$destroy', function () {
					$(document).unbind('copy')
					document.removeEventListener('copy')
				})
			}
		},
	}
}
