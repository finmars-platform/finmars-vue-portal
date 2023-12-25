<template>
	<BaseModal
		:modelValue="modelValue"
		@update:modelValue="newVal => emit('update:modelValue', newVal)"
	>

		<div v-if="vm.readyStatus">

			<div class="flex-row m-b-24">

				<FmBtn type="icon"
					   class="date-tree-folding-btn"
						   @click="vm.expandCollapseAll()"
						   aria-label="date tree fold all button">
<!--					<span v-if="vm.allGroupsExpanded">+</span>
					<span v-if="!vm.allGroupsExpanded">-</span>-->
					<FmIcon
						:icon="vm.allGroupsExpanded ? 'expand_more' : 'expand_less'"
					/>
				</FmBtn>

				<span class="m-r-24">Expand / Collapse All</span>

				<FmCheckbox :modelValue="vm.allItemsSelected"
							@update:modelValue="newVal => vm.toggleAllCheckboxes(newVal)"
							aria-label="date tree toggle all checkbox"></FmCheckbox>

				<span>Select All</span>
			</div>

			<div v-for="year in vm.datesTree"
				 class="m-b-16"
				 v-show="year.available">

				<div class="flex-row m-b-16">
					<FmBtn type="icon"
						   class="date-tree-folding-btn"
						   @click="year.showMonths = !year.showMonths"
						   aria-label="date tree years folding button">
<!--						<span v-if="!year.showMonths">+</span>
						<span v-if="year.showMonths">-</span>-->
						<FmIcon
							:icon="year.showMonths ? 'expand_less' : 'expand_more'"
						/>
					</FmBtn>

					<FmCheckbox :modelValue="year.active"
								:partiallyChecked="year.someChildrenActive"
								:label="year.yearNumber"
								@update:modelValue="
								 	vm.onCheckboxClick(year, {items: year.items})
								"
								aria-label="date tree year"></FmCheckbox>
<!--					<span>{{ year.yearNumber }}</span>-->
				</div>

				<div v-show="year.showMonths">

					<div v-for="month in year.items"
						 v-show="month.available"
						 style="margin-left: 30px">

						<div class="flex-row m-b-16">
							<FmBtn type="icon" class="date-tree-folding-btn"
									   @click="month.showDays = !month.showDays"
									   aria-label="date tree months folding button">
<!--								<span v-if="!month.showDays">+</span>
								<span v-if="month.showDays">-</span>-->
								<FmIcon
									:icon="year.showDays ? 'expand_less' : 'expand_more'"
								/>
							</FmBtn>
							<FmCheckbox :modelValue="month.active"
										:partiallyChecked="month.someChildrenActive"
										:label="month.name"
										@update:modelValue="
										 	vm.onCheckboxClick(month, {items: month.items, parents: [year]})
										"
										aria-label="date tree month"></FmCheckbox>
<!--							<span>{{ month.name }}</span>-->
						</div>

						<div v-show="month.showDays" class="m-t-24">
							<div v-for="day in month.items"
								 v-show="day.available"
								 class="m-b-16"
								 style="margin-left: 65px">

								<FmCheckbox :modelValue="day.active"
											:label="day.dayNumber"
											@update:modelValue="
												vm.onCheckboxClick(day, {items: month.days, parents: [month, year]})
											"
											aria-label="date tree day"></FmCheckbox>
<!--								<span>{{ day.dayNumber }}</span>-->
							</div>
						</div>

					</div>
				</div>

			</div>
		</div>

		<div v-else style="min-height: 100px;">
			<FmLoader :size="60" positionCenter />
		</div>

		<template #controls="{ cancel }">
			<div class="flex sb">
				<FmBtn type="basic" @click="cancel()">cancel</FmBtn>
				<FmBtn @click="vm.agree(cancel)">save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

// stores
// props, emits
let props = defineProps({
	modelValue: Boolean,
	/* *
	 * @type [{
	 *
	 * 	items: [{	- months
	 *
	 * 		items: [{	- days
	 *			active: Boolean,
	 * 			value: String,	- 'YYYY-MM-DD'
	 * 		}]
	 *
	 * 		active: Boolean,
	 * 		name: String,
	 * 		number: Number,
	 * 		showDays: Boolean,
	 * 		someChildrenActive: Boolean,
	 * 	]}
	 *
	 * 	active: Boolean,
	 * 	showMonths: Boolean,
	 * 	someChildrenActive: Boolean,
	 * 	yearNumber: Number,
	 * }]
	 * */
	datesTree: {
		type: Array,
		default() {
			return [];
		},
	},
	/** List of dates available for selection */
	options: {
		type: Array,
		default() { return [] },
	},
})

