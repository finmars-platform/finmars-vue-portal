/**
 * @module complexDatepickerDirective
 */

import metaService from '@/angular/services/metaService'
import expressionService from '@/angular/services/expression.service'

import popupEvents from '@/angular/services/events/popupEvents'
import evEvents from '@/angular/services/entityViewerEvents'

export default function ($mdDialog, pickmeup, toastNotificationService) {
	return {
		restrict: 'E',
		scope: {
			date: '=', // also used as dateFrom if datepicker in rangeOfDates mode
			datepickerOptions: '=',
			secondDate: '=',
			secondDatepickerOptions: '=',
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			popupEventService: '=',
		},
		templateUrl:
			'views/directives/customInputs/complexDatepickers/complex-datepicker-view.html',
		link: function (scope, elem, attrs) {
			scope.rangeOfDates = scope.secondDate !== undefined
			// scope.inceptionInput = "inception";

			const entityType = scope.evDataService.getEntityType()
			const isReport = metaService.isReport(entityType)
			let pickmeupOptions = {
				default_date: false,
				flat: true,
				format: 'Y-m-d',
			}

			let firstCalendarElem
			let firstDate, secondDate, secondCalendarElem
			let useFromAboveEventIndex, attributeKey

			scope.inputsModels = {
				date: scope.date,
				secondDate: null,
			}

			scope.openEditExpressionDialog = function ($event, dateNumber) {
				/* if (scope.datepickerOptions.datepickerMode !== 'expression') {

						scope.datepickerOptions.datepickerMode = 'expression';
						scope.datepickerOptions.expression = undefined;

						setTimeout(() => {
							scope.callbackMethod()
						}, 500);

					} */
				let dateProp = 'date'
				let datepickerOptsProp = 'datepickerOptions'

				if (dateNumber === 2) {
					dateProp = 'secondDate'
					datepickerOptsProp = 'secondDatepickerOptions'
				}

				const datepickerOptionsCopy = JSON.parse(
					JSON.stringify(scope[datepickerOptsProp])
				)

				let eeData = { returnExpressionResult: true }

				if (isReport) {
					eeData.entityType = entityType
					eeData.attributeDataService = scope.attributeDataService
				}

				const dialogContainerWrapElem = document.querySelector(
					'.dialog-containers-wrap'
				)

				$mdDialog
					.show({
						controller: 'ExpressionEditorDialogController as vm',
						templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
						parent: dialogContainerWrapElem,
						targetEvent: $event,
						autoWrap: true,
						multiple: true,
						locals: {
							item: { expression: datepickerOptionsCopy.expression },
							data: eeData,
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							scope[datepickerOptsProp].expression = res.data.item.expression

							// if no expression entered, turn off expression mode
							scope[datepickerOptsProp].datepickerMode = 'datepicker'

							if (scope[datepickerOptsProp].expression) {
								scope[datepickerOptsProp].datepickerMode = 'expression'

								const expressionData = {
									expression: scope[datepickerOptsProp].expression,
									is_eval: true,
								}

								expressionService
									.getResultOfExpression(expressionData)
									.then(function (resData) {
										if (moment(resData.result, 'YYYY-MM-DD', true).isValid()) {
											scope[dateProp] = resData.result
											scope.inputsModels[dateProp] = scope[dateProp]
											// scope[datepickerOptsProp].date = resData.result;

											var exprDate = new Date(scope[dateProp])

											if (dateNumber === 1) {
												firstDate = exprDate
												pickmeup(firstCalendarElem).set_date(exprDate)
												if (scope.rangeOfDates)
													pickmeup(secondCalendarElem).update()
											} else if (dateNumber === 2) {
												secondDate = exprDate
												pickmeup(secondCalendarElem).set_date(exprDate)
												if (scope.rangeOfDates)
													pickmeup(firstCalendarElem).update()
											}

											scope.$apply()
											// if (scope.callbackMethod) scope.callbackMethod();
										} else {
											const errorMessage = `Invalid ${
												dateNumber === 2 ? 'second' : 'first'
											} date`
											toastNotificationService.error(errorMessage)
											/* scope[dateProp] = null;
										scope[datepickerOptsProp].date = null;

										if (dateNumber === 1) {
											firstDate = null;
											pickmeup(firstCalendarElem).set_date();
											if (scope.rangeOfDates) pickmeup(secondCalendarElem).update();

										} else {
											secondDate = null;
											pickmeup(firstCalendarElem).update();
											pickmeup(secondCalendarElem).set_date();
										} */
										}
									})
									.catch((error) => {
										const errorMessage = `Invalid expression for ${
											dateNumber === 2 ? 'second' : 'first'
										} date`
										toastNotificationService.error(errorMessage)
									})
							}
						}
					})
			}

			/* const onDateFromPickmeupChange = event => {

					let datesRange = [];

					const dateFrom = event.detail.date[0];
					const secondCalendarDates = pickmeup(secondCalendarElem).get_date();
					const secondDate = secondCalendarDates[1];
					// const dateFrom = firstCalendarDates[0];

					datesRange.push(secondDate);
					datesRange.push(dateFrom);

					let reversedDatesRange = [...[], ...datesRange];
					reversedDatesRange.reverse();

					pickmeup(firstCalendarElem).set_date(datesRange);
					pickmeup(secondCalendarElem).set_date(reversedDatesRange);

				};

				const onDateToPickmeupChange = event => {

					let datesRange = [];

					const firstCalendarDates = pickmeup(firstCalendarElem).get_date();
					const dateFrom = firstCalendarDates[0];
					const secondDate = event.detail.date[1];
					// const dateFrom = firstCalendarDates[0];

					datesRange.push(dateFrom);
					datesRange.push(secondDate);

					pickmeup(firstCalendarElem).set_date(datesRange);
					pickmeup(secondCalendarElem).set_date(datesRange);

				}; */

			const initCalendar = function () {
				/* const pickmeupMode = scope.rangeOfDates ? 'range' : 'single';

					let calendarElem,
						dateProp,
						datepickerOptsProp;

					if (dateNumber === 2) {

						dateProp = 'secondDate';
						datepickerOptsProp = 'secondDatepickerOptions';
						secondCalendarElem = elem[0].querySelector(".secondCalendar");
						calendarElem = secondCalendarElem;

					} else { // first date or date from

						dateProp = 'date';
						datepickerOptsProp = 'datepickerOptions';
						firstCalendarElem = elem[0].querySelector(".firstCalendar");
						calendarElem = firstCalendarElem;

					} */
				firstCalendarElem = elem[0].querySelector('.firstCalendar')

				const pOpts = {
					...{ date: new Date(scope.date) },
					...pickmeupOptions,
				}

				pickmeup(firstCalendarElem, pOpts)

				/* calendarElem.addEventListener("pickmeup-change", event => {

						scope[dateProp] = event.detail.formatted_date;
						scope[datepickerOptsProp].datepickerMode = 'datepicker';

						scope.$apply();

					}); */

				firstCalendarElem.addEventListener('pickmeup-change', (event) => {
					document.activeElement.blur() // otherwise date will be changed to old one on dateInput blur
					// firstDate = event.detail.date;
					firstDate = event.detail.date
					scope.date = event.detail.formatted_date
					scope.inputsModels.date = scope.date

					scope.datepickerOptions.datepickerMode = 'datepicker'

					scope.$apply()
				})
			}

			/* const getSelectedDatesForPickmeup = function () {

					let dateFrom;

					if (moment(scope.date, 'YYYY-MM-DD', true).isValid()) {
						dateFrom = new Date(scope.date);
					}

					let secondDate;

					if (moment(scope.secondDate, 'YYYY-MM-DD', true).isValid()) {
						secondDate = new Date(scope.secondDate);
					}

					// if only one date selected, dates range is this one date
					if (dateFrom && !secondDate) secondDate = dateFrom;
					if (!dateFrom && secondDate)  dateFrom = secondDate;

					if (dateFrom && secondDate) return [dateFrom, secondDate];

					return [];

				};

				const dayRenderFn = date => {

					const ymdDate = moment(date).format('YYYY-MM-DD');

					if (ymdDate === scope.date && ymdDate === scope.secondDate) {
						return {class_name: "custom-pmu-date-from-to"};
					}

					if (ymdDate === scope.date) {
						return {class_name: "custom-pmu-date-from"};

					} else if (ymdDate === scope.secondDate) {
						return {class_name: "custom-pmu-date-to"};
					}

					return {};

				};

				const initRangeOfDatesCalendars = function () {

					firstCalendarElem = elem[0].querySelector(".firstCalendar");

					let pickmeupOpts = {
						flat: true,
						format: 'Y-m-d',
						mode: 'range',
						calendars: 2,
						render: dayRenderFn
					};

					const selectedDates = getSelectedDatesForPickmeup();

					if (selectedDates.length)  pickmeupOpts.date = selectedDates;

					pickmeup(firstCalendarElem, pickmeupOpts);

					firstCalendarElem.addEventListener('pickmeup-change', event => {

						/!* const dateFrom = new Date(scope.date);
						if (event.detail.formatted_date[0] === event.detail.formatted_date[1] &&
							event.detail.date[1] > dateFrom) {

							const datesRange = [dateFrom, event.detail.date[1]];

							pickmeup(firstCalendarElem).set_date(datesRange);
							scope.secondDate = event.detail.formatted_date[1];
							// pickmeup(firstCalendarElem).update();

						}*!/

						/!* if (scope.date !== event.detail.formatted_date[0] &&
							event.detail.date[0] < dateFrom) {

							const datesRange = [event.detail.date[0], event.detail.date[0]];
							scope.date = event.detail.formatted_date[0];
							scope.secondDate = event.detail.formatted_date[0];

							scope.$apply();

							// pickmeup(firstCalendarElem).set_date(datesRange);
							pickmeup(firstCalendarElem).set_date(event.detail.date[0]);

						} *!/

						const formattedDatesList = event.detail.formatted_date;

						if (scope.date !== formattedDatesList[0]) {
							scope.datepickerOptions.datepickerMode = 'datepicker';
						}

						scope.date = formattedDatesList[0];

						if (scope.secondDate !== formattedDatesList[1]) {

							scope.secondDatepickerOptions.datepickerMode = 'datepicker';
							scope.secondDate = formattedDatesList[1];

						}

						scope.$apply();

					});

				}; */

			const dayRenderFn = (date) => {
				if (firstDate && secondDate) {
					const dateFrom = firstDate > secondDate ? secondDate : firstDate
					const dateTo = firstDate > secondDate ? firstDate : secondDate
					/* const dateTime = date.getTime();
						const firstDateTime = firstDate.getTime();
						const secondDateTime = secondDate.getTime(); */
					const ymdDate = moment(date).format('YYYY-MM-DD')
					/* const ymdFirstDate = moment(firstDate).format('YYYY-MM-DD');
						const ymdSecondDate = moment(secondDate).format('YYYY-MM-DD'); */

					if (
						ymdDate === moment(dateFrom).format('YYYY-MM-DD') &&
						ymdDate === moment(dateTo).format('YYYY-MM-DD')
					) {
						return { class_name: 'custom-pmu-day-in-range' }
					} else if (ymdDate === moment(dateFrom).format('YYYY-MM-DD')) {
						return {
							class_name: 'custom-pmu-date-from custom-pmu-day-in-range',
						}
					} else if (ymdDate === moment(dateTo).format('YYYY-MM-DD')) {
						return {
							class_name: 'custom-pmu-date-to custom-pmu-day-in-range',
						}
					}

					if (dateFrom < date && date < dateTo) {
						return { class_name: 'custom-pmu-day-in-range' }
					}
				}
				/*if (firstDate && secondDate &&
						firstDate < date && date < secondDate) {
						return {class_name: "custom-pmu-day-in-range"}
					}*/

				return {}
			}

			const initRangeOfDatesCalendars = function () {
				firstCalendarElem = elem[0].querySelector('.firstCalendar')
				secondCalendarElem = elem[0].querySelector('.secondCalendar')

				const pOpts = {
					...{ date: new Date(scope.date) },
					...pickmeupOptions,
				}

				pickmeup(firstCalendarElem, pOpts)

				// firstCalendarElem.addEventListener("pickmeup-change", onDateFromPickmeupChange);
				firstCalendarElem.addEventListener('pickmeup-change', (event) => {
					document.activeElement.blur() // otherwise date will be changed to old one on dateInput blur
					firstDate = event.detail.date
					scope.date = event.detail.formatted_date
					scope.inputsModels.date = scope.date

					scope.datepickerOptions.datepickerMode = 'datepicker'

					scope.$apply()
					pickmeup(secondCalendarElem).update()
				})

				const pOpts2 = {
					...{
						date: new Date(scope.secondDate),
						render: dayRenderFn,
					},
					...pickmeupOptions,
				}

				pickmeup(secondCalendarElem, pOpts2)

				// secondCalendarElem.addEventListener("pickmeup-change", onDateToPickmeupChange);
				secondCalendarElem.addEventListener('pickmeup-change', (event) => {
					document.activeElement.blur() // otherwise date will be changed to old one on dateInput blur

					secondDate = event.detail.date
					scope.secondDate = event.detail.formatted_date
					scope.inputsModels.secondDate = scope.secondDate

					scope.secondDatepickerOptions.datepickerMode = 'datepicker'

					scope.$apply()
					pickmeup(firstCalendarElem).update()
				})
			}

			const onDateInputChange = function (date) {
				if (moment(date, 'YYYY-MM-DD', true).isValid()) {
					scope.date = date
					scope.inputsModels.date = scope.date
					firstDate = new Date(date)

					pickmeup(firstCalendarElem).set_date(firstDate)
					if (scope.rangeOfDates) pickmeup(secondCalendarElem).update()

					// if previously date was taken from expression, and now date field changed
					scope.datepickerOptions.datepickerMode = 'datepicker'
				} else if (date === null) {
					scope.date = null
					scope.inputsModels.date = scope.date
					firstDate = null
					pickmeup(firstCalendarElem).set_date()
				}
			}

			scope.onSecondDateInputChange = function (date) {
				if (moment(date, 'YYYY-MM-DD', true).isValid()) {
					scope.secondDate = date
					scope.inputsModels.secondDate = scope.secondDate
					secondDate = new Date(date)

					pickmeup(firstCalendarElem).update()
					pickmeup(secondCalendarElem).set_date(secondDate)

					// if previously date was taken from expression, and now date field changed
					scope.secondDatepickerOptions.datepickerMode = 'datepicker'
				} else if (date === null) {
					scope.secondDate = null
					scope.inputsModels.secondDate = scope.secondDate
					secondDate = null
					pickmeup(secondCalendarElem).set_date()
				}
			}

			/* const onDateRangeInputChange = function (date, dateNumber) {

					// const optionsProp = dateNumber === 2 ? 'secondDatepickerOptions' : 'datepickerOptions';
					let firstDate, secondDate, optionsProp;
					if (dateNumber === 2) {

						/!*firstDate = new Date(scope.date);
						secondDate = new Date(date);*!/
						scope.secondDate = date;
						optionsProp = 'secondDatepickerOptions';

					} else {

						/!*firstDate = new Date(date);
						secondDate = new Date(scope.secondDate);*!/
						scope.date = date;
						optionsProp = 'datepickerOptions';

					}

					if (moment(date, 'YYYY-MM-DD', true).isValid()) {

						const datesRange = [new Date(scope.date), new Date(scope.secondDate)];
						// firstDate = new Date(date);
						pickmeup(firstCalendarElem).set_date(datesRange);

						// if previously date was taken from expression, and now date field changed
						scope[optionsProp].datepickerMode = 'datepicker';

						// if (scope.rangeOfDates) pickmeup(secondCalendarElem).update();

					}

				}; */

			const disableUseFromAboveMode = function () {
				if (useFromAboveEventIndex) {
					scope.evEventService.removeEventListener(
						evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE,
						useFromAboveEventIndex
					)
					useFromAboveEventIndex = null
					attributeKey = null
				}
			}

			scope.modeIsActive = (modeNames) => {
				if (Array.isArray(modeNames)) {
					return modeNames.includes(scope.datepickerOptions.datepickerMode)
				}

				return modeNames === scope.datepickerOptions.datepickerMode
			}

			const applyFirstDate = function (date) {
				firstDate = date
				scope.date = moment(date).format('YYYY-MM-DD')
				scope.inputsModels.date = scope.date
				pickmeup(firstCalendarElem).set_date(firstDate)
			}

			const applySecondDate = function (date) {
				secondDate = date
				scope.secondDate = moment(date).format('YYYY-MM-DD')
				scope.inputsModels.secondDate = scope.secondDate
				pickmeup(secondCalendarElem).set_date(secondDate)
			}

			const disableFieldsAndCalendars = function () {
				scope.dateIsDisabled = true
				firstCalendarElem.classList.add('pmu-calendar-disabled')

				scope.secondDateIsDisabled = true
				secondCalendarElem.classList.add('pmu-calendar-disabled')
			}

			const resetPmuCalendars = function () {
				pickmeup(firstCalendarElem).destroy() // redraw calendar after mode switch

				const options = {
					...{ date: new Date(scope.date) },
					...pickmeupOptions,
				}

				pickmeup(firstCalendarElem, options)

				if (scope.rangeOfDates) {
					pickmeup(secondCalendarElem).destroy() // redraw calendar after mode switch

					const sOptions = {
						...{ date: new Date(scope.secondDate) },
						...pickmeupOptions,
					}

					pickmeup(secondCalendarElem, sOptions)
				}
			}

			scope.activateCustomMode = function () {
				if (!scope.modeIsActive(['datepicker', 'expression'])) {
					if (scope.datepickerOptions.expression) {
						scope.datepickerOptions.datepickerMode = 'expression'
					} else {
						scope.datepickerOptions.datepickerMode = 'datepicker'
					}

					scope.dateIsDisabled = false
					firstCalendarElem.classList.remove('pmu-calendar-disabled')

					if (scope.rangeOfDates) {
						scope.secondDateIsDisabled = false
						secondCalendarElem.classList.remove('pmu-calendar-disabled')
					}

					disableUseFromAboveMode()
				}
			}

			scope.activateMode = async function (mode) {
				let updateScope = false

				switch (mode) {
					case 'today':
						scope.datepickerOptions.datepickerMode = 'today'
						scope.datepickerOptions.expression = 'now()'

						scope.date = moment(new Date()).format('YYYY-MM-DD')
						scope.inputsModels.date = scope.date

						pickmeup(firstCalendarElem).set_date(new Date(scope.date))

						scope.dateIsDisabled = true
						firstCalendarElem.classList.add('pmu-calendar-disabled')

						break

					case 'yesterday-business':
						/* scope.datepickerOptions.expression = 'now()-days(1)';

							const yesterdayDate = moment(new Date()).subtract(1, 'day').format('YYYY-MM-DD');
							scope.date = yesterdayDate; */
						/*cope.datepickerOptions.expression = 'now()-days(1)';

							const yesterdayDate = moment(new Date()).subtract(1, 'day').format('YYYY-MM-DD');

							scope.date = yesterdayDate;
							scope.inputsModels.date = scope.date;

							pickmeup(firstCalendarElem).set_date(new Date(scope.date)); */
						let prevBusinessDay

						try {
							const exprCalcRes = await expressionService.getResultOfExpression(
								{
									expression: 'last_business_day(now()-days(1))',
								}
							)
							prevBusinessDay = new Date(exprCalcRes.result)
						} catch (error) {
							throw new Error(error)
						}

						scope.datepickerOptions.datepickerMode = 'yesterday-business'
						scope.datepickerOptions.expression =
							'last_business_day(now()-days(1))'

						applyFirstDate(prevBusinessDay)

						scope.dateIsDisabled = true
						firstCalendarElem.classList.add('pmu-calendar-disabled')

						updateScope = true

						break

					/* case 'inception':

							scope.datepickerOptions.datepickerMode = 'inception';

							scope.date = '0001-01-01';
							scope.inputsModels.date = scope.date;

							pickmeup(firstCalendarElem).set_date(new Date(scope.date));

							scope.dateIsDisabled = true;
							firstCalendarElem.classList.add("pmu-calendar-disabled");

							break; */
				}

				if (mode !== 'link_to_above') disableUseFromAboveMode()

				resetPmuCalendars()

				if (updateScope) scope.$apply()
			}

			/**
			 * Update date fields and calendars after range of dates mode switch.
			 *
			 * @param firstDate {Date}
			 * @param firstExpression {string}
			 * @param secondDate {Date}
			 * @param secondExpression {string}
			 * @param mode {string}
			 */
			const applyDatesOnRangeModeSwitch = function (
				firstDate,
				firstExpression,
				secondDate,
				secondExpression,
				mode
			) {
				applyFirstDate(firstDate)

				scope.datepickerOptions.datepickerMode = mode
				scope.datepickerOptions.expression = firstExpression
				//</editor-fold>

				//<editor-fold desc="Second date">
				applySecondDate(secondDate)

				scope.secondDatepickerOptions.datepickerMode = mode
				scope.secondDatepickerOptions.expression = secondExpression
				//</editor-fold>

				disableFieldsAndCalendars()
			}

			scope.activateRangeMode = async function (mode) {
				const currentDate = new Date()
				let updateScope = false

				switch (mode) {
					case 'week-to-date':
						let prevWeekLastDay

						try {
							const exprCalcRes = await expressionService.getResultOfExpression(
								{
									expression: 'get_date_last_week_end_business(now())',
								}
							)
							prevWeekLastDay = new Date(exprCalcRes.result)
						} catch (error) {
							throw new Error(error)
						}

						applyDatesOnRangeModeSwitch(
							prevWeekLastDay,
							'get_date_last_week_end_business(now())',
							currentDate,
							'now()',
							'week-to-date'
						)

						updateScope = true

						break

					case 'month-to-date':
						let prevMonthLastDay

						try {
							const exprCalcRes = await expressionService.getResultOfExpression(
								{
									expression: 'get_date_last_month_end_business(now())',
								}
							)
							prevMonthLastDay = new Date(exprCalcRes.result)
						} catch (error) {
							throw new Error(error)
						}

						/* applyFirstDate(lastDayOfPrevMonth);

							scope.datepickerOptions.datepickerMode = 'month-to-date';
							scope.datepickerOptions.expression = 'get_date_last_month_end_business(now())';
							//</editor-fold>

							//<editor-fold desc="Second date">
							applySecondDate(currentDate);

							scope.secondDatepickerOptions.datepickerMode = 'month-to-date';
							scope.secondDatepickerOptions.expression = 'now()';
							//</editor-fold>

							disableFieldsAndCalendars(); */
						applyDatesOnRangeModeSwitch(
							prevMonthLastDay,
							'get_date_last_month_end_business(now())',
							currentDate,
							'now()',
							'month-to-date'
						)

						updateScope = true

						break

					case 'quarter-to-date':
						let prevQuarterLastDay

						try {
							const exprCalcRes = await expressionService.getResultOfExpression(
								{
									expression: 'get_date_last_quarter_end_business(now())',
								}
							)
							prevQuarterLastDay = new Date(exprCalcRes.result)
						} catch (error) {
							throw new Error(error)
						}

						/* applyFirstDate(lastDayOfCurrentMonth);

							scope.datepickerOptions.datepickerMode = 'month-to-date';
							scope.datepickerOptions.expression = 'get_date_last_month_end_business(now())';
							//</editor-fold>

							//<editor-fold desc="Second date">
							applySecondDate(currentDate);

							scope.secondDatepickerOptions.datepickerMode = 'month-to-date';
							scope.secondDatepickerOptions.expression = 'now()';
							//</editor-fold>

							disableFieldsAndCalendars(); */
						applyDatesOnRangeModeSwitch(
							prevQuarterLastDay,
							'get_date_last_quarter_end_business(now())',
							currentDate,
							'now()',
							'quarter-to-date'
						)

						updateScope = true

						break

					case 'year-to-date':
						/* const firstDayOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);

							//<editor-fold desc="First date">
							applyFirstDate(firstDayOfCurrentYear);

							scope.datepickerOptions.datepickerMode = 'year-to-date';
							scope.datepickerOptions.expression = '';
							//</editor-fold>

							//<editor-fold desc="Second date">
							applySecondDate(currentDate);

							scope.secondDatepickerOptions.datepickerMode = 'year-to-date';
							scope.secondDatepickerOptions.expression = 'now()';
							//</editor-fold>

							disableFieldsAndCalendars(); */
						let prevYearLastDay

						try {
							const exprCalcRes = await expressionService.getResultOfExpression(
								{
									expression: 'get_date_last_year_end_business(now())',
								}
							)
							prevYearLastDay = new Date(exprCalcRes.result)
						} catch (error) {
							throw new Error(error)
						}

						applyDatesOnRangeModeSwitch(
							prevYearLastDay,
							'get_date_last_year_end_business(now())',
							currentDate,
							'now()',
							'year-to-date'
						)

						updateScope = true

						break

					case 'inception':
						//<editor-fold desc="First date">
						applyFirstDate(new Date('0001-01-01'))

						scope.datepickerOptions.datepickerMode = 'inception'
						scope.datepickerOptions.expression = ''
						//</editor-fold>

						//<editor-fold desc="Second date">
						applySecondDate(currentDate)

						scope.secondDatepickerOptions.datepickerMode = 'inception'
						scope.secondDatepickerOptions.expression = 'now()'
						//</editor-fold>

						disableFieldsAndCalendars()

						break
				}

				if (mode !== 'link_to_above') disableUseFromAboveMode()

				resetPmuCalendars()

				if (updateScope) scope.$apply()
			}

			const applyDatepickerModeOnInit = function () {
				if (scope.rangeOfDates) {
					switch (scope.datepickerOptions.datepickerMode) {
						case 'month-to-date':
						case 'quarter-to-date':
						case 'year-to-date':
						case 'inception':
							scope.dateIsDisabled = true
							firstCalendarElem.classList.add('pmu-calendar-disabled')

							scope.secondDateIsDisabled = true
							secondCalendarElem.classList.add('pmu-calendar-disabled')

							break
					}
				} else {
					switch (scope.datepickerOptions.datepickerMode) {
						case 'today':
						case 'yesterday-business':
						case 'inception':
							scope.dateIsDisabled = true
							firstCalendarElem.classList.add('pmu-calendar-disabled')
							break
					}
				}
			}

			const init = function () {
				if (moment(scope.date, 'YYYY-MM-DD', true).isValid()) {
					firstDate = new Date(scope.date)
				}

				scope.onDateInputChange = onDateInputChange

				// delete scope.datepickerOptions.secondDate;

				if (scope.rangeOfDates) {
					scope.inputsModels.secondDate = scope.secondDate

					if (
						scope.rangeOfDates &&
						moment(scope.secondDate, 'YYYY-MM-DD', true).isValid()
					) {
						secondDate = new Date(scope.secondDate)
					}

					pickmeupOptions.render = dayRenderFn

					// scope.onDateInputChange = onDateRangeInputChange;
					initRangeOfDatesCalendars()
				} else {
					// scope.onDateInputChange = onDateInputChange;
					initCalendar(1)
				}

				applyDatepickerModeOnInit()
			}

			init()

			scope.popupEventService.addEventListener(popupEvents.CLOSE_POPUP, () => {
				scope.$destroy()
			})
		},
	}
}
