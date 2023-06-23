/**
 * Created by mevstratov on 24.10.2019.
 */

import evEvents from '../services/entityViewerEvents'

import evDataHelper from '../helpers/ev-data.helper'
import ScrollHelper from '../helpers/scrollHelper'

var scrollHelper = new ScrollHelper()

var GModalSharedLogicHelper = require('../helpers/entityViewer/sharedLogic/gModalSharedLogicHelper')

export default function ($mdDialog) {
	return {
		restrict: 'A',
		scope: {
			attrsList: '=',
			evDataService: '=',
			evEventService: '=',
			contentWrapElement: '=',
			syncAttrsCallback: '&',
			updateAttrsCallback: '&',
		},
		link: function (scope, elem, attrs) {
			var gModalSharedLogicHelper = new GModalSharedLogicHelper()

			var columns = scope.evDataService.getColumns()
			var filters = scope.evDataService.getFilters()
			var groups = scope.evDataService.getGroups()
			var isReport = true

			/* var viewConstructorDnD = {

                    init: function () {
                        this.dragula();
                        this.eventListeners();
                    },

                    eventListeners: function () {

                        var exist = false;
                        var columnExist = false;
                        var groupExist = false;
                        var filterExist = false;

                        this.dragula.on('over', function (elem, container, source) {
                            $(container).addClass('active');
                            $(container).on('mouseleave', function () {
                                $(this).removeClass('active');
                            })

                        });

                        this.dragula.on('drop', function (elem, target) {

                            $(target).removeClass('active');
                            var i;

                            var identifier;
                            identifier = $(elem).attr('data-key-identifier');

                            columns = scope.evDataService.getColumns();
                            filters = scope.evDataService.getFilters();
                            groups = scope.evDataService.getGroups();

                            exist = false;
                            if (target === scope.contentWrapElement.querySelector('#columnsbag') ||
                                target === scope.contentWrapElement.querySelector('.g-columns-holder')) {
                                for (i = 0; i < columns.length; i = i + 1) {

                                    if (columns[i].key === identifier) {
                                        exist = true;
                                        columnExist = true;
                                    }

                                }
                            }
                            /!*if (target === scope.contentWrapElement.querySelector('#groupsbag') ||
                                target === scope.contentWrapElement.querySelector('.g-groups-holder')) {*!/
                            if (target === scope.contentWrapElement.querySelector('#groupsbag')) {
                                for (i = 0; i < groups.length; i = i + 1) {
                                    if (groups[i].key === identifier) {
                                        exist = true;
                                        groupExist = true;
                                    }

                                }
                            }

                            if (target === scope.contentWrapElement.querySelector('#filtersbag .drop-new-filter') ||
                                target === scope.contentWrapElement.querySelector('.g-filters-holder')) {

                            	for (i = 0; i < filters.length; i = i + 1) {
                                    if (filters[i].key === identifier) {
                                        exist = true;
                                        filterExist = true;
                                    }
                                }

                            }

                            if (!exist && target) {
                                var a;

                                var nodes = Array.prototype.slice.call(target.children);
                                var index = nodes.indexOf(elem);

                                // .g-columns-holder
                                if (target === scope.contentWrapElement.querySelector('.g-columns-holder') ||
                                    target === scope.contentWrapElement.querySelector('#columnsbag')) {

                                    for (a = 0; a < scope.attrsList.length; a = a + 1) {

                                        if (scope.attrsList[a].key === identifier) {

                                            if (target === scope.contentWrapElement.querySelector('#columnsbag')) {
                                                columns.push(scope.attrsList[a]);
                                            } else {
                                                columns.splice(index, 0, scope.attrsList[a]);
                                            }

                                        }

                                    }

                                    scope.syncAttrsCallback();

                                    evDataHelper.updateColumnsIds(scope.evDataService);
                                    evDataHelper.setColumnsDefaultWidth(scope.evDataService);

                                    scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
                                    scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                                }

                                if (target === scope.contentWrapElement.querySelector('#groupsbag')) {

                                    for (a = 0; a < scope.attrsList.length; a = a + 1) {
                                        if (scope.attrsList[a].key === identifier) {
                                            groups.push(scope.attrsList[a]);
                                        }
                                    }

                                    scope.syncAttrsCallback();

                                    evDataHelper.updateColumnsIds(scope.evDataService);
                                    evDataHelper.setColumnsDefaultWidth(scope.evDataService);

                                    scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE);
                                    scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                                }

                                if (target === scope.contentWrapElement.querySelector('#filtersbag .drop-new-filter') ||
                                    target === scope.contentWrapElement.querySelector('.g-filters-holder')) {

                                    for (a = 0; a < scope.attrsList.length; a = a + 1) {

                                        if (scope.attrsList[a].key === identifier) {
                                            if (target === scope.contentWrapElement.querySelector('#filtersbag .drop-new-filter')) {
                                                filters.push(scope.attrsList[a]);
                                            } else {
                                                filters.splice(index, 0, scope.attrsList[a]);
                                            }
                                        }
                                    }

                                    scope.syncAttrsCallback();

                                    evDataHelper.updateColumnsIds(scope.evDataService);
                                    evDataHelper.setColumnsDefaultWidth(scope.evDataService);

                                    scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
                                    scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                                }

                                scope.$apply();

                            }

                            else if (exist && target) {

                                var errorMessage = 'Item should be unique';

                                if (columnExist) {
                                    errorMessage = 'There is already such column in Column Area';
                                } else if (groupExist) {
                                    errorMessage = 'There is already such group in Groups Area';
                                } else if (filterExist) {
                                    errorMessage = 'There is already such filter in Filter Area';
                                }

                                $mdDialog.show({
                                    controller: 'WarningDialogController as vm',
                                    templateUrl: 'views/dialogs/warning-dialog-view.html',
                                    parent: angular.element(document.body),
                                    clickOutsideToClose: false,
                                    multiple: true,
                                    locals: {
                                        warning: {
                                            title: 'Error',
                                            description: errorMessage,
                                            actionsButtons: [{
                                                name: "OK",
                                                response: false
                                            }]
                                        }
                                    }
                                });

                            }

                            scope.$apply();
                        });

                        this.dragula.on('dragend', function (el) {
                            scope.$apply();
                            $(el).remove();
                        });

                    },

                    dragula: function () {

                        var items = [
                            scope.contentWrapElement.querySelector('.g-columns-holder'),
                            scope.contentWrapElement.querySelector('#columnsbag'),
                            // document.querySelector('.g-groups-holder'),
                            scope.contentWrapElement.querySelector('#groupsbag'),
                            scope.contentWrapElement.querySelector('.g-filters-holder'),
                            scope.contentWrapElement.querySelector('#filtersbag .drop-new-filter')
                        ];

                        var i;
                        var itemsElem = document.querySelectorAll('#dialogbag .vcDraggableCard');
                        for (i = 0; i < itemsElem.length; i = i + 1) {
                            items.push(itemsElem[i]);
                        }

                        this.dragula = dragula(items,
                            {
                                accepts: function (el, target, source, nextSibling) {
                                    if (target.classList.contains('g-modal-draggable-card')) {
                                        return false;
                                    }

                                    if (target.classList.contains('g-columns-holder') &&
                                        nextSibling && nextSibling.dataset.columnKey &&
                                        isReport) {

                                        for (var i = 0; i < groups.length; i++) {
                                            if (groups[i].key === nextSibling.dataset.columnKey) {
                                                return false;
                                            }
                                        }
                                    }

                                    return true;
                                },
                                copy: true
                            });
                    },

                    destroy: function () {
                        this.dragula.destroy();
                    }
                }; */

			var selectedDnD = {
				init: function () {
					this.selectedDragulaInit()
					this.eventListeners()
				},

				eventListeners: function () {
					var drake = this.dragula
					var containerWithShadow
					var sourceContainer

					drake.on('shadow', function (elem, container, source) {
						if (
							container.classList.contains('vcSelectedGroups') ||
							container.classList.contains('vcSelectedFilters')
						) {
							if (containerWithShadow) {
								containerWithShadow.classList.remove('remove-card-space')
							}

							if (container === source) {
								source.classList.remove('dragged-out-card-space')
							} else {
								// TODO use class with display: none; to hide shadow as in reconciliation dnd
								$(elem).remove() // removing only shadow of the dragged element

								container.classList.add('vc-groups-container-shadowed')

								if (!source.classList.contains('dragged-out-card-space')) {
									source.classList.add('dragged-out-card-space')
								}

								source.classList.add('dragged-out-card-space')
								containerWithShadow = container
								sourceContainer = source
							}
						} else {
							sourceContainer = source

							elem.classList.add('vc-shadow-elem')

							if (containerWithShadow) {
								containerWithShadow.classList.remove('remove-card-space')
								containerWithShadow.classList.remove(
									'vc-groups-container-shadowed'
								)
							}

							if (container === source) {
								source.classList.remove('dragged-out-card-space')
							} else {
								if (!source.classList.contains('dragged-out-card-space')) {
									source.classList.add('dragged-out-card-space')
								}

								container.classList.add('remove-card-space')
								containerWithShadow = container
								sourceContainer = source
							}
						}
					})

					drake.on('drag', function () {
						scrollHelper.enableDnDWheelScroll()
					})

					drake.on('drop', function (elem, target, source, nextSibling) {
						columns = scope.evDataService.getColumns()
						filters = scope.evDataService.getFilters()
						groups = scope.evDataService.getGroups()

						var attributeChanged = false // needed to call view constructor data reload

						var attributeKey = elem.dataset.attributeKey
						var attrsVmKey = elem.dataset.vmKey

						/* var changeSelectedGroup = function (draggedTo) {

								for (var i = 0; i < scope.$parent.vm[attrsVmKey].length; i++) {

									if (scope.$parent.vm[attrsVmKey][i].key === attributeKey) {
										var GCFItems = [];
										var updateGCFMethod;

										switch (draggedTo) {
											case 'columns':
												scope.$parent.vm[attrsVmKey][i].groups = false;
												scope.$parent.vm[attrsVmKey][i].columns = true;
												GCFItems = columns;
												updateGCFMethod = function () {scope.evDataService.setColumns(GCFItems);};
												break;
											case 'filters':
												scope.$parent.vm[attrsVmKey][i].groups = false;
												scope.$parent.vm[attrsVmKey][i].columns = false;
												scope.$parent.vm[attrsVmKey][i].filters = true;
												GCFItems = filters;
												updateGCFMethod = function () {scope.evDataService.setFilters(GCFItems);};
												break;
										}

										var attrData = JSON.parse(JSON.stringify(scope.$parent.vm[attrsVmKey][i]));

										if (nextSibling) {
											var nextSiblingKey = nextSibling.dataset.attributeKey;
										}

										attributeChanged = true;

										if (draggedTo === 'groups') {

											if (scope.$parent.vm[attrsVmKey][i].groups) {

												drake.cancel();

												$mdDialog.show({
													controller: 'WarningDialogController as vm',
													templateUrl: 'views/dialogs/warning-dialog-view.html',
													parent: angular.element(document.body),
													clickOutsideToClose: false,
													multiple: true,
													locals: {
														warning: {
															title: 'Error',
															description: 'There is already such group in Grouping Area',
															actionsButtons: [{
																name: "OK",
																response: false
															}]
														}
													}
												});

											} else {
												scope.$parent.vm[attrsVmKey][i].groups = true;
												groups.push(attrData);
												scope.evDataService.setGroups(groups);
											}

										}

										else {

											var insertAttr = true;

											for (var a = 0; a < GCFItems.length; a++) { // search for the same attr

												if (GCFItems[a].key === attributeKey) {

													GCFItems[a].groups = attrData.groups
													GCFItems[a].columns = attrData.columns
													GCFItems[a].groups = attrData.groups

													if (nextSiblingKey === attributeKey) { // attr already in right place

														insertAttr = false;

													} else { // remove attribute before inserting it into another index

														attrData = JSON.parse(JSON.stringify(GCFItems[a]));
														GCFItems.splice(a, 1);

													}

													break;
												}

											}

											if (insertAttr) {

												if (nextSibling && draggedTo !== 'filters') { // the user can only spill filters at the end of the list

													for (var a = 0; a < GCFItems.length; a++) {

														var GCFElem = GCFItems[a];

														if (GCFElem.key === nextSiblingKey) {

															GCFItems.splice(a, 0, attrData);
															break;

														}

													}

												} else {
													GCFItems.push(attrData);
												}

											}

											updateGCFMethod();

										}

										break;
									}

								}

							}; */

						var changeToColumn = function () {
							var draggedAttribute = scope.$parent.vm[attrsVmKey].find(
								(attr) => attr.key === attributeKey
							)

							draggedAttribute.groups = false
							draggedAttribute.columns = true

							var attrData = JSON.parse(JSON.stringify(draggedAttribute))

							if (nextSibling) {
								var nextSiblingKey = nextSibling.dataset.attributeKey
							}

							attributeChanged = true

							var insertAttr = true

							for (var a = 0; a < columns.length; a++) {
								// search for the same attr

								if (columns[a].key === attributeKey) {
									columns[a].groups = attrData.groups
									columns[a].columns = attrData.columns
									columns[a].groups = attrData.groups

									if (nextSiblingKey === attributeKey) {
										// attr already in right place

										insertAttr = false
									} else {
										// remove attribute before inserting it into another index

										attrData = JSON.parse(JSON.stringify(columns[a]))
										columns.splice(a, 1)
									}

									break
								}
							}

							if (insertAttr) {
								if (nextSibling) {
									for (var a = 0; a < columns.length; a++) {
										if (columns[a].key === nextSiblingKey) {
											columns.splice(a, 0, attrData)
											break
										}
									}
								} else {
									columns.push(attrData)
								}

								scope.evDataService.setColumns(columns)
							}
						}

						var changeToGroup = function () {
							var draggedAttribute = scope.$parent.vm[attrsVmKey].find(
								(attr) => attr.key === attributeKey
							)

							if (draggedAttribute.groups) {
								drake.cancel()

								$mdDialog.show({
									controller: 'WarningDialogController as vm',
									templateUrl: 'views/dialogs/warning-dialog-view.html',
									clickOutsideToClose: false,
									multiple: true,
									locals: {
										warning: {
											title: 'Error',
											description:
												'There is already such group in Grouping Area',
											actionsButtons: [
												{
													name: 'OK',
													response: false,
												},
											],
										},
									},
								})
							} else {
								draggedAttribute.groups = true
								attributeChanged = true
							}
						}

						var changeOrder = function (orderOf) {
							var CGFItems = []
							var GCFHtmlElems = []
							var updateGCFMethod

							var elemsAfterDragging = []
							var colsWithGroupsKeys = []

							switch (orderOf) {
								case 'groups':
									CGFItems = groups
									GCFHtmlElems = source.querySelectorAll('.vcSelectedGroupItem')
									updateGCFMethod = function () {
										scope.evDataService.setGroups(elemsAfterDragging)
										scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
									}
									break
								case 'columns':
									CGFItems = columns
									GCFHtmlElems = source.querySelectorAll(
										'.vcSelectedColumnItem'
									)
									updateGCFMethod = function () {
										scope.evDataService.setColumns(elemsAfterDragging)
										scope.evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
									}
									break
								/* case 'filters':
                                        CGFItems = filters;
                                        GCFHtmlElems = source.querySelectorAll('.vcSelectedFilterItem');
                                        updateGCFMethod = function () {
                                            scope.evDataService.setFilters(elemsAfterDragging);
                                            scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
                                        };
                                        break; */
							}

							if (orderOf === 'columns') {
								for (var i = 0; i < GCFHtmlElems.length; i = i + 1) {
									var GCFElemKey = GCFHtmlElems[i].dataset.attributeKey

									for (var x = 0; x < groups.length; x = x + 1) {
										if (GCFElemKey === groups[x].key) {
											colsWithGroupsKeys.push(groups[x].key)
											elemsAfterDragging.push(groups[x])
											break
										}
									}
								}
							}

							for (var i = 0; i < GCFHtmlElems.length; i = i + 1) {
								var GCFElemKey = GCFHtmlElems[i].dataset.attributeKey

								for (var x = 0; x < CGFItems.length; x = x + 1) {
									if (
										GCFElemKey === CGFItems[x].key &&
										colsWithGroupsKeys.indexOf(CGFItems[x].key) === -1
									) {
										elemsAfterDragging.push(CGFItems[x])
										break
									}
								}
							}

							var isChanged = false

							for (var i = 0; i < elemsAfterDragging.length; i++) {
								var CGFElem = elemsAfterDragging[i]

								if (CGFElem.key !== CGFItems[i].key) {
									isChanged = true
									break
								}
							}

							if (isChanged) {
								updateGCFMethod()
								scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
							}
						}

						// dragging from groups
						if (source.classList.contains('vcSelectedGroups')) {
							// dragged to columns
							if (target.classList.contains('vcSelectedColumns')) {
								changeToColumn()
								// < dragged to columns >

								// dragged to filters
							} else if (target.classList.contains('vcSelectedFilters')) {
								scope.$parent.vm[attrsVmKey] =
									gModalSharedLogicHelper.onDropToSelectedFilter(
										scope.$parent.vm[attrsVmKey],
										attributeKey
									)
								attributeChanged = true
								// < dragged to filters >

								// If group's order changed
							} else if (target.classList.contains('vcSelectedGroups')) {
								changeOrder('groups')
								// < If group's order changed >
							}
						}
						// < dragging from groups >
						// dragging from columns
						else if (source.classList.contains('vcSelectedColumns')) {
							// dragged to groups
							if (target.classList.contains('vcSelectedGroups')) {
								changeToGroup()
								// < dragged to groups >

								// dragged to filters
							} else if (target.classList.contains('vcSelectedFilters')) {
								scope.$parent.vm[attrsVmKey] =
									gModalSharedLogicHelper.onDropToSelectedFilter(
										scope.$parent.vm[attrsVmKey],
										attributeKey
									)
								attributeChanged = true
								// < dragged to filters >

								// If column's order changed
							} else if (target.classList.contains('vcSelectedColumns')) {
								var hasMatchingGroup = false

								for (var i = 0; i < groups.length; i++) {
									if (groups[i].key === attributeKey) {
										hasMatchingGroup = true
										break
									}
								}

								if (!hasMatchingGroup) {
									changeOrder('columns')
								} else {
									drake.cancel()

									$mdDialog.show({
										controller: 'WarningDialogController as vm',
										templateUrl: 'views/dialogs/warning-dialog-view.html',
										parent: angular.element(document.body),
										clickOutsideToClose: false,
										multiple: true,
										locals: {
											warning: {
												title: 'Error',
												description:
													"You can't change column's order if it has group.",
												actionsButtons: [
													{
														name: 'OK',
														response: false,
													},
												],
											},
										},
									})
								}
								// < If column's order changed >
							}
						}
						// < dragging from columns >
						// dragging from filters
						else if (source.classList.contains('vcSelectedFilters')) {
							// dragged to groups
							if (target.classList.contains('vcSelectedGroups')) {
								changeToGroup()
								// < dragged to groups >

								// dragged to columns
							} else if (target.classList.contains('vcSelectedColumns')) {
								changeToColumn()
								// < dragged to columns >
							}
						}
						// < dragging from filters >

						if (attributeChanged) {
							// does not trigger on order change

							scope.updateAttrsCallback({
								attrs: scope.$parent.vm[attrsVmKey],
							}) // GROUPS_CHANGE, COLUMNS_CHANGE, FILTERS_CHANGE dispatched by this callback
							drake.remove() // adds delay when called after attributes order change in selected group

							setTimeout(function () {
								// removes delay of attribute appearance in "Groups" area
								scope.$apply()
							}, 0)
						}

						elem.classList.remove('vc-shadow-elem')
					})

					drake.on('dragend', function (elem) {
						scrollHelper.disableDnDWheelScroll()

						if (sourceContainer) {
							sourceContainer.classList.remove('dragged-out-card-space')
						}

						if (containerWithShadow) {
							containerWithShadow.classList.remove('remove-card-space')
							containerWithShadow.classList.remove(
								'vc-groups-container-shadowed'
							)
						}
					})
				},

				selectedDragulaInit: function () {
					const groupsContainer = document.querySelector('.vcSelectedGroups')
					const columnsContainer = document.querySelector('.vcSelectedColumns')
					const filtersContainer = document.querySelector('.vcSelectedFilters')

					var items = [groupsContainer, columnsContainer, filtersContainer]

					this.dragula = dragula(items, {
						revertOnSpill: true,
						moves: function (el, target, source, nextSibling) {
							if (el.classList.contains('itemWithError')) {
								return false
							}

							return true
						},
						accepts: function (el, target, source, nextSibling) {
							if (source === filtersContainer && target === filtersContainer) {
								return false
							}

							return true
						},
					})
				},

				destroy: function () {
					this.dragula.destroy()
				},
			}

			var init = function () {
				setTimeout(function () {
					var DnDScrollElem = document.querySelector('.vc-dnd-scrollable-elem')
					scrollHelper.setDnDScrollElem(DnDScrollElem)

					// viewConstructorDnD.init();
					selectedDnD.init()
				})
			}

			init()

			scope.$on('$destroy', function () {
				// viewConstructorDnD.destroy();
				selectedDnD.destroy()
			})
		},
	}
}