let emit = defineEmits(['update:modelValue', 'save'])

let vm = reactive({})

vm.datesTree = JSON.parse(JSON.stringify(props.datesTree));

let datesList;

vm.readyStatus = false;

vm.allItemsSelected = false;
vm.allGroupsExpanded = false;

watch(
	() => props.modelValue,
	() => {

		if (props.modelValue) {
			init();
		}

	}
)

let formatDatesList = function () {
	datesList = datesList.map(function (date) {
		return {
			value: new Date(date.value),
			available: true,
			active: false
		};
	});

};

/**
 * Sorts datesTree
 *
 * @param {Array} items - years, months or days
 * @return {Array} - items sorted in descending order
 * @private
 */
const sortItemsR = items => {

	const sortHandler = (a, b) => {

		if ( a.hasOwnProperty('yearNumber') ) {
			return a.yearNumber - b.yearNumber;
		}

		if ( a.hasOwnProperty('number') ) {
			return a.number - b.number;
		}

		return a.dayNumber - b.dayNumber;

	}

	items.sort(sortHandler);

	if ( items[0] && items[0].items ) {

		items = items.map(item => {

			item.items = sortItemsR(item.items);

			return item;

		});

	}

	return items;

}

let checkForInactiveYears = function () {

	let allItemsSelected = false;

	let i;
	for (i = 0; i < vm.datesTree.length; i++) {

		if (!vm.datesTree[i].available) {

			if (!vm.datesTree[i].active) { // Only inactive unavailable checkboxes affect Select All checkbox status
				allItemsSelected = false;
				break;
			}

		} else {

			if (vm.datesTree[i].active) {
				allItemsSelected = true;
			} else {
				allItemsSelected = false;
				break;
			}

		}

	}

	vm.allItemsSelected = allItemsSelected;

};

let checkDatesTreeForUnavailableGroups = function () {

	vm.datesTree.forEach(function (yearGroup) {

		let noAvailableMonths = true;

		yearGroup.items.forEach(function (monthGroup) {

			let noAvailableDays = true;

			monthGroup.items.map(function (date) {

				if (date.available) {
					noAvailableDays = false;
				}

			});

			if (!noAvailableDays) {

				monthGroup.available = true;
				noAvailableMonths = false;

			}

		});

		if (!noAvailableMonths) {
			yearGroup.available = true;
		}

	});

};

let createDatesTree = function () {

	datesList.map(function (listDate) {

		let dateYear = listDate.value.getFullYear();
		let dateMonth = listDate.value.getMonth();
		let dateMonthName = listDate.value.toLocaleDateString('default', {month: "long"});
		let dateDay = listDate.value.toLocaleDateString('default', {day: "2-digit"});

		listDate.dayNumber = dateDay;

		let noMatchingYearGroup = true;
		let noMatchingMonthGroup = true;
		let noMatchingDay = true;

		let monthGroup = {
			number: dateMonth,
			name: dateMonthName,
			showDays: true,
			items: [listDate],
			available: true,
			active: false,
			someChildrenActive: false
		};

		let yearGroup = {
			yearNumber: dateYear,
			showMonths: true,
			items: [monthGroup],
			available: true,
			active: false,
			someChildrenActive: false
		};

		if (vm.datesTree.length > 0) { // if there are already groups by year, check if date belong to one of existing groups

			vm.datesTree.forEach(function (yearGroup) {

				if (yearGroup.yearNumber === dateYear) {

					noMatchingYearGroup = false;

					if (yearGroup.items && yearGroup.items.length > 0) { // if there are already groups by month, check if date belong to one of existing groups

						yearGroup.items.forEach(function (monthGroup) {

							if (monthGroup.number === dateMonth) {

								noMatchingMonthGroup = false;

								monthGroup.items.forEach(function (treeDate) {

									if (new Date(treeDate.value).toDateString() === listDate.value.toDateString()) {

										treeDate.available = true;
										noMatchingDay = false;
										treeDate.dayNumber = dateDay;

									}

								});

								if (noMatchingDay) {

									monthGroup.items.push(listDate);

								}

							}

						});

					}

					if (noMatchingMonthGroup) { // if there is no eligible month group, add it

						yearGroup.items.push(monthGroup);

					}

				}

			});

		}

		if (noMatchingYearGroup) { // if there is no eligible year group, add it

			vm.datesTree.push(yearGroup);

		}

	});

	vm.datesTree = sortItemsR(vm.datesTree);

	checkDatesTreeForUnavailableGroups();
	checkForInactiveYears();

};

