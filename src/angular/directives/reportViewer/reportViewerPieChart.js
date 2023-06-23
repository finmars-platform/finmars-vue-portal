import rvDataHelper from '../../helpers/rv-data.helper'
import rvChartsHelper from '../../helpers/rv-charts.helper'
import renderHelper from '../../helpers/render.helper'

import evEvents from '../../services/entityViewerEvents'

export default function (d3) {
	return {
		restriction: 'E',
		templateUrl:
			'views/directives/reportViewer/report-viewer-pie-chart-view.html',
		scope: {
			rvChartsSettings: '=',
			evDataService: '=',
			evEventService: '=',
		},
		link: function (scope, elem, attr) {
			scope.activeItem = null

			scope.readyStatuses = {
				chartIsReady: false,
				legendsAreReady: false,
			}

			scope.showBarTooltip = false

			var chartData = []
			scope.chartDataWithPosNums = []
			scope.chartDataWithNegNums = []

			scope.viewContext = scope.evDataService.getViewContext()
			scope.dashboardFilterCollapsed = true

			var mainElem = elem[0].querySelector('.report-viewer-charts')
			var chartHolderElem = elem[0].querySelector('.report-viewer-chart-holder')

			/*if (scope.rvChartsSettings.chart_custom_name) {
                    scope.chartName = scope.rvChartsSettings.chart_custom_name;
                } else {
                    scope.chartName = scope.rvChartsSettings.component_name;
                }*/

			var componentHeight = mainElem.clientHeight
			var componentWidth = mainElem.offsetWidth
			var sizeReductionRatio = scope.rvChartsSettings.pie_size_percent
				? scope.rvChartsSettings.pie_size_percent / 100
				: 1

			var chart_form = scope.rvChartsSettings.chart_form
			if (!chart_form) {
				chart_form = 'doughnut'
			}

			var nameKey = scope.rvChartsSettings.group_attr
			var numberKey = scope.rvChartsSettings.number_attr
			var fieldValueCalcFormulaId = parseInt(
				scope.rvChartsSettings.group_number_calc_formula
			)

			scope.showLegends = scope.rvChartsSettings.show_legends
			var legendsPosition = scope.rvChartsSettings.legends_position

			scope.pieChartLayout = 'row'
			scope.pieChartLayoutAlign = 'center start'
			if (legendsPosition === 'bottom') {
				scope.pieChartLayout = 'column'
				scope.pieChartLayoutAlign = 'start center'
			}

			var legendsColumnsNumber = scope.rvChartsSettings.legends_columns_number
			if (!legendsColumnsNumber) {
				legendsColumnsNumber = 1
			}

			scope.number_format = scope.rvChartsSettings.number_format

			var chartMargin = {
				top: 40,
				right: 0,
				bottom: 0,
				left: 0,
			}

			var changeActiveObject = function (partName) {
				var activeObject = scope.evDataService.getActiveObject()

				activeObject[nameKey] = partName

				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			var getDataForCharts = function () {
				chartData = []
				scope.chartDataWithNegNums = []

				var flatList = rvDataHelper.getFlatStructure(scope.evDataService)
				var itemList = flatList.filter(function (item) {
					return item.___type === 'object'
				})

				chartData = rvChartsHelper.getDataForChartsFromFlatList(
					itemList,
					nameKey,
					numberKey,
					fieldValueCalcFormulaId
				)

				scope.chartDataWithPosNums = chartData.filter(function (cData) {
					if (cData.numericValue > 0) {
						return true
					}

					if (cData.numericValue < 0) {
						cData.numericValue = Math.abs(cData.numericValue)
						scope.chartDataWithNegNums.push(cData)
					}

					return false
				})

				var cDataNumber = 0.1

				scope.chartDataWithPosNums.forEach(function (cData) {
					cData.colorNumber = cDataNumber

					if (cDataNumber === 1) {
						cDataNumber = 0.1
					} else {
						cDataNumber = (cDataNumber + 0.1).toFixed(1)
						cDataNumber = parseFloat(cDataNumber)
					}
				})

				cDataNumber = 0.1

				scope.chartDataWithNegNums.forEach(function (cData) {
					cData.colorNumber = cDataNumber

					if (cDataNumber === 1) {
						cDataNumber = 0.1
					} else {
						cDataNumber = (cDataNumber + 0.1).toFixed(1)
						cDataNumber = parseFloat(cDataNumber)
					}
				})
			}

			var getDataForLegends = function () {
				var posNumsTotal = 0
				var negNumsTotal = 0

				scope.chartDataWithPosNums.forEach(function (CDItem) {
					posNumsTotal += CDItem.numericValue
				})

				scope.chartDataWithNegNums.forEach(function (CDItem) {
					negNumsTotal += CDItem.numericValue
				})

				if (posNumsTotal > 0) {
					scope.chartDataWithPosNums.forEach(function (chartPart) {
						chartPart.percentage = (
							(chartPart.numericValue / posNumsTotal) *
							100
						).toFixed(0)
					})
				}

				if (negNumsTotal > 0) {
					scope.chartDataWithNegNums.forEach(function (chartPart) {
						chartPart.percentage = (
							(chartPart.numericValue / negNumsTotal) *
							100
						).toFixed(0)
					})
				}
			}

			scope.getLegendBackgroundColor = function (colorNum, isPositive) {
				var backStyle = ''
				var backColor = ''

				/*if (isPositive) {
                        backColor = getPosPartColor(legendName);
                    } else {
                        backColor = getNegPartColor(legendName);
                    }*/
				backColor = getPartColor(colorNum)

				//if (legendName && backColor) {
				if (colorNum && backColor) {
					backStyle = 'background-color: ' + backColor
				}

				return backStyle
			}

			scope.getLegendTextStyle = function () {
				var styleString = ''

				if (scope.rvChartsSettings.legends_font_size) {
					styleString +=
						'font-size: ' + scope.rvChartsSettings.legends_font_size + 'px;'
				}

				return styleString
			}

			scope.setLegendsUlStyle = function () {
				var style = '-webkit-column-count: ' + legendsColumnsNumber + ';'
				style = style + ' -moz-column-count:' + legendsColumnsNumber + ';'
				style = style + ' column-count:' + legendsColumnsNumber + ';'

				return style
			}

			scope.getPieChartGlobalClasses = function () {
				var pieChartCompClasses = ''
				switch (legendsPosition) {
					case 'right':
						pieChartCompClasses = 'pie-chart-right-legends'
						break
					case 'bottom':
						pieChartCompClasses = 'pie-chart-bottom-legends'
						break
				}

				return pieChartCompClasses
			}

			scope.getTooltipStyle = function () {
				var tStyle = ''

				if (scope.rvChartsSettings.tooltip_font_size) {
					if (scope.rvChartsSettings.tooltip_font_size > 0) {
						tStyle =
							'font-size: ' + scope.rvChartsSettings.tooltip_font_size + 'px; '
					} else {
						tStyle = 'font-size: 10px; '
					}
				}

				return tStyle
			}

			scope.formatValue = function (val, isNegativeNum) {
				if (isNegativeNum) {
					val = -Math.abs(val)
				}

				if (scope.number_format) {
					return renderHelper.formatValue(
						{
							value: val,
						},
						{
							key: 'value',
							report_settings: scope.number_format,
						}
					)
				} else {
					return val
				}
			}

			/*var colorsList = [
                    '#ab3939', '#70ab39', '#ab6039', '#3972ab', '#ab9039', '#a739ab', '#95ab39', '#6739ab', '#39ab99', '#623879',
                    '#3946ab', '#39ab3d', '#7c39ab', '#5e0c0c', '#3992ab', '#ab3979', '#ab3939', '#60c877', '#3015f7', '#ffcf00',
                    '#4c334d'
                ];*/

			// need to be outside of draw chart function to use for legends rendering
			/*var getPosPartColor;
                var getNegPartColor;*/
			var getPartColor

			var drawChart = function () {
				var posNumRadius
				var svgSize
				var chartHeight = componentHeight - chartMargin.top - chartMargin.bottom
				var chartWidth = componentWidth - chartMargin.left - chartMargin.right

				if (chartHeight < chartWidth) {
					posNumRadius = (chartHeight / 2) * sizeReductionRatio
					svgSize = chartHeight
				} else {
					posNumRadius = (chartWidth / 2) * sizeReductionRatio
					svgSize = chartWidth
				}

				/*getPosPartColor = d3.scaleOrdinal()
                        .domain(d3.map(scope.chartDataWithPosNums, function (d) {return d.name}))
                        .range(d3.schemeCategory10);*/
				getPartColor = d3.scaleSequential(d3.interpolatePuOr).domain([0, 1])

				var posArc = d3
					.arc()
					.innerRadius(posNumRadius * 0.8)
					.outerRadius(posNumRadius)

				if (chart_form === 'pie') {
					posArc = d3.arc().innerRadius(0).outerRadius(posNumRadius)
				}

				var pie = d3
					.pie()
					.sort(null)
					.value(function (d) {
						return d.numericValue
					})

				chartHolderElem.style.minWidth = svgSize + 'px'
				chartHolderElem.style.width = svgSize + 'px'
				chartHolderElem.style.height = svgSize + 'px'

				var svg = d3
					.select(chartHolderElem)
					.append('svg')
					.attr('width', svgSize + 'px')
					.attr('height', svgSize + 'px')
					.attr('class', 'pie-chart-elem')

				// draw doughnut for positive numbers
				var posChartWrapingG = svg
					.append('g')
					.attr('class', 'pie-chart-positive-nums-circle')
					.attr(
						'transform',
						'translate(' + svgSize / 2 + ',' + svgSize / 2 + ')'
					)

				posChartWrapingG
					.selectAll('g')
					.data(pie(scope.chartDataWithPosNums))
					.enter()
					.append('g')

				posChartWrapingG
					.selectAll('g')
					.append('path')
					.attr('d', posArc)
					.style('stroke-width', '2px')
					.attr('fill', function (d) {
						// return getPosPartColor(d.data.colorNumber)
						return getPartColor(d.data.colorNumber)
					})

				posChartWrapingG
					.selectAll('path')
					.on('click', function (d) {
						changeActiveObject(d.data.name)
					})
					.on('mouseover', function (d) {
						d3.select(this).style('opacity', 0.5)

						var pieTooltipElem = document.createElement('div')
						pieTooltipElem.classList.add(
							'chart-tooltip1',
							'dashboard-bar-chart-tooltip'
						)

						pieTooltipElem.innerText =
							'Name: ' +
							d.data.name +
							';' +
							'\n' +
							'Number: ' +
							scope.formatValue(d.data.numericValue) +
							';'
						pieTooltipElem.style.cssText = scope.getTooltipStyle()
						document.body.appendChild(pieTooltipElem)
					})
					.on('mousemove', function () {
						var pieTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)

						var tElemWidth = pieTooltipElem.offsetWidth
						pieTooltipElem.style.top = d3.event.pageY - 10 + 'px'
						pieTooltipElem.style.left = d3.event.pageX - tElemWidth - 5 + 'px' // subtractions applied to place tooltip to the left of cursor
					})
					.on('mouseout', function () {
						d3.select(this).style('opacity', 1)

						var pieTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)
						document.body.removeChild(pieTooltipElem)
					})

				// < draw doughnut for positive numbers >

				// draw doughnut for negative numbers
				if (
					chart_form === 'doughnut' &&
					scope.chartDataWithNegNums.length > 0
				) {
					var negNumsRadius = posNumRadius * 0.75
					var negNumsSpaces = posNumRadius - negNumsRadius

					var negArc = d3
						.arc()
						.innerRadius(negNumsRadius * 0.75)
						.outerRadius(negNumsRadius)

					var negChartWrapingG = svg
						.append('g')
						.attr('class', 'pie-chart-negative-nums-circle')
						// .attr('transform', 'translate(' + (negNumsRadius + negNumsSpaces) + ',' + (negNumsRadius + negNumsSpaces) + ')'); // TODO can delete after testing on negative numbers pie
						.attr(
							'transform',
							'translate(' + svgSize / 2 + ',' + svgSize / 2 + ')'
						)

					negChartWrapingG
						.selectAll('g')
						.data(pie(scope.chartDataWithNegNums))
						.enter()
						.append('g')

					negChartWrapingG
						.selectAll('g')
						.append('path')
						.attr('d', negArc)
						.style('stroke-width', '2px')
						.attr('fill', function (d) {
							return getPartColor(d.data.colorNumber)
						})

					negChartWrapingG
						.selectAll('path')
						.on('click', function (d) {
							changeActiveObject(d.data.name)
						})
						.on('mouseover', function (d) {
							d3.select(this).style('opacity', 0.5)

							var pieTooltipElem = document.createElement('div')
							pieTooltipElem.classList.add(
								'chart-tooltip1',
								'dashboard-bar-chart-tooltip'
							)
							pieTooltipElem.style.cssText = scope.getTooltipStyle()

							document.body.appendChild(pieTooltipElem)

							pieTooltipElem.innerHTML =
								'Name: ' +
								d.data.name +
								';' +
								'<br>' +
								"Number: <span class='chart-hover-tolltip-number'>" +
								scope.formatValue(d.data.numericValue, true) +
								'</span>;'
						})
						.on('mousemove', function () {
							var pieTooltipElem = document.querySelector(
								'.dashboard-bar-chart-tooltip'
							)

							var tElemWidth = pieTooltipElem.offsetWidth
							pieTooltipElem.style.top = d3.event.pageY - 10 + 'px'
							pieTooltipElem.style.left = d3.event.pageX - tElemWidth - 5 + 'px' // subtractions applied to place tooltip to the left of cursor
						})
						.on('mouseout', function () {
							d3.select(this).style('opacity', 1)

							var pieTooltipElem = document.querySelector(
								'.dashboard-bar-chart-tooltip'
							)
							document.body.removeChild(pieTooltipElem)
						})
				}

				// < draw doughnut for negative numbers >
			}

			var init = function () {
				scope.evDataService.setActiveObject({})

				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						var chartElem = chartHolderElem.querySelector('.pie-chart-elem')

						if (chartElem) {
							chartHolderElem.removeChild(chartElem)
						}

						getDataForCharts()

						drawChart()

						if (scope.showLegends) {
							getDataForLegends()
							scope.readyStatuses.legendsAreReady = true
						}

						scope.readyStatuses.chartIsReady = true

						scope.$apply()
					}
				)

				if (scope.evDataService.didDataLoadEnd()) {
					getDataForCharts()

					drawChart()

					if (scope.showLegends) {
						getDataForLegends()
						scope.readyStatuses.legendsAreReady = true
					}

					scope.readyStatuses.chartIsReady = true

					//scope.$apply();
				}
			}

			init()
		},
	}
}
