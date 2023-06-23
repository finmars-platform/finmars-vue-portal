/**
 * Created by mevstratov on 31.05.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = data.title

	if (!data.datesTree) {
		vm.datesTree = []
	} else {
		vm.datesTree = JSON.parse(JSON.stringify(data.datesTree))
	}

	var datesList = data.datesList

	if (!datesList) {
		datesList = []
	}

	vm.readyStatus = false

	vm.allItemsSelected = false
	vm.allGroupsExpanded = false

	var formatDatesList = function () {
		datesList = datesList.map(function (date) {
			return {
				value: new Date(date.value),
				available: true,
				active: false,
			}
		})
	}

	/*var checkForDatesAvailability = function () {

            vm.savedDatesList.map(function (sDate) {

                var dateIsAvailable = false;

                sDate.value = new Date(sDate.value);

                var i;
                for (i = 0; i < datesList.length; i++) {
                    console.log("date tree compare dates", datesList[i], sDate);
                    console.log("date tree compare dates", datesList[i].value.toDateString(), new Date(sDate.value).toDateString());
                    if (datesList[i].value.toDateString() === new Date(sDate.value).toDateString()) {

                        datesList[i].available = true;
                        datesList[i].active = sDate.active;
                        dateIsAvailable = true;
                        break;
                    }

                }

                if (!dateIsAvailable) {
                    sDate.available = false;

                    datesList.push(sDate);

                }

            });

            console.log("date tree unavailableDates", datesList, unavailableDates);

        };*/

	var checkForInactiveYears = function () {
		var allItemsSelected = false

		var i
		for (i = 0; i < vm.datesTree.length; i++) {
			if (!vm.datesTree[i].available) {
				if (!vm.datesTree[i].active) {
					// Only inactive unavailable checkboxes affect Select All checkbox status
					allItemsSelected = false
					break
				}
			} else {
				if (vm.datesTree[i].active) {
					allItemsSelected = true
				} else {
					allItemsSelected = false
					break
				}
			}
		}

		vm.allItemsSelected = allItemsSelected
	}

	/*var setDateGroupsCheckboxesState = function () {

            vm.datesTree.map(function (yearGroup) {

                var monthsSelected = false;
                var monthsNotSelected = false;

                yearGroup.items.map(function (monthGroup) {

                    var daysSelected = false;
                    var daysNotSelected = false;

                    monthGroup.items.map(function (date) {

                        if (date.active) {
                            daysSelected = true;
                        } else {
                            daysNotSelected = true;
                        }

                    });

                    if (daysSelected && !daysNotSelected) {

                        monthGroup.active = true;
                        monthGroup.someChildrenActive = false;

                        monthsSelected = true;

                    } else if (daysSelected && daysNotSelected) {

                        monthGroup.active = false;
                        monthGroup.someChildrenActive = true;

                        monthsNotSelected = true;

                    } else {

                        monthGroup.active = false;
                        monthGroup.someChildrenActive = false;

                        monthsNotSelected = true;
                    }

                });

                if (monthsSelected && !monthsNotSelected) {

                    yearGroup.active = true;
                    yearGroup.someChildrenActive = false;

                } else if (monthsSelected && monthsNotSelected) {

                    yearGroup.active = false;
                    yearGroup.someChildrenActive = true;


                } else {

                    yearGroup.active = false;
                    yearGroup.someChildrenActive = false;

                }

            });

        };*/

	var checkDatesTreeForUnavailableGroups = function () {
		vm.datesTree.forEach(function (yearGroup) {
			var noAvailableMonths = true

			yearGroup.items.forEach(function (monthGroup) {
				var noAvailableDays = true

				monthGroup.items.map(function (date) {
					if (date.available) {
						noAvailableDays = false
					}
				})

				if (!noAvailableDays) {
					monthGroup.available = true
					noAvailableMonths = false
				}
			})

			if (!noAvailableMonths) {
				yearGroup.available = true
			}
		})
	}

	var createDatesTree = function () {
		datesList.map(function (listDate) {
			var dateYear = listDate.value.getFullYear()
			var dateMonth = listDate.value.getMonth()
			var dateMonthName = listDate.value.toLocaleDateString('default', {
				month: 'long',
			})
			var dateDay = listDate.value.toLocaleDateString('default', {
				day: '2-digit',
			})

			listDate.dayNumber = dateDay

			var noMatchingYearGroup = true
			var noMatchingMonthGroup = true
			var noMatchingDay = true

			var monthGroup = {
				number: dateMonth,
				name: dateMonthName,
				showDays: true,
				items: [listDate],
				available: true,
				active: false,
				someChildrenActive: false,
			}

			var yearGroup = {
				yearNumber: dateYear,
				showMonths: true,
				items: [monthGroup],
				available: true,
				active: false,
				someChildrenActive: false,
			}

			if (vm.datesTree.length > 0) {
				// if there are already groups by year, check if date belong to one of existing groups

				vm.datesTree.forEach(function (yearGroup) {
					if (yearGroup.yearNumber === dateYear) {
						noMatchingYearGroup = false

						if (yearGroup.items && yearGroup.items.length > 0) {
							// if there are already groups by month, check if date belong to one of existing groups

							yearGroup.items.forEach(function (monthGroup) {
								if (monthGroup.number === dateMonth) {
									noMatchingMonthGroup = false

									monthGroup.items.forEach(function (treeDate) {
										if (
											new Date(treeDate.value).toDateString() ===
											listDate.value.toDateString()
										) {
											treeDate.available = true
											noMatchingDay = false
											treeDate.dayNumber = dateDay
										}
									})

									if (noMatchingDay) {
										monthGroup.items.push(listDate)
									}
								}
							})
						}

						if (noMatchingMonthGroup) {
							// if there is no eligible month group, add it

							yearGroup.items.push(monthGroup)
						}
					}
				})
			}

			if (noMatchingYearGroup) {
				// if there is no eligible year group, add it

				vm.datesTree.push(yearGroup)
			}
		})

		checkDatesTreeForUnavailableGroups()
		checkForInactiveYears()
	}

	vm.expandCollapseAll = function () {
		var action = vm.allGroupsExpanded

		vm.datesTree.map(function (yearGroup) {
			yearGroup.showMonths = action

			yearGroup.items.map(function (monthGroup) {
				monthGroup.showDays = action
			})
		})

		vm.allGroupsExpanded = !vm.allGroupsExpanded
	}

	vm.toggleAllCheckboxes = function () {
		vm.allItemsSelected = !vm.allItemsSelected

		var active = vm.allItemsSelected

		vm.datesTree.forEach(function (yearGroup, yearIndex) {
			if (!yearGroup.available) {
				if (!active) {
					vm.datesTree.splice(yearIndex, 1)
				}
			} else {
				yearGroup.active = active
				yearGroup.someChildrenActive = false

				yearGroup.items.forEach(function (monthGroup, monthIndex) {
					if (!monthGroup.available) {
						if (!active) {
							yearGroup.items.splice(monthIndex, 1)
						}
					} else {
						monthGroup.active = active
						monthGroup.someChildrenActive = false

						monthGroup.items.forEach(function (date, dateIndex) {
							if (!date.available) {
								if (!active) {
									monthGroup.items.splice(dateIndex, 1)
								}
							} else {
								date.active = active
							}
						})
					}
				})
			}
		})
	}

	vm.onCheckboxClick = function (checkboxData, options) {
		checkboxData.active = !checkboxData.active

		if (checkboxData.someChildrenActive) {
			checkboxData.someChildrenActive = false
		}

		var active = checkboxData.active

		if (options.items) {
			options.items.forEach(function (item, index) {
				if (!item.available) {
					if (!active) {
						options.items.splice(index, 1)
					}
				} else {
					item.active = active
					item.someChildrenActive = false

					if (item.items) {
						item.items.forEach(function (chItem, chIndex) {
							if (!chItem.available) {
								if (!active) {
									item.items.splice(chIndex, 1)
								}
							} else {
								chItem.active = active
							}
						})
					}
				}
			})
		}

		if (options.parents) {
			// change parent's checkbox status

			options.parents = options.parents.map(function (parent) {
				// in array child group must precede parent group

				var itemsSelected = false
				var itemsNotSelected = false

				parent.items.map(function (parentItem) {
					if (parentItem.available) {
						if (parentItem.active) {
							itemsSelected = true
						} else {
							itemsNotSelected = true
						}
					}
				})

				if (itemsSelected && !itemsNotSelected) {
					parent.active = true
					parent.someChildrenActive = false
				} else if (itemsSelected && itemsNotSelected) {
					parent.active = false
					parent.someChildrenActive = true
				} else {
					parent.active = false
					parent.someChildrenActive = false
				}

				return parent
			})
		}

		checkForInactiveYears()
	}

	var init = function () {
		formatDatesList()

		/*if (vm.savedDatesList && vm.savedDatesList.length > 0) {
                checkForDatesAvailability();
            }*/

		createDatesTree()
		vm.readyStatus = true
	}

	init()

	vm.agree = function () {
		vm.datesTree.forEach(function (yearGroup) {
			delete yearGroup.available

			yearGroup.items.forEach(function (monthGroup) {
				delete monthGroup.available

				monthGroup.items.forEach(function (date) {
					delete date.available
				})
			})
		})

		var datesTree = JSON.parse(angular.toJson(vm.datesTree))

		$mdDialog.hide({ status: 'agree', data: { datesTree: datesTree } })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
