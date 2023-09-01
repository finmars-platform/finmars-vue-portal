import rvDataHelper from '../../helpers/rv-data.helper'
import rvChartsHelper from '../../helpers/rv-charts.helper'
import renderHelper from '../../helpers/render.helper'

import evEvents from '../../services/entityViewerEvents'

export default function (d3) {
	return {
		restriction: 'E',
		templateUrl:
			'views/directives/reportViewer/report-viewer-bars-chart-view.html',
		scope: {
			rvChartsSettings: '=',
			evDataService: '=',
			evEventService: '=',
		},
		link: function (scope, elem, attr) {
			scope.activeItem = null

			scope.readyStatus = false

			scope.showBarTooltip = false

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
			var barsMinWidth = scope.rvChartsSettings.min_bar_width
			var barsMaxWidth = scope.rvChartsSettings.max_bar_width
			var barWidth // used for words wrap function

			var ticksNumber
			if (!scope.rvChartsSettings.autocalc_ticks_number) {
				ticksNumber = scope.rvChartsSettings.ticks_number
			}

			var cropTickText = scope.rvChartsSettings.crop_tick_text

			var nameKey = scope.rvChartsSettings.bar_name_key
			var numberKey = scope.rvChartsSettings.bar_number_key
			var fieldValueCalcFormulaId = parseInt(
				scope.rvChartsSettings.group_number_calc_formula
			)

			var sortingType = scope.rvChartsSettings.sorting_type
			var sortingValueType = scope.rvChartsSettings.sorting_value_type

			var chartData = []
			var chartMargin = {}

			if (scope.rvChartsSettings.bars_direction === 'bottom-top') {
				// for vertical bars chart
				chartMargin.top = 30
				chartMargin.bottom = 40

				if (scope.rvChartsSettings.ordinate_position === 'left') {
					chartMargin.right = 30
					chartMargin.left = 40
				} else {
					chartMargin.right = 40
					chartMargin.left = 30
				}
			} else {
				// for horizontal bars chart
				chartMargin.top = 40
				chartMargin.bottom = 20

				if (scope.rvChartsSettings.ordinate_position === 'left') {
					chartMargin.right = 20
					chartMargin.left = 60
				} else {
					chartMargin.right = 60
					chartMargin.left = 20
				}

				if (scope.rvChartsSettings.abscissa_position === 'bottom') {
					chartMargin.top = 20
					chartMargin.bottom = 30
				}
			}

			var bandPadding = 0.2

			var changeActiveObject = function (columnName) {
				var activeObject = scope.evDataService.getActiveObject() || {}




				activeObject[nameKey] = columnName

				scope.evDataService.setActiveObject(activeObject)
				scope.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			}

			var getDataForChart = function () {
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
			}

			var sortChartData = function () {
				if (sortingType) {
					var sortCDDescending = function (a, b) {
						var aData
						var bData

						if (sortingValueType === 'number') {
							aData = a.numericValue
							bData = b.numericValue
						} else {
							aData = a.name.toLowerCase()
							bData = b.name.toLowerCase()
						}

						if (aData < bData) {
							return -1
						}
						if (aData > bData) {
							return 1
						}
						return 0
					}

					var sortCDAscending = function (a, b) {
						var aData
						var bData

						if (sortingValueType === 'number') {
							aData = a.numericValue
							bData = b.numericValue
						} else {
							aData = a.name.toLowerCase()
							bData = b.name.toLowerCase()
						}

						if (aData > bData) {
							return -1
						}
						if (aData < bData) {
							return 1
						}
						return 0
					}

					switch (sortingType) {
						case 'ascending':
							chartData.sort(sortCDAscending)
							break
						case 'descending':
							chartData.sort(sortCDDescending)
							break
					}
				}
			}

			var getTooltipStyle = function () {
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

			scope.formatValue = function (val) {
				if (scope.rvChartsSettings.number_format) {
					return renderHelper.formatValue(
						{
							value: val,
						},
						{
							key: 'value',
							report_settings: scope.rvChartsSettings.number_format,
						}
					)
				} else {
					return val
				}
			}

			// functions-helpers
			var returnNumericValue = function (d) {
				return d.numericValue
			}

			var getMinValueForAxis = function () {
				return Math.min(0, d3.min(chartData, returnNumericValue))
			}

			var cropText = function (textContent) {
				if (cropTickText && textContent && textContent.length > cropTickText) {
					var croppedString = textContent.slice(0, cropTickText) + '...'

					return croppedString
				}

				return textContent
			}

			var cropTextInElems = function (textElems) {
				textElems.forEach(function (textElem) {
					var textContent = textElem.textContent

					var croppedString = cropText(textContent)

					d3.select(textElem).text(croppedString)
				})
			}

			var wrapWords = function (textElems, maxWidthForText) {
				textElems.forEach(function (textElem) {
					var text = $(textElem)

					var words = text.text().split(/\s+/).reverse(),
						word,
						line = [],
						lineNumber = 0,
						lineHeight = 1.1,
						y = text.attr('y'),
						dy = parseFloat(text.attr('dy'))
					text.text(null)

					var tspan = d3
						.select(textElem)
						.append('tspan')
						.attr('x', 0)
						.attr('y', y)
						.attr('dy', dy + 'em')

					while ((word = words.pop())) {
						line.push(word)
						tspan.text(line.join(' '))

						if (
							line.length > 1 &&
							tspan.node().getComputedTextLength() > maxWidthForText
						) {
							line.pop()
							tspan.text(line.join(' '))
							line = [word]
							lineNumber += 1
							var tSpanDY = lineNumber * lineHeight + dy

							d3.select(textElem)
								.append('tspan')
								.attr('x', 0)
								.attr('y', y)
								.attr('dy', tSpanDY + 'em')
								.text(word)
						}
					}
				})
			}
			// < helping functions >

			var formatAxisText = function (textElems, barWidth) {
				cropTextInElems(textElems)
				//wrapWords(textElems, barWidth);
				if (scope.rvChartsSettings.bars_direction === 'bottom-top') {
					wrapWords(textElems, barWidth)
				}
			}

			var formatThousands = d3.format('~s')

			var adjustWidthForTicksText = function () {
				var textElem = document.createElement('span')
				textElem.style.fontSize = '10px'
				mainElem.appendChild(textElem)

				var longestName = ''

				for (var i = 0; i < chartData.length; i++) {
					var cData = chartData[i]

					if (cData.name.length > longestName.length) {
						longestName = cData.name
					}
				}

				longestName = cropText(longestName)

				textElem.innerText = longestName

				var textWidth = textElem.offsetWidth

				if (scope.rvChartsSettings.ordinate_position === 'right') {
					if (textWidth > chartMargin.right - 40) {
						chartMargin.right = textWidth + 40
					}
				} else {
					if (textWidth > chartMargin.left - 40) {
						chartMargin.left = textWidth + 40
					}
				}

				mainElem.removeChild(textElem)
			}

			var drawChartWithVerticalCols = function () {
				/*var chartNameElemHeight = elem[0].querySelector('.dashboard-chart-name-h').clientHeight;
                    chartMargin.top += chartNameElemHeight;*/

				var chartWidth = componentWidth - chartMargin.right - chartMargin.left
				var barPaddingInPx

				barPaddingInPx = (chartWidth / chartData.length) * bandPadding
				barWidth = chartWidth / chartData.length - barPaddingInPx

				// check if chart has enough width
				if (chartData.length > 0 && barsMinWidth && barsMaxWidth) {
					if (barWidth < barsMinWidth) {
						chartWidth = (barsMinWidth + barPaddingInPx) * chartData.length
						componentWidth = chartWidth + chartMargin.right + chartMargin.left
					} else if (barWidth > barsMaxWidth) {
						chartWidth = (barsMaxWidth + barPaddingInPx) * chartData.length
						componentWidth = chartWidth + chartMargin.right + chartMargin.left
					}
				}
				// < check if chart has enough width >

				// declare height here because margin bottom can change earlier
				var chartHeight = componentHeight - chartMargin.bottom - chartMargin.top
				var chartWidth = componentWidth - chartMargin.right - chartMargin.left

				chartHolderElem.style.width = componentWidth + 'px'

				// ----------------------- make abscissa axis --------------------------

				var xScale = d3
					.scaleBand()
					.domain(
						chartData.map(function (d) {
							return d.name
						})
					)
					.range([chartMargin.left, componentWidth - chartMargin.right])
					.padding(bandPadding)

				var xAxisTranslate =
					'translate(0,' + (chartHeight + chartMargin.top) + ')' // abscissa at the bottom
				var horizontalAxis = d3.axisBottom(xScale).tickSizeOuter(0)

				if (scope.rvChartsSettings.abscissa_position === 'top') {
					xAxisTranslate = 'translate(0,' + (chartMargin.top - 10) + ')'
					horizontalAxis = d3.axisTop(xScale).tickSizeOuter(0)
				}

				var xAxis = function (g) {
					// append axis to svg element
					g.attr('transform', xAxisTranslate).call(horizontalAxis)
				}

				// < ----------------------- make abscissa axis -------------------------- >

				// -------------------- make ordinate axis ----------------------------

				var yScale = d3
					.scaleLinear()
					.domain([getMinValueForAxis(), d3.max(chartData, returnNumericValue)])
					.nice()
					.range([componentHeight - chartMargin.bottom, chartMargin.top])

				var yAxisTranslate = 'translate(' + chartMargin.left + ',0)' // ordinate to the left
				var verticalAxis = d3.axisLeft(yScale).tickFormat(formatThousands) // if we change ticks amount

				if (scope.rvChartsSettings.ordinate_position === 'right') {
					verticalAxis = d3.axisRight(yScale).tickFormat(formatThousands)
					yAxisTranslate =
						'translate(' + (chartWidth + chartMargin.left) + ',0)'
				}

				// check if ticks are located too close to each other
				if (ticksNumber && ticksNumber > 0) {
					verticalAxis = verticalAxis
						.ticks(ticksNumber)
						.tickFormat(formatThousands)
				} else {
					var axisTicksNumber = yScale.ticks().length

					if (axisTicksNumber && axisTicksNumber > 0) {
						if (Math.floor(chartHeight / axisTicksNumber) < 15) {
							// if tick height less that 15 pixels

							var newTicksNumber = Math.floor(axisTicksNumber / 2)
							verticalAxis = verticalAxis
								.ticks(newTicksNumber)
								.tickFormat(formatThousands)

							/*chartHeight = axisTicksNumber * 15;
                                componentHeight = chartHeight + chartMargin.top + chartMargin.bottom;

                                chartHolderElem.style.height = componentHeight + 'px';

                                yScale = d3.scaleLinear()
                                    .domain([getMinValueForAxis(), d3.max(chartData, returnNumericValue)]).nice()
                                    .range([chartHeight, chartMargin.top]);*/
						}
					}
				}

				// < check if ticks are located too close to each other >

				var yAxis = function (g) {
					// append axis to svg element
					g.attr('transform', yAxisTranslate)
						.call(verticalAxis)
						.call(function (g) {
							g.select('.domain').remove()
						})
				}

				// < -------------------- make ordinate axis ---------------------------- >

				var getBarHeight = function (d) {
					var calcBarHeight = Math.abs(yScale(0) - yScale(d.numericValue))

					if (calcBarHeight === 0) {
						return calcBarHeight
					} else {
						return Math.max(2, calcBarHeight)
					}
				}

				var svg = d3
					.select(chartHolderElem)
					.append('svg')
					.attr('width', componentWidth + 'px')
					.attr('height', componentHeight + 'px')
					.attr('viewBox', [0, 0, componentWidth, componentHeight])
					.attr('class', 'bars-chart-elem')

				svg
					.append('g')
					.attr('fill', 'steelblue')
					.selectAll('rect')
					.data(chartData)
					.join('rect')
					.attr('class', 'dashboard-rv-chart-bar')
					.attr('x', function (d) {
						return xScale(d.name)
					})
					.attr('y', function (d) {
						return yScale(Math.max(0, d.numericValue))
					})
					.attr('height', getBarHeight)
					.attr('width', xScale.bandwidth())

				// apply events to chart bars
				svg
					.selectAll('rect.dashboard-rv-chart-bar')
					.on('click', function (d) {
						changeActiveObject(d.name)
					})
					.on('mouseover', function (d) {
						d3.select(this).attr('fill', '#f4af8b')

						var barTooltipElem = document.createElement('div')
						barTooltipElem.classList.add(
							'chart-tooltip1',
							'dashboard-bar-chart-tooltip'
						)
						barTooltipElem.style.cssText = getTooltipStyle()

						document.body.appendChild(barTooltipElem)

						barTooltipElem.innerText =
							'Name: ' +
							d.name +
							';' +
							'\n' +
							'Number: ' +
							scope.formatValue(d.numericValue) +
							';'
					})
					.on('mousemove', function (d) {
						var barTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)

						var tElemWidth = barTooltipElem.offsetWidth
						barTooltipElem.style.top = d3.event.pageY - 10 + 'px'
						barTooltipElem.style.left = d3.event.pageX - tElemWidth - 5 + 'px' // subtractions applied to place tooltip to the left of cursor
					})
					.on('mouseout', function () {
						d3.select(this).attr('fill', 'steelblue')

						var barTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)
						document.body.removeChild(barTooltipElem)
					})
				// < apply events to chart bars >

				svg
					.append('g')
					.call(xAxis)
					.selectAll('text')
					.attr('class', 'svg-text-to-wrap')

				svg.append('g').call(yAxis)
			}

			var drawChartWithHorizontalCols = function () {
				/*var chartNameElemHeight = elem[0].querySelector('.dashboard-chart-name-h').clientHeight;
                    chartMargin.top += chartNameElemHeight;*/

				adjustWidthForTicksText()

				var chartHeight = componentHeight - chartMargin.top - chartMargin.bottom
				var chartWidth = componentWidth - chartMargin.left - chartMargin.right

				var barPaddingInPx

				barPaddingInPx = (chartHeight / chartData.length) * bandPadding
				barWidth = chartHeight / chartData.length - barPaddingInPx

				// check if chart has enough width
				if (chartData.length > 0 && barsMinWidth && barsMaxWidth) {
					if (barWidth < barsMinWidth) {
						chartHeight = (barsMinWidth + barPaddingInPx) * chartData.length
						componentHeight = chartHeight + chartMargin.top + chartMargin.bottom
					} else if (barWidth > barsMaxWidth) {
						chartHeight = (barsMaxWidth + barPaddingInPx) * chartData.length
						componentHeight = chartHeight + chartMargin.top + chartMargin.bottom
					}
				}
				// < check if chart has enough >

				chartHolderElem.style.height = componentHeight + 'px'
				chartHolderElem.style.width = componentWidth + 'px'

				// ----------------------- make abscissa axis --------------------------

				var xScale = d3
					.scaleLinear()
					.domain([getMinValueForAxis(), d3.max(chartData, returnNumericValue)])
					.nice()
					.range([chartMargin.left, componentWidth - chartMargin.right])

				var xAxisTranslate =
					'translate(0,' + (chartHeight + chartMargin.top + 10) + ')'
				var horizontalAxis = d3.axisBottom(xScale).tickFormat(formatThousands) // if we change ticks amount

				if (scope.rvChartsSettings.abscissa_position === 'top') {
					xAxisTranslate = 'translate(0,' + (chartMargin.top - 10) + ')' // abscissa at the top
					horizontalAxis = d3.axisTop(xScale).tickFormat(formatThousands)
				}

				// check if ticks are located too close to each other
				if (ticksNumber && ticksNumber > 0) {
					horizontalAxis = horizontalAxis
						.ticks(ticksNumber)
						.tickFormat(formatThousands)
				} else {
					var axisTicksNumber = xScale.ticks().length

					if (axisTicksNumber && axisTicksNumber > 0) {
						if (Math.floor(chartWidth / axisTicksNumber) < 15) {
							// if tick height less that 15 pixels

							var halfOfTicks = Math.floor(axisTicksNumber / 2)
							horizontalAxis = horizontalAxis
								.ticks(halfOfTicks)
								.tickFormat(formatThousands)

							/*chartHeight = axisTicksNumber * 15;
                                componentWidth = chartWidth + chartMargin.left + chartMargin.right;

                                chartHolderElem.style.height = componentWidth + 'px';

                                var xScale = d3.scaleBand()
                                    .domain([getMinValueForAxis(), d3.max(chartData, returnNumericValue)]).nice()
                                    .range([chartMargin.left, chartWidth]);*/
						}
					}
				}
				// < check if ticks are located too close to each other >

				var xAxis = function (g) {
					// append axis to svg elemen
					g.attr('transform', xAxisTranslate)
						.call(horizontalAxis)
						.call(function (g) {
							g.select('.domain').remove()
						})
				}
				// < ----------------------- make abscissa axis -------------------------- >

				// -------------------- make ordinate axis ----------------------------

				var yScale = d3
					.scaleBand()
					.domain(
						chartData.map(function (d) {
							return d.name
						})
					)
					.range([chartMargin.top, componentHeight - chartMargin.bottom])
					.padding(bandPadding)

				var verticalAxis = d3.axisLeft(yScale).tickSizeOuter(0)
				var yAxisTranslate = 'translate(' + (chartMargin.left - 30) + ',0)' // ordinate to the left

				if (scope.rvChartsSettings.ordinate_position === 'right') {
					yAxisTranslate =
						'translate(' + (chartWidth + chartMargin.left + 10) + ',0)'
					verticalAxis = d3.axisRight(yScale).tickSizeOuter(0)
				}

				var yAxis = function (g) {
					// append axis to svg element
					g.attr('transform', yAxisTranslate) // deducting 30 to move yAxis to the left from xAxis start
						.call(verticalAxis)
				}

				// < -------------------- make ordinate axis ---------------------------- >

				var getBarWidth = function (d) {
					var calcBarWidth = Math.abs(xScale(0) - xScale(d.numericValue))

					if (calcBarWidth === 0) {
						return calcBarWidth
					} else {
						return Math.max(2, calcBarWidth)
					}
				}

				var svg = d3
					.select(chartHolderElem)
					.append('svg')
					.attr('width', componentWidth + 'px')
					.attr('height', componentHeight + 'px')
					.attr('viewBox', [0, 0, componentWidth, componentHeight])
					.attr('class', 'bars-chart-elem')

				svg
					.append('g')
					.attr('fill', 'steelblue')
					.selectAll('rect')
					.data(chartData)
					.join('rect')
					.attr('class', 'dashboard-rv-chart-bar')
					.attr('x', function (d) {
						return xScale(Math.min(0, d.numericValue))
					})
					.attr('y', function (d) {
						return yScale(d.name)
					})
					.attr('height', yScale.bandwidth())
					.attr('width', getBarWidth)

				svg
					.selectAll('rect.dashboard-rv-chart-bar')
					.on('click', function (d) {
						changeActiveObject(d.name)
					})
					.on('mouseover', function (d) {
						d3.select(this).attr('fill', '#f4af8b')

						var barTooltipElem = document.createElement('div')
						barTooltipElem.classList.add(
							'chart-tooltip1',
							'dashboard-bar-chart-tooltip'
						)
						barTooltipElem.style.cssText = getTooltipStyle()

						document.body.appendChild(barTooltipElem)

						barTooltipElem.innerText =
							'Name: ' +
							d.name +
							';' +
							'\n' +
							'Number: ' +
							scope.formatValue(d.numericValue) +
							';'
					})
					.on('mousemove', function () {
						var barTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)

						var tElemWidth = barTooltipElem.offsetWidth
						barTooltipElem.style.top = d3.event.pageY - 10 + 'px'
						barTooltipElem.style.left = d3.event.pageX - tElemWidth - 5 + 'px' // subtractions applied to place tooltip to the left of cursor
					})
					.on('mouseout', function () {
						d3.select(this).attr('fill', 'steelblue')

						var barTooltipElem = document.querySelector(
							'.dashboard-bar-chart-tooltip'
						)
						document.body.removeChild(barTooltipElem)
					})

				svg.append('g').attr('class', 'bar-chart-axis').call(xAxis)

				svg
					.append('g')
					.attr('class', 'bar-chart-axis')
					.call(yAxis)
					.selectAll('text')
					.attr('class', 'svg-text-to-wrap')
			}

			var init = function () {
				scope.evDataService.setActiveObject({})

				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						var chartElem = chartHolderElem.querySelector('.bars-chart-elem')

						if (chartElem) {
							chartHolderElem.removeChild(chartElem)
						}

						getDataForChart()
						sortChartData()

						if (scope.rvChartsSettings.bars_direction === 'bottom-top') {
							drawChartWithVerticalCols()
						} else {
							drawChartWithHorizontalCols()
						}

						scope.readyStatus = true
						scope.$apply()

						var ticksTextToToWrap =
							chartHolderElem.querySelectorAll('.svg-text-to-wrap')
						formatAxisText(ticksTextToToWrap, barWidth)
					}
				)

				if (scope.evDataService.didDataLoadEnd()) {
					getDataForChart()
					sortChartData()
					if (scope.rvChartsSettings.bars_direction === 'bottom-top') {
						drawChartWithVerticalCols()
					} else {
						drawChartWithHorizontalCols()
					}

					scope.readyStatus = true
					//scope.$apply();

					var ticksTextToToWrap =
						chartHolderElem.querySelectorAll('.svg-text-to-wrap')
					formatAxisText(ticksTextToToWrap, barWidth)
				}
			}

			init()
		},
	}
}
