/**
 * Created by szhitenev on 05.05.2016.
 */


	import logService from '@/angular/core/services/logService'

	import evDataHelper from '../../helpers/ev-data.helper'
	import evEvents from '../../services/entityViewerEvents'
	import ScrollHelper from '../../helpers/scrollHelper'

	import metaService from '../../services/metaService'
	import GModalSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/gModalSharedLogicHelper'
	import evHelperService from '../../services/entityViewerHelperService'

	export default function (
		$scope,
		$mdDialog,
		entityViewerDataService,
		entityViewerEventService,
		attributeDataService,
		contentWrapElement
	) {
		var vm = this

		var sharedLogicHelper = new GModalSharedLogicHelper(vm)

		vm.readyStatus = { content: false }

		vm.entityViewerDataService = entityViewerDataService
		vm.entityViewerEventService = entityViewerEventService
		vm.attributeDataService = attributeDataService

		vm.entityType = vm.entityViewerDataService.getEntityType()
		vm.contentType = vm.entityViewerDataService.getContentType()

		vm.shownFiltersType = 'backend' // used for gFilterSettingsBtnDirective inside view



		logService.property('vm.entityType', vm.entityType)

		vm.attrs = []
		vm.pricingAttrs = []
		vm.entityAttrs = []

		vm.userTextFields = []
		vm.userNumberFields = []
		vm.userDateFields = []

		vm.cardsDividedIntoTabs = true

		var columns = vm.entityViewerDataService.getColumns()
		var currentColumnsWidth = columns.length
		var filters = vm.entityViewerDataService.getFilters()
		var groups = vm.entityViewerDataService.getGroups()

		var scrollHelper

		vm.attrsList = []

		var attrsWithoutGroups = [
			'notes',
			'accounts',
			'responsibles',
			'counterparties',
			'transaction_types',
			'portfolios',
			'content_types',
		]
		var attrsWithoutFilters = ['notes']

		$('body').addClass('drag-dialog') // hide backdrop

		vm.getAttributes = function () {
			var viewContext = vm.entityViewerDataService.getViewContext()

			if (viewContext === 'reconciliation_viewer') {
				/*var columns = vm.entityViewerDataService.getColumns();

                ;

                vm.entityAttrs = columns.map(function (item) {
                    return item
                });*/
				vm.entityAttrs = vm.attributeDataService.getReconciliationAttributes()

				syncAttrs()
				getSelectedAttrs()

				vm.readyStatus.content = true
			} else {
				vm.entityAttrs =
					vm.attributeDataService.getEntityAttributesByEntityType(vm.entityType)

				var transactionUserFields =
					vm.attributeDataService.getTransactionUserFields()
				var instrumentUserFields =
					vm.attributeDataService.getInstrumentUserFields()

				vm.entityAttrs = vm.entityAttrs.filter(function (item) {
					var state = true

					for (var i = 0; i < transactionUserFields.length; i = i + 1) {
						if (item.key === transactionUserFields[i].key) {
							state = transactionUserFields[i].is_active
							break
						}
					}

					return state
				})

				vm.entityAttrs = vm.entityAttrs.filter(function (item, index) {
					if (
						item.key === 'subgroup' &&
						item.value_entity.indexOf('strategy') !== -1
					) {
						item.name = 'Group'
					}

					item.entity = vm.entityType

					if (vm.entityType === 'instrument') {
						for (var i = 0; i < instrumentUserFields.length; i++) {
							var instrumentField = instrumentUserFields[i]

							if (item.key === instrumentField.key) {
								item.name = instrumentField.name
								break
							}
						}

						if (item.key.indexOf('user_text_') !== -1) {
							vm.userTextFields.push(item)
							return false
						}
					} else {
						for (var i = 0; i < transactionUserFields.length; i++) {
							var transField = transactionUserFields[i]

							if (item.key === transField.key) {
								item.name = transField.name
								break
							}
						}

						if (item.key.indexOf('user_text_') !== -1) {
							vm.userTextFields.push(item)
							return false
						} else if (item.key.indexOf('user_number_') !== -1) {
							vm.userNumberFields.push(item)
							return false
						} else if (item.key.indexOf('user_date_') !== -1) {
							vm.userDateFields.push(item)
							return false
						}
					}

					return true
				})

				vm.attrs = vm.attributeDataService.getDynamicAttributesByEntityType(
					vm.entityType
				)



				vm.attrs = vm.attrs.map(function (attribute) {
					var result = {}

					result.attribute_type = Object.assign({}, attribute)
					result.value_type = attribute.value_type
					result.content_type = vm.contentType
					result.key = 'attributes.' + attribute.user_code
					result.name = attribute.name

					return result
				})

				vm.pricingAttrs = vm.attrs.filter(function (item) {
					return item.key.indexOf('pricing_policy_') !== -1
				})

				vm.attrs = vm.attrs.filter(function (item) {
					return item.key.indexOf('pricing_policy_') === -1
				})

				vm.attrsList = vm.attrsList.concat(vm.entityAttrs)
				vm.attrsList = vm.attrsList.concat(vm.userTextFields)
				vm.attrsList = vm.attrsList.concat(vm.userNumberFields)
				vm.attrsList = vm.attrsList.concat(vm.userDateFields)
				vm.attrsList = vm.attrsList.concat(vm.attrs)
				vm.attrsList = vm.attrsList.concat(vm.pricingAttrs)

				syncAttrs()
				getSelectedAttrs()

				vm.readyStatus.content = true
			}
		}

		var updateCustomAttrs = function () {
			vm.attributeDataService
				.downloadDynamicAttributesByEntityType(vm.entityType)
				.then(function (data) {
					vm.attrs = data

					vm.attrs = vm.attrs.map(function (attribute) {
						var result = {}

						result.attribute_type = Object.assign({}, attribute)
						result.value_type = attribute.value_type
						result.content_type = vm.contentType
						result.key = 'attributes.' + attribute.user_code
						result.name = attribute.name

						return result
					})

					vm.attrsList = []

					vm.attrsList = vm.attrsList.concat(vm.entityAttrs)
					vm.attrsList = vm.attrsList.concat(vm.userTextFields)
					vm.attrsList = vm.attrsList.concat(vm.userNumberFields)
					vm.attrsList = vm.attrsList.concat(vm.userDateFields)
					vm.attrsList = vm.attrsList.concat(vm.attrs)

					vm.updateAttrs(vm.attrs)
				})
		}

		vm.checkAreaAccessibility = function (item, type) {
			if (type === 'group') {
				if (attrsWithoutGroups.indexOf(item.key) !== -1) {
					return true
				}
				return false
			} else if (type === 'filter') {
				if (item.value_type === 'mc_field') {
					return false
				}

				if (attrsWithoutFilters.indexOf(item.key) !== -1) {
					return true
				}

				return false
			}
		}

		var syncAttrs = function () {
			syncTypeAttrs(vm.entityAttrs)
			syncTypeAttrs(vm.attrs)

			syncTypeAttrs(vm.userTextFields)
			syncTypeAttrs(vm.userNumberFields)
			syncTypeAttrs(vm.userDateFields)
		}

		function syncTypeAttrs(attrs) {
			var i
			for (i = 0; i < attrs.length; i = i + 1) {
				attrs[i].columns = false
				attrs[i].groups = false
				attrs[i].filters = false

				groups.map(function (item) {
					if (attrs[i].key === item.key) {
						attrs[i].groups = true
					}
					return item
				})

				columns.map(function (item) {
					if (attrs[i].key === item.key) {
						attrs[i].columns = true
					}
					return item
				})

				/* filters.frontend.map(function (item) {
                    if (attrs[i].key === item.key) {
                        attrs[i].filters = true;
                    }
                    return item;
                }); */

				filters.backend.map(function (item) {
					if (attrs[i].key === item.key) {
						attrs[i].filters = true
					}
					return item
				})
			}
		}

		function updateTypeAttrs(typeAttrs) {
			var i, c, g, f
			var columnExist, groupExist, filterExist

			for (i = 0; i < typeAttrs.length; i = i + 1) {
				columnExist = false
				groupExist = false
				filterExist = false
				for (c = 0; c < columns.length; c = c + 1) {
					if (typeAttrs[i].hasOwnProperty('key')) {
						if (typeAttrs[i].key === columns[c].key) {
							columnExist = true
							if (typeAttrs[i].columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
							break
						}
					} else {
						if (typeAttrs[i].name === columns[c].name) {
							// for ttype inputs?
							columnExist = true
							if (typeAttrs[i].columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
							break
						}
					}
				}

				if (!columnExist) {
					if (typeAttrs[i].columns === true) {
						var columnToAdd = evHelperService.getTableAttrInFormOf(
							'column',
							typeAttrs[i]
						)
						columns.push(columnToAdd)
					}
				}

		@/angularROUPING

				for (g = 0; g < groups.length; g = g + 1) {
					if (typeAttrs[i].hasOwnProperty('key')) {
						if (typeAttrs[i].key === groups[g].key) {
							groupExist = true
							if (typeAttrs[i].groups === false) {
								groups.splice(g, 1)
								g = g - 1
							}
							break
						}
					}
				}

				if (!groupExist) {
					if (typeAttrs[i].groups === true) {
						var groupToAdd = evHelperService.getTableAttrInFormOf(
							'group',
							typeAttrs[i]
						)
						groups.push(groupToAdd)
					}
				}

				//region FILTERING

				var checkForFilterExistence = function (filtersList) {
					for (f = 0; f < filtersList.length; f = f + 1) {
						if (typeAttrs[i].key === filtersList[f].key) {
							filterExist = true

							if (typeAttrs[i].filters === false) {
								filtersList.splice(f, 1)
								f = f - 1
							}

							break
						}
					}

					return filtersList
				}

				// filters.frontend = checkForFilterExistence(filters.frontend);
				filters.backend = checkForFilterExistence(filters.backend)

				if (!filterExist) {
					if (typeAttrs[i].filters === true) {
						var filterToAdd = evHelperService.getTableAttrInFormOf(
							'filter',
							typeAttrs[i]
						)
						filters.backend.push(filterToAdd)
					}
				}
				//endregion
			}

			vm.entityViewerDataService.setColumns(columns)
			vm.entityViewerDataService.setGroups(groups)
			vm.entityViewerDataService.setFilters(filters)
		}

		vm.updateAttrs = function (attributes) {
			updateTypeAttrs(attributes)

			addColumn()

			evDataHelper.updateColumnsIds(vm.entityViewerDataService)
			evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService)

			vm.entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

			vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}

		// format data for SELECTED tab
		var selectedGroups = []
		var selectedColumns = []
		var selectedFilters = []

		var isAttrInsideOfAnotherGroup = function (attrKey, groupType) {
			let group1, group2

			switch (groupType) {
				case 'groups':
					group1 = columns
					group2 = filters.backend
					break

				case 'columns':
					group1 = groups
					group2 = filters.backend
					break

				case 'filters':
					group1 = groups
					group2 = columns
					break
			}

			let attrIndex = group1.findIndex((attr) => {
				return attr.key === attrKey
			})

			if (attrIndex < 0) {
				attrIndex = group2.findIndex((attr) => {
					return attr.key === attrKey
				})
			}

			return attrIndex > -1
		}

		/* var updateSelectedAttr = function (attr, selectedAttrs) {

            const existingAttrIndex = selectedAttrs.findIndex(selAttr => attr.key === selAttr.key);

            if (existingAttrIndex < 0) {
                selectedAttrs.push(attr);
            } else {
                selectedAttrs[existingAttrIndex] = attr;
            }

        };

        var separateSelectedAttrs = function (attributes, attrsVmKey) {

            for (var i = 0; i < attributes.length; i++) {

                var attribute = JSON.parse(angular.toJson(attributes[i]));
                attribute['attrsVmKey'] = attrsVmKey; // used inside HTML for vm.onSelectedAttrsChange()

                // attrsVmKey used in vm.updateAttrs and selectedDnD
                if (attribute.columns) {
                    updateSelectedAttr(attribute, selectedColumns);

                } else if (attribute.groups) {
                    updateSelectedAttr(attribute, selectedGroups);

                }

                if (attribute.filters) {
                    updateSelectedAttr(attribute, selectedFilters);
                }

            }

        };

        var organizeSelectedAttrs = function (insideTable, selectedAttrs, groupType) { // putting selected attributes in the same order as in the table

            // All items from insideTable starts the array in Order by insideTable, other items from selectedAttrs adds to end of array
            let selectedAttrsObj = {};
            let inactiveAttrs = [];

            selectedAttrs.forEach((attr) => {

                if (attr) {

                    if (attr[groupType]) {
                        selectedAttrsObj[attr.key] = attr

                    } else if (!isAttrInsideOfAnotherGroup(attr.key, groupType)) {

                        inactiveAttrs.push(attr);

                    }

                }

            });

            let orderedAttrs = insideTable.map(function (attr) {

                return selectedAttrsObj[attr.key];

            });

            orderedAttrs = orderedAttrs.concat(inactiveAttrs);

            return orderedAttrs;

        }; */

		vm.selectedGroups = []
		vm.selectedColumns = []
		vm.selectedFilters = []

		var getSelectedAttrs = function () {
			/* selectedGroups = vm.selectedGroups;
            selectedColumns = vm.selectedColumns;
            selectedFilters = vm.selectedFilters;

            separateSelectedAttrs(vm.entityAttrs, 'entityAttrs');
            separateSelectedAttrs(vm.attrs, 'attrs');

            separateSelectedAttrs(vm.userTextFields, 'userTextFields');
            separateSelectedAttrs(vm.userNumberFields, 'userNumberFields');
            separateSelectedAttrs(vm.userDateFields, 'userDateFields');

            // Order selected as they are inside the table
            vm.selectedGroups = organizeSelectedAttrs(groups, selectedGroups, 'groups');
            vm.selectedColumns = organizeSelectedAttrs(columns, selectedColumns, 'columns');
            vm.selectedFilters = organizeSelectedAttrs(filters.backend, selectedFilters, 'filters'); */
			const attributesLists = [
				'entityAttrs',
				'attrs',
				'userTextFields',
				'userNumberFields',
				'userDateFields',
			]

			const attrGroups = { groups, columns, filters: filters.backend } // Victor 2020.12.10 I need variables: groups, columns, filters in sharedLogicHelper

			sharedLogicHelper.getSelectedAttrs(attributesLists, attrGroups)

			vm.selectedGroups = vm.selectedGroups.filter((group) => {
				const hasNoMatchingColumn = !!!vm.selectedColumns.find(
					(column) => column.key === group.key
				)
				return hasNoMatchingColumn
			})
		}

		// < format data for SELECTED tab >

		vm.onSelectedAttrsChange = function (attributesList, selectedAttr) {


			for (var i = 0; i < attributesList.length; i++) {
				if (attributesList[i].key === selectedAttr.key) {
					attributesList[i].groups = selectedAttr.groups
					attributesList[i].columns = selectedAttr.columns
					attributesList[i].filters = selectedAttr.filters
					break
				}
			}

			vm.updateAttrs(attributesList)
		}

		/* var viewConstructorDnD = {

            init: function () {
                this.dragula();
                this.eventListeners();
            },

            eventListeners: function () {

                var exist = false;
                var existedAttrGroup = '';

                this.dragula.on('over', function (elem, container, source) {
                    $(container).addClass('active');
                    $(container).on('mouseleave', function () {
                        $(this).removeClass('active');
                    })

                });
                this.dragula.on('drop', function (elem, target) {

                    $(target).removeClass('active');
                    // var name = $(elem).html();
                    var identifier = $(elem).attr('data-key-identifier');
                    var i;

                    exist = false;

                    if (target === contentWrapElement.querySelector('#columnsbag') ||
                        target === contentWrapElement.querySelector('.g-columns-holder')) {
                        for (i = 0; i < columns.length; i = i + 1) {
                            if (columns[i].key === identifier) {
                                exist = true;
                                existedAttrGroup = 'column';
                            }
                            /!*if (columns[i].name === name) {
                                exist = true;
                            }*!/
                        }
                    }

                    if (target === contentWrapElement.querySelector('#groupsbag') ||
                        target === contentWrapElement.querySelector('.g-groups-holder')) {
                        for (i = 0; i < groups.length; i = i + 1) {
                            /!*if (groups[i].name === name) {
                                exist = true;
                            }*!/
                            if (groups[i].key === identifier) {
                                exist = true;
                                existedAttrGroup = 'group';
                            }
                        }
                    }

                    if (target === contentWrapElement.querySelector('#filtersbag .drop-new-filter') ||
                        target === contentWrapElement.querySelector('.g-filters-holder')) {
                        for (i = 0; i < filters.length; i = i + 1) {
                            /!*if (filters[i].name === name) {
                                exist = true;
                            }*!/

                            if (filters[i].key === identifier) {
                                exist = true;
                                existedAttrGroup = 'filter';
                            }
                        }
                    }

                    if (!exist && target) {
                        var a;

                        var nodes = Array.prototype.slice.call(target.children);
                        var index = nodes.indexOf(elem);

                        if (target === contentWrapElement.querySelector('.g-columns-holder') ||
                            target === contentWrapElement.querySelector('#columnsbag')) {

                            for (a = 0; a < vm.attrsList.length; a = a + 1) {

                                if (vm.attrsList[a].key === identifier) {

                                    if (target === contentWrapElement.querySelector('#columnsbag')) {
                                        columns.push(vm.attrsList[a]);
                                    } else {
                                        columns.splice(index, 0, vm.attrsList[a]);
                                    }

                                    //columns.push(vm.attrsList[a]);
                                }

                            }
                            syncAttrs();
                            evDataHelper.updateColumnsIds(vm.entityViewerDataService);
                            evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService);
                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                        }

                        if (target === contentWrapElement.querySelector('#groupsbag') ||
                            target === contentWrapElement.querySelector('.g-groups-holder')) {

                            for (a = 0; a < vm.attrsList.length; a = a + 1) {

                                if (vm.attrsList[a].key === identifier) {

                                    if (target === contentWrapElement.querySelector('#groupsbag')) {
                                        groups.push(vm.attrsList[a]);
                                    } else {
                                        groups.splice(index, 0, vm.attrsList[a]);
                                    }

                                    //columns.push(vm.attrsList[a]);
                                }

                            }

                            syncAttrs();
                            evDataHelper.updateColumnsIds(vm.entityViewerDataService);
                            evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService);
                            vm.entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE);
                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                        }

                        if (target === contentWrapElement.querySelector('#filtersbag .drop-new-filter') ||
                            target === contentWrapElement.querySelector('.g-filters-holder')) {

                            for (a = 0; a < vm.attrsList.length; a = a + 1) {

                                if (vm.attrsList[a].key === identifier) {

                                    if (target === contentWrapElement.querySelector('#filtersbag .drop-new-filter')) {
                                        filters.push(vm.attrsList[a]);
                                    } else {
                                        filters.splice(index, 0, vm.attrsList[a]);
                                    }

                                }

                            }
                            syncAttrs();
                            evDataHelper.updateColumnsIds(vm.entityViewerDataService);
                            evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService);
                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                        }

                    } else if (exist && target) {

                        var errorMessage = 'Item should be unique';

                        if (existedAttrGroup) {
                            errorMessage = 'There is already such ' + existedAttrGroup + ' in Filter Area';
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
                                    description: errorMessage
                                }
                            }
                        });

                    }

                    $scope.$apply();
                });

                this.dragula.on('dragend', function (el) {
                    $scope.$apply();
                    $(el).remove();
                })
            },

            dragula: function () {

                var items = [
                    contentWrapElement.querySelector('.g-columns-holder'),
                    contentWrapElement.querySelector('#columnsbag'),
                    contentWrapElement.querySelector('.g-groups-holder'),
                    contentWrapElement.querySelector('#groupsbag'),
                    contentWrapElement.querySelector('.g-filters-holder'),
                    contentWrapElement.querySelector('#filtersbag .drop-new-filter')
                ];

                var i;
                var itemsElem = document.querySelectorAll('#dialogbag .vcDraggableCard');

                for (i = 0; i < itemsElem.length; i = i + 1) {
                    items.push(itemsElem[i]);
                }

                this.dragula = dragula(items,
                    {
                        accepts: function (el, target, source, sibling) {

                            //;

                            if (target.classList.contains('vcDraggableCard')) {
                                return false;
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

		// scroll while dragging
		/* var DnDScrollElem;
        var DnDScrollTimeOutId;
        var scrollSize = null;

        var DnDWheel = function (event) {
            event.preventDefault();

            var scrolled = DnDScrollElem.scrollTop;

            if (scrollSize === null) {
                scrollSize = scrolled;
            }

            if (event.deltaY > 0) {
                scrollSize = scrollSize + 100;
            } else {
                scrollSize = scrollSize - 100;
            }

            clearTimeout(DnDScrollTimeOutId);

            DnDScrollTimeOutId = setTimeout(function () { // timeout needed for smoother scroll
                DnDScrollElem.scroll({
                    top: Math.max(0, scrollSize)
                });
                scrollSize = null;
            }, 30);

        }; */
		// < scroll while dragging >

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
					if (containerWithShadow) {
						containerWithShadow.classList.remove('remove-card-space')
					}

					if (container === source) {
						source.classList.remove('dragged-out-card-space')
					} else {
						source.classList.add('dragged-out-card-space')

						container.classList.add('remove-card-space')
						containerWithShadow = container
						sourceContainer = source
					}
				})

				drake.on('drag', function () {
					scrollHelper.enableDnDWheelScroll()
				})

				drake.on('drop', function (elem, target, source, nextSibling) {
					var attributeChanged = false // needed to call view constructor data reload
					var attributeKey = elem.dataset.attributeKey
					var attrsVmKey = elem.dataset.vmKey

					/* var changeSelectedGroup = function (draggedTo) {

                        for (var i = 0; i < vm[attrsVmKey].length; i++) {

                            if (vm[attrsVmKey][i].key === attributeKey) {
                                var GCFItems = [];
                                var updateGCFMethod;

                                switch (draggedTo) {
                                    case 'groups':
                                        vm[attrsVmKey][i].groups = true;
                                        GCFItems = groups;
                                        updateGCFMethod = function () {
                                            vm.entityViewerDataService.setGroups(GCFItems);
                                        };
                                        break;
                                    case 'columns':
                                        vm[attrsVmKey][i].groups = false;
                                        vm[attrsVmKey][i].columns = true;
                                        GCFItems = columns;
                                        updateGCFMethod = function () {
                                            vm.entityViewerDataService.setColumns(GCFItems);
                                        };
                                        break;
                                    case 'filters':
                                        vm[attrsVmKey][i].groups = false;
                                        vm[attrsVmKey][i].columns = false;
                                        vm[attrsVmKey][i].filters = true;
                                        GCFItems = filters.backend;

                                        updateGCFMethod = function () {
                                            vm.entityViewerDataService.setFilters(GCFItems);
                                        };

                                        break;
                                }

                                var attrData = JSON.parse(JSON.stringify(vm[attrsVmKey][i]));
                                var insertAttr = true;

                                if (nextSibling) {
                                    var nextSiblingKey = nextSibling.dataset.attributeKey;
                                }

                                attributeChanged = true;

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

                                    if (nextSibling) {

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

                                break;
                            }

                        }

                    }; */
					var changeToColumn = function () {
						var draggedAttribute = vm[attrsVmKey].find(
							(attr) => attr.key === attributeKey
						)

						draggedAttribute.groups = false
						draggedAttribute.columns = true

						var attrData = JSON.parse(JSON.stringify(draggedAttribute))
						var insertAttr = true

						if (nextSibling) {
							var nextSiblingKey = nextSibling.dataset.attributeKey
						}

						attributeChanged = true

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

							vm.entityViewerDataService.setColumns(columns)
						}
					}

					var changeOrder = function (orderOf) {
						var CGFElems = []
						var GCFHtmlElems = []
						var updateGCFMethod

						var elemsAfterDragging = []

						switch (orderOf) {
							case 'groups':
								CGFElems = groups
								GCFHtmlElems = source.querySelectorAll('.vcSelectedGroupItem')
								updateGCFMethod = function () {
									vm.entityViewerDataService.setGroups(elemsAfterDragging)
									vm.entityViewerEventService.dispatchEvent(
										evEvents.GROUPS_CHANGE
									)
								}
								break
							case 'columns':
								CGFElems = columns
								GCFHtmlElems = source.querySelectorAll('.vcSelectedColumnItem')
								updateGCFMethod = function () {
									vm.entityViewerDataService.setColumns(elemsAfterDragging)
									vm.entityViewerEventService.dispatchEvent(
										evEvents.COLUMNS_CHANGE
									)
								}
								break
							/* case 'filters':
                                CGFElems = filters;
                                GCFHtmlElems = source.querySelectorAll('.vcSelectedFilterItem');
                                updateGCFMethod = function () {
                                    vm.entityViewerDataService.setFilters(elemsAfterDragging);
                                    vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
                                };
                                break; */
						}

						for (var i = 0; i < GCFHtmlElems.length; i = i + 1) {
							var GCFElemKey = GCFHtmlElems[i].dataset.attributeKey

							for (var x = 0; x < CGFElems.length; x = x + 1) {
								if (GCFElemKey === CGFElems[x].key) {
									elemsAfterDragging.push(CGFElems[x])
									break
								}
							}
						}

						var isChanged = false

						for (var i = 0; i < elemsAfterDragging.length; i++) {
							var CGFElem = elemsAfterDragging[i]

							if (CGFElem.key !== CGFElems[i].key) {
								isChanged = true
								break
							}
						}

						if (isChanged) {
							updateGCFMethod()
							vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
							$scope.$apply()
						}
					}
					// dragging from columns
					if (source.classList.contains('vcSelectedColumns')) {
						// dragged to filters
						if (target.classList.contains('vcSelectedFilters')) {
							vm[attrsVmKey] = sharedLogicHelper.onDropToSelectedFilter(
								vm[attrsVmKey],
								attributeKey
							)
							attributeChanged = true
							// < dragged to filters >

							// If column's order changed
						} else if (target.classList.contains('vcSelectedColumns')) {
							changeOrder('columns')
							// < If column's order changed >
						}
					}
					// < dragging from columns >
					// dragging from filters
					else if (source.classList.contains('vcSelectedFilters')) {
						// dragged to columns
						if (target.classList.contains('vcSelectedColumns')) {
							changeToColumn()
						}
					}
					// < dragging from filters >

					if (attributeChanged) {
						// do not trigger on order change

						vm.updateAttrs(vm[attrsVmKey])
						drake.remove() // adds delay when called after attributes order change in selected group
					}
				})

				drake.on('dragend', function () {
					if (sourceContainer) {
						sourceContainer.classList.remove('dragged-out-card-space')
					}

					if (containerWithShadow) {
						containerWithShadow.classList.remove('remove-card-space')
					}

					scrollHelper.disableDnDWheelScroll()
				})
			},

			selectedDragulaInit: function () {
				// var groupsContainer = document.querySelector('.vcSelectedGroups');
				var columnsContainer = document.querySelector('.vcSelectedColumns')
				var filtersContainer = document.querySelector('.vcSelectedFilters')

				var items = [
					// groupsContainer,
					columnsContainer,
					filtersContainer,
				]

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

		/*var selectedDnD = {

            init: function () {
                this.selectedDragulaInit();
                this.eventListeners();
            },

            eventListeners: function () {

                var attributeChanged = false;
                var drake = this.dragula;

                drake.on('drag', function () {
                    document.addEventListener('wheel', DnDWheel);
                });

                drake.on('shadow', function (elem, container, source) {

                    var attrKey = elem.dataset.attributeKey;

                    if (container.classList.contains('vcSelectedGroups')) {
                        if (attrsWithoutGroups.indexOf(attrKey) !== -1) {
                            elem.remove();
                        }
                    }

                    if (container.classList.contains('vcSelectedFilters')) {
                        if (attrsWithoutFilters.indexOf(attrKey) !== -1) {
                            elem.remove();
                        }
                    }
                });

                drake.on('drop', function (elem, target, source, nextSibling) {

                    var attributeKey = elem.dataset.attributeKey;
                    var attrsVmKey = elem.dataset.vmKey;

                    // dragging from groups
                    if (source.classList.contains('vcSelectedGroups')) {

                        // dragged to columns
                        if (target.classList.contains('vcSelectedColumns')) {

                            attributeChanged = false;

                            for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                if (vm[attrsVmKey][i].key === attributeKey) {
                                    vm[attrsVmKey][i].groups = false;
                                    attributeChanged = true;
                                    break;
                                }
                            }
                        // < dragged to columns >

                        // dragged to filters
                        } else if (target.classList.contains('vcSelectedFilters')) {

                            if (attrsWithoutFilters.indexOf(attributeKey) !== -1) {

                                drake.cancel();

                            } else {

                                for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                    if (vm[attrsVmKey][i].key === attributeKey) {
                                        vm[attrsVmKey][i].groups = false;
                                        vm[attrsVmKey][i].columns = false;
                                        vm[attrsVmKey][i].filters = true;
                                        attributeChanged = true;
                                        break;
                                    }
                                }

                            }
                        // < dragged to filters >

                        // If group's order changed
                        } else if (target.classList.contains('vcSelectedGroups')) {

                            var groupElems = source.querySelectorAll('.vcSelectedGroupItem');

                            var groupsAfterDragging = [];

                            for (var i = 0; i < groupElems.length; i = i + 1) {

                                var groupElemKey = groupElems[i].dataset.attributeKey;

                                for (var x = 0; x < groups.length; x = x + 1) {

                                    if (groupElemKey === groups[x].key) {
                                        groupsAfterDragging.push(groups[x]);
                                        break;
                                    }

                                }

                            }

                            var isChanged = false;

                            for (var i = 0; i < groupsAfterDragging.length; i++) {
                                var group = groupsAfterDragging[i];

                                if (group.key !== groups[i].key) {
                                    isChanged = true;
                                    break;
                                }
                            }

                            if (isChanged) {

                                vm.entityViewerDataService.setGroups(groupsAfterDragging);

                                vm.entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE);
                                vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                                $scope.$apply();

                            }

                        // < If group's order changed >
                        }

                    // < dragging from groups >

                    // dragging from columns
                    } else if (source.classList.contains('vcSelectedColumns')) {

                        // dragged to groups
                        if (target.classList.contains('vcSelectedGroups')) {

                            if (attrsWithoutGroups.indexOf(attributeKey) !== -1) {

                                drake.cancel();

                            } else {
                                for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                    if (vm[attrsVmKey][i].key === attributeKey) {
                                        vm[attrsVmKey][i].groups = true;
                                        attributeChanged = true;
                                        break;
                                    }
                                }
                            }
                        // < dragged to groups >

                        // dragged to filters
                        } else if (target.classList.contains('vcSelectedFilters')) {

                            if (attrsWithoutFilters.indexOf(attributeKey) !== -1) {
                                drake.cancel();
                            } else {
                                for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                    if (vm[attrsVmKey][i].key === attributeKey) {
                                        vm[attrsVmKey][i].columns = false;
                                        vm[attrsVmKey][i].filters = true;
                                        attributeChanged = true;
                                        break;
                                    }
                                }
                            }
                        // < dragged to filters >

                        // If column's order changed
                        } else if (target.classList.contains('vcSelectedColumns')) {

                            var columnElems = source.querySelectorAll('.vcSelectedColumnItem');

                            var columnsAfterDragging = [];

                            for (var i = 0; i < columnElems.length; i = i + 1) {

                                var colElemKey = columnElems[i].dataset.attributeKey;

                                for (var x = 0; x < columns.length; x = x + 1) {

                                    if (colElemKey === columns[x].key) {
                                        columnsAfterDragging.push(columns[x]);
                                        break;
                                    }

                                }

                            }

                            var isChanged = false;

                            for (var i = 0; i < columnsAfterDragging.length; i++) {
                                var column = columnsAfterDragging[i];

                                if (column.key !== columns[i].key) {
                                    isChanged = true;
                                    break;
                                }
                            }

                            if (isChanged) {

                                vm.entityViewerDataService.setColumns(columnsAfterDragging);

                                vm.entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE);
                                vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                                $scope.$apply();

                            }

                        // < If column's order changed >
                        }
                    // < dragging from columns >

                    // dragging from filters
                    } else if (source.classList.contains('vcSelectedFilters')) {

                        // dragged to groups
                        if (target.classList.contains('vcSelectedGroups')) {

                            if (attrsWithoutGroups.indexOf(attributeKey) !== -1) {

                                drake.cancel();

                            } else {

                                for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                    if (vm[attrsVmKey][i].key === attributeKey) {
                                        vm[attrsVmKey][i].groups = true;
                                        attributeChanged = true;
                                        break;
                                    };
                                };
                            };
                        // < dragged to groups >

                        // dragged to columns
                        } else if (target.classList.contains('vcSelectedColumns')) {

                            for (var i = 0; i < vm[attrsVmKey].length; i++) {
                                if (vm[attrsVmKey][i].key === attributeKey) {
                                    vm[attrsVmKey][i].columns = true;
                                    attributeChanged = true;
                                    break;
                                };
                            };
                        // < dragged to columns >

                        // If filter's order changed
                        } else if (target.classList.contains('vcSelectedFilters')) {

                            var filterElems = source.querySelectorAll('.vcSelectedFilterItem');

                            var filtersAfterDragging = [];

                            for (var i = 0; i < filterElems.length; i = i + 1) {

                                var filterElemKey = filterElems[i].dataset.attributeKey;

                                for (var x = 0; x < filters.length; x = x + 1) {

                                    if (filterElemKey === filters[x].key) {
                                        filtersAfterDragging.push(filters[x]);
                                    }

                                }

                            }

                            var isChanged = false;

                            for (var i = 0; i < filtersAfterDragging.length; i++) {
                                var filter = filtersAfterDragging[i];

                                if (filter.key !== filters[i].key) {
                                    isChanged = true;
                                    break;
                                }
                            }

                            if (isChanged) {

                                vm.entityViewerDataService.setFilters(filtersAfterDragging);

                                vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE);
                                vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                                $scope.$apply();

                            }

                        // < If filter's order changed >
                        }

                    };
                    // < dragging from filters >

                    if (attributeChanged) {
                        $(elem).remove();
                        vm.updateAttrs(vm[attrsVmKey]);
                    };

                });

                drake.on('dragend', function () {
                    document.removeEventListener('wheel', DnDWheel);
                });

            },

            selectedDragulaInit: function () {

                var items = [
                    document.querySelector('.vcSelectedGroups'),
                    document.querySelector('.vcSelectedColumns'),
                    document.querySelector('.vcSelectedFilters')
                ];

                this.dragula = dragula(items, {
                    revertOnSpill: true
                });
            },

            destroy: function () {
                this.dragula.destroy();
            }
        };*/

		var addColumn = function () {
			if (currentColumnsWidth < columns.length) {
				metaService.columnsWidthGroups(true)
			} else {
				metaService.columnsWidthGroups(false)
			}
		}

		vm.selectAttribute = function (selectedGroup, event) {
			var availableAttrs = vm.attrsList.filter(function (attr) {
				return attr.value_type !== 'mc_field'
			})
			var dialogTitle

			switch (selectedGroup) {
				case 'column':
					dialogTitle = 'Choose column to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.columns
					})
					break
				case 'filter':
					dialogTitle = 'Choose filter to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						if (attrsWithoutFilters.indexOf(attr.key) === -1 || attr.filters) {
							return true
						}

						return false
					})
					break
			}

			$mdDialog
				.show({
					controller: 'TableAttributeSelectorDialogController as vm',
					templateUrl:
						'views/dialogs/table-attribute-selector-dialog-view.html',
					targetEvent: event,
					multiple: true,
					locals: {
						data: {
							availableAttrs: availableAttrs,
							title: dialogTitle,
							isReport: false,
							multiselector: true,
						},
					},
				})
				.then(function (res) {
					if (res && res.status === 'agree') {
						for (var j = 0; j < res.data.items.length; j++) {
							for (var i = 0; i < vm.attrsList.length; i++) {
								if (vm.attrsList[i].key === res.data.items[j].key) {
									if (selectedGroup === 'column') {
										vm.attrsList[i].columns = true
									} else {
										vm.attrsList[i].filters = true
									}
									break
								}
							}
						}

						vm.updateAttrs(vm.attrsList)
					}
				})
		}

		vm.manageAttrs = function (ev) {
			$mdDialog
				.show({
					controller: 'AttributesManagerDialogController as vm',
					templateUrl: 'views/dialogs/attributes-manager-dialog-view.html',
					targetEvent: ev,
					multiple: true,
					locals: {
						data: {
							entityType: vm.entityType,
						},
					},
				})
				.then(function (res) {
					if (res && res.status === 'agree') {
						updateCustomAttrs()
					}
				})
		}

		vm.initDnd = function () {
			setTimeout(function () {
				var DnDScrollElem = document.querySelector('.vc-dnd-scrollable-elem')
				scrollHelper.setDnDScrollElem(DnDScrollElem)

				// viewConstructorDnD.init();
				selectedDnD.init()
			}, 500)
		}

		vm.cancel = function () {
			$('body').removeClass('drag-dialog')
			// viewConstructorDnD.destroy();
			selectedDnD.destroy()

			$mdDialog.hide()
		}

		vm.MABtnVisibility = function (entityType) {
			return metaService.checkRestrictedEntityTypesForAM(entityType)
		}

		var init = function () {
			scrollHelper = new ScrollHelper()

			vm.getAttributes()

			vm.entityViewerEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					columns = vm.entityViewerDataService.getColumns()
					syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.GROUPS_CHANGE,
				function () {
					groups = vm.entityViewerDataService.getGroups()
					syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.FILTERS_CHANGE,
				function () {
					filters = vm.entityViewerDataService.getFilters()
					syncAttrs()
					getSelectedAttrs()
				}
			)
		}

		init()
	}