vm.expandCollapseAll = function () {

	let action = vm.allGroupsExpanded;

	vm.datesTree.map(function (yearGroup) {

		yearGroup.showMonths = action;

		yearGroup.items.map(function (monthGroup) {

			monthGroup.showDays = action;

		});

	});

	vm.allGroupsExpanded = !vm.allGroupsExpanded;

};

vm.toggleAllCheckboxes = function (newState) {

	// vm.allItemsSelected = !vm.allItemsSelected;
	vm.allItemsSelected = newState;

	let active = vm.allItemsSelected;

	vm.datesTree.forEach(function (yearGroup, yearIndex) {

		if (!yearGroup.available) {

			if (!active) {
				vm.datesTree.splice(yearIndex, 1);
			}

		} else {

			yearGroup.active = active;
			yearGroup.someChildrenActive = false;

			yearGroup.items.forEach(function (monthGroup, monthIndex) {

				if (!monthGroup.available) {

					if (!active) {
						yearGroup.items.splice(monthIndex, 1);
					}

				} else {

					monthGroup.active = active;
					monthGroup.someChildrenActive = false;

					monthGroup.items.forEach(function (date, dateIndex) {

						if (!date.available) {

							if (!active) {
								monthGroup.items.splice(dateIndex, 1);
							}

						} else {
							date.active = active;
						}

					});

				}

			});

		}

	});

};

vm.onCheckboxClick = function (checkboxData, options) {

	checkboxData.active = !checkboxData.active;

	if (checkboxData.someChildrenActive) {
		checkboxData.someChildrenActive = false;
	}

	let active = checkboxData.active;

	if (options.items) {

		options.items.forEach(function (item, index) {

			if (!item.available) {

				if (!active) {
					options.items.splice(index, 1);
				}

			} else {

				item.active = active;
				item.someChildrenActive = false;

				if (item.items) {

					item.items.forEach(function (chItem, chIndex) {

						if (!chItem.available) {

							if (!active) {
								item.items.splice(chIndex, 1);
							}

						} else {
							chItem.active = active;
						}

					});

				}

			}

		});

	}

	if (options.parents) { // change parent's checkbox status

		options.parents = options.parents.map(function (parent) { // in array child group must precede parent group

			let itemsSelected = false;
			let itemsNotSelected = false;

			parent.items.map(function (parentItem) {

				if (parentItem.available) {

					if (parentItem.active) {
						itemsSelected = true;
					} else {
						itemsNotSelected = true;
					}

				}

			});

			if (itemsSelected && !itemsNotSelected) {

				parent.active = true;
				parent.someChildrenActive = false;

			} else if (itemsSelected && itemsNotSelected) {

				parent.active = false;
				parent.someChildrenActive = true;

			} else {

				parent.active = false;
				parent.someChildrenActive = false;

			}

			return parent;

		});

	}

	checkForInactiveYears();

};

vm.agree = function (cancelCb) {

	cancelCb();

	vm.datesTree.forEach(function (yearGroup) {

		delete yearGroup.available;

		yearGroup.items.forEach(function (monthGroup) {

			delete monthGroup.available;

			monthGroup.items.forEach(function (date) {

				delete date.available;

			});

		})

	});

	emit('save', JSON.parse(JSON.stringify( vm.datesTree )) );

};

let init = function () {

	vm.readyStatus = false;

	vm.datesTree = JSON.parse(JSON.stringify(props.datesTree));
	datesList = JSON.parse(JSON.stringify( props.options ));

	formatDatesList();

	/*if (vm.savedDatesList && vm.savedDatesList.length > 0) {
		checkForDatesAvailability();
	}*/

	createDatesTree();
	vm.readyStatus = true;
};

</script>

<style scoped lang="scss">

/*.date-tree-dialog {
	height: 80%;

	md-dialog-content {
		height: 100%;
		min-width: 330px;
		padding: 30px 15px;
	}
}

.date-tree-folding-btn {
	padding: 0;
	margin-top: 0;
}*/

.date-tree-folding-btn {
	margin-right: 10px;
}
</style>
