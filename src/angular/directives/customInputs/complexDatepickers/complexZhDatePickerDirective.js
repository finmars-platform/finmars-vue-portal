/**
 * Created by mevstratov on 08.03.2019.
 */

/* import metaService from '../services/metaService';
	import expressionService from '../services/expression.service'; */
import evEvents from '@/angular/services/entityViewerEvents'

import EventService from '@/angular/services/eventService'

export default function ($mdDialog) {
	return {
		restrict: 'AE',
		scope: {
			// displayOptions: '<',
			callbackMethod: '&',
			date: '=',
			datepickerOptions: '=',
			secondDate: '=',
			secondDatepickerOptions: '=',
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			isDisabled: '=',

			selectorLook: '@', // 'input'

			label: '@',
			placeholderText: '@',
		},
		templateUrl:
			'views/directives/customInputs/complexDatepickers/complex-zh-datepicker-view.html',
		link: function (scope, elem, attrs) {
			// scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer();
			scope.rangeOfDates =
				scope.secondDate !== undefined && !!scope.secondDatepickerOptions
			scope.templateUrl =
				'views/directives/customInputs/complexDatepickers/c-zh-datepicker-view.html'

			if (scope.selectorLook === 'input') {
				scope.templateUrl =
					'views/directives/customInputs/complexDatepickers/c-zh-datepicker-input-view.html'
			}

			const entityType = scope.evDataService.getEntityType()
			const viewContext = scope.evDataService.getViewContext()
			/* const isReport = metaService.isReport(entityType);

                // var input = $(elem).find('.complex-datepicker-input');
                let input = elem[0].querySelector('.complex-datepicker-input');

                let linkToAboveEventIndex; */
			let attributesFromAbove
			// let useReportDateFromAbove = true;
			let columnKey

			scope.testModelChange = function () {
				scope.callbackMethod()
			}

			scope.toggleMode = function (mode) {
				scope.datepickerOptions.datepickerMode = mode
			}

			/* var enableTodayMode = function () {

					scope.datepickerActiveModeTitle = 'Today';
					scope.datepickerOptions.expression = "now()";
					input.setAttribute('disabled', '');

					var today = moment(new Date()).format('YYYY-MM-DD');
					scope.date = today;

					if (linkToAboveEventIndex) {
						scope.evEventService.removeEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, linkToAboveEventIndex);
						linkToAboveEventIndex = null;
						columnKey = null;
					}

					setTimeout(function () {
						scope.callbackMethod()
					}, 500);

				};

				var enableYesterdayMode = function () {

					scope.datepickerActiveModeTitle = 'Yesterday';
					scope.datepickerOptions.expression = "now()-days(1)";
					input.setAttribute('disabled', '');

					var yesterday = moment(new Date()).subtract(1, 'day').format('YYYY-MM-DD');

					scope.date = yesterday;

					if (linkToAboveEventIndex) {
						scope.evEventService.removeEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, linkToAboveEventIndex);
						linkToAboveEventIndex = null;
						columnKey = null;
					}

					setTimeout(function () {
						scope.callbackMethod()
					}, 500);

				};

				var enableDatepickerMode = function () {

					scope.datepickerActiveModeTitle = 'Datepicker';
					delete scope.datepickerOptions.expression;

					setTimeout(function () {
						scope.callbackMethod()
					}, 500);

					if (scope.isDisabled) {
						input.setAttribute('disabled', '');
					} else {
						input.removeAttribute('disabled');
					}

					if (linkToAboveEventIndex) {
						scope.evEventService.removeEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, linkToAboveEventIndex);
						linkToAboveEventIndex = null;
						columnKey = null;
					}

				};

				var enableExpressionMode = function () {

					scope.datepickerActiveModeTitle = 'Custom';

					input.setAttribute('disabled', '');

					if (linkToAboveEventIndex) {
						scope.evEventService.removeEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, linkToAboveEventIndex);
						linkToAboveEventIndex = null;
					}

				};

                scope.openEditExpressionDialog = function ($event) {

                    if (scope.datepickerOptions.datepickerMode !== 'expression') {
                        scope.datepickerOptions.datepickerMode = 'expression';
                        scope.datepickerOptions.expression = undefined;

                        setTimeout(function () {
                            scope.callbackMethod()
                        }, 500);
                    }

                    var datepickerOptionsCopy = JSON.parse(JSON.stringify(scope.datepickerOptions));

                    var eeData = {returnExpressionResult: true};

                    if (isReport) {
                        eeData.entityType = entityType;
                        eeData.attributeDataService = scope.attributeDataService;
                    }

                    $mdDialog.show({
                        controller: 'ExpressionEditorDialogController as vm',
                        templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
                        targetEvent: $event,
                        autoWrap: true,
                        locals: {
                            item: {expression: datepickerOptionsCopy.expression},
                            data: eeData
                        }

                    }).then(function (res) {

                        if (res.status === 'agree') {

                            scope.datepickerOptions.expression = res.data.item.expression;

                            var expressionData = {
                                expression: scope.datepickerOptions.expression,
                                is_eval: true
                            };

                            expressionService.getResultOfExpression(expressionData).then(function (resData) {

                                scope.date = resData.result;
                                scope.datepickerOptions.date = resData.result;
                                scope.$apply();

                                if (scope.callbackMethod) {
                                    scope.callbackMethod();
                                }

                            }).catch(function (error) {

                                $mdDialog.show({
                                    controller: 'WarningDialogController as vm',
                                    templateUrl: 'views/dialogs/warning-dialog-view.html',
                                    clickOutsideToClose: false,
                                    locals: {
                                        warning: {
                                            title: 'Error',
                                            description: 'Invalid expression'
                                        }
                                    }
                                });

                            });
                        }

                    });
                };

                var enableInceptionDateMode = function () {
                    delete scope.datepickerOptions.expression;

                    scope.date = '0001-01-01';

                    setTimeout(function () {
                        scope.callbackMethod()
                    }, 500);

                    if (linkToAboveEventIndex) {
                        scope.evEventService.removeEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, linkToAboveEventIndex);
                        linkToAboveEventIndex = null;
                        columnKey = null;
                    }
                }; */

			scope.chooseEntityToUseFromAbove = function ($event) {
				attributesFromAbove = scope.evDataService
					.getAttributesFromAbove()
					.filter(function (attribute) {
						return attribute.value_type === 40
					})

				if (scope.datepickerOptions.datepickerMode !== 'link_to_above') {
					scope.datepickerOptions.datepickerMode = 'link_to_above'
				}

				$mdDialog
					.show({
						controller: 'UseFromAboveDialogController as vm',
						templateUrl: 'views/dialogs/use-from-above-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							data: {
								item: columnKey,
								data: { value_type: 40 },
								entityType: entityType,
							},
							attributeDataService: scope.attributeDataService,
						},
					})
					.then(function (res) {
						if (res.status === 'agree' && res.data.item) {
							columnKey = res.data.item
						}
					})
			}

			/* var enableLinkToAboveMode = function () {

                    scope.datepickerActiveModeTitle = 'Link To Above';

                    delete scope.datepickerOptions.expression;
                    input.setAttribute('disabled', '');

                    linkToAboveEventIndex = scope.evEventService.addEventListener(evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE, function () {

                        if (columnKey) {

                            var activeObjectFromAbove = scope.evDataService.getActiveObjectFromAbove();

                            var key = columnKey;
                            var value = activeObjectFromAbove[key];

                            scope.date = [value];

                            if (scope.callbackMethod) {
                                setTimeout(function() {
                                    scope.callbackMethod();
                                }, 500)
                            }

                            scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE);

                        }

                    });

                };

                scope.$watch("datepickerOptions.datepickerMode", function (datepickerMode) {

                    switch (datepickerMode) {
                        case "today":
                            enableTodayMode();
                            break;
                        case "yesterday":
                            enableYesterdayMode();
                            break;
                        case "expression":
                            enableExpressionMode();
                            break;
                        case "datepicker":
                            enableDatepickerMode();
                            break;
                        case "inception":
                            enableInceptionDateMode();
                            break;
                        case "link_to_above":
                            if (!scope.isRootEntityViewer) {
                                enableLinkToAboveMode();
                            } else {
                                enableDatepickerMode();
                            }
                            break;
                        default:
                            scope.datepickerOptions.datepickerMode = 'datepicker';

                    }
                }); */

			scope.popupData = {
				datepickerOptions: JSON.parse(JSON.stringify(scope.datepickerOptions)),
				date: scope.date,
				evDataService: scope.evDataService,
				evEventService: scope.evEventService,
				attributeDataService: scope.attributeDataService,
			}

			if (scope.rangeOfDates) {
				scope.popupData.secondDate = scope.secondDate
				scope.popupData.secondDatepickerOptions = JSON.parse(
					JSON.stringify(scope.secondDatepickerOptions)
				)
			}

			const applyPopupDataToFirstDate = function (date) {
				scope.date = date
				scope.popupData.date = date

				if (scope.popupData.datepickerOptions.datepickerMode === 'datepicker') {
					delete scope.popupData.datepickerOptions.expression
				}

				scope.datepickerOptions = JSON.parse(
					JSON.stringify(scope.popupData.datepickerOptions)
				)
			}

			const applyPopupDataToSecondDate = function (date) {
				scope.secondDate = date
				scope.popupData.secondDate = date

				if (
					scope.popupData.secondDatepickerOptions.datepickerMode ===
					'datepicker'
				) {
					delete scope.popupData.secondDatepickerOptions.expression
				}

				scope.secondDatepickerOptions = JSON.parse(
					JSON.stringify(scope.popupData.secondDatepickerOptions)
				)
			}

			scope.onPopupSave = function () {
				if (scope.rangeOfDates) {
					if (!scope.popupData.date && scope.popupData.secondDate) {
						scope.popupData.date = scope.popupData.secondDate
					}

					if (!scope.popupData.secondDate && scope.popupData.date) {
						scope.popupData.secondDate = scope.popupData.date
					}

					let firstDate, firstOptions, secondDate, secondOptions

					if (
						new Date(scope.popupData.date) >
						new Date(scope.popupData.secondDate)
					) {
						firstDate = scope.popupData.secondDate
						firstOptions = scope.popupData.secondDatepickerOptions

						secondDate = scope.popupData.date
						secondOptions = scope.popupData.datepickerOptions
					} else {
						// in case second date later than first, switch them

						firstDate = scope.popupData.date
						firstOptions = scope.popupData.datepickerOptions

						secondDate = scope.popupData.secondDate
						secondOptions = scope.popupData.secondDatepickerOptions
					}

					scope.popupData.datepickerOptions = firstOptions
					applyPopupDataToFirstDate(firstDate)

					scope.popupData.secondDatepickerOptions = secondOptions
					applyPopupDataToSecondDate(secondDate)
				} else {
					applyPopupDataToFirstDate(scope.popupData.date)
				}

				if (scope.selectorLook === 'input') scope.textDate = getDateText()

				setTimeout(() => {
					if (scope.callbackMethod) scope.callbackMethod()
				}, 0)
			}

			scope.onPopupCancel = function () {
				scope.popupData.date = scope.date
				scope.popupData.datepickerOptions = JSON.parse(
					JSON.stringify(scope.datepickerOptions)
				)

				if (scope.rangeOfDates) {
					scope.popupData.secondDate = scope.secondDate
					scope.popupData.secondDatepickerOptions = JSON.parse(
						JSON.stringify(scope.secondDatepickerOptions)
					)
				}
				setTimeout(() => {
					if (scope.callbackMethod) scope.callbackMethod()
				}, 0)
			}

			const updatePopupData = function () {
				setTimeout(() => {
					scope.popupData.date = scope.date
					scope.popupData.datepickerOptions = JSON.parse(
						JSON.stringify(scope.datepickerOptions)
					)

					if (scope.rangeOfDates) {
						scope.popupData.secondDate = scope.secondDate
						scope.popupData.secondDatepickerOptions = JSON.parse(
							JSON.stringify(scope.secondDatepickerOptions)
						)
					}
				}, 100)
			}

			const getDateText = function () {
				if (scope.rangeOfDates) {
					scope.dateText = scope.date

					if (scope.secondDate) {
						scope.dateText = scope.dateText + ' - ' + scope.secondDate
					}
				} else {
					scope.dateText = scope.date
				}

				return scope.dateText
			}

			const init = function () {
				if (viewContext === 'split_panel') {
					scope.evEventService.addEventListener(
						evEvents.REPORT_OPTIONS_CHANGE,
						function () {
							const reportLayoutOptions =
								scope.evDataService.getReportLayoutOptions()

							if (reportLayoutOptions.useDateFromAbove) {
								updatePopupData()
							}
						}
					)
				} else {
					scope.evEventService.addEventListener(
						evEvents.REPORT_OPTIONS_CHANGE,
						function () {
							updatePopupData()
						}
					)
				}

				scope.popupEventService = new EventService()

				if (!scope.datepickerOptions) scope.datepickerOptions = {}

				if (!scope.datepickerOptions.datepickerMode)
					scope.datepickerOptions.datepickerMode = 'datepicker'

				/*scope.datepickerOptions.date = scope.date;
					if (scope.rangeOfDates) scope.secondDatepickerOptions.date = scope.secondDate;*/

				if (scope.selectorLook === 'input') {
					scope.dateText = getDateText()
				}
			}

			init()
		},
	}
}
