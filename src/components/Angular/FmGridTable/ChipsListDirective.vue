<template>
	<div
		class="chips-list-container overflow-hidden chipsListContainer"
		:class="getChipsListClasses()"
	>
		<!-- v-for			orderBy: orderOptions track by chip.id -->
		<div
			v-for="chip in chipsList "
			class="chip-wrap chipWrapElem"
			:class="getChipClasses(chip)"
			ng-init="$last && onLastChipInit()"
		>
			<div
				class="chip-div chipDivElem"
				:class="{active: chip.isActive}"
				@click="onChipClickMethod(chip, $event)"
			>
			<span v-if="chip.error_data" class="material-icons error"
			>error</span
			>

				<div
					v-bind="chip.text"
					:class="{'custom-field-error': !!chip.error_data}"
					class="chip-list-content"
				></div>

				<md-button
					v-if="chipsDeletion"
					:click="deleteChips(chip, $event)"
					class="chip-deletion-btn"
				>
					<span class="material-icons">cancel</span>
				</md-button>

				<md-tooltip
					v-if="getTooltipContent(chip)"
					md-direction="top"
					class="tooltip_1"
					:class="{'custom-field-error': !!chip.error_data}"
					v-bind="getTooltipContent(chip)"
				></md-tooltip>
			</div>
		</div>

		<div class="chip-wrap" v-if="hiddenChips.length">
			<div
				class="chip-div expand-chip"
				@click="onChipClickMethod(hiddenChips, $event)"
			>
				<div class="chip-list-content">+{{hiddenChips.length}}</div>

				<md-button
					v-if="chipsDeletion"
					@click="deleteChips(hiddenChips, $event)"
					class="chip-deletion-btn"
				>
					<span class="material-icons">cancel</span>
				</md-button>

				<md-tooltip
					v-if="hiddenChipsTexts"
					md-direction="top"
					class="tooltip_1"
					v-bind="hiddenChipsTexts"
				></md-tooltip>
			</div>
		</div>
	</div>

</template>

<script>
// import directivesEvents from '../services/events/directivesEvents'
const props = defineProps([
	'chipsList',
	'eventService',
	'chipsDeletion',
	'chipsAddition',
	'orderChips',
	'isDisabled',
	'chipsContainerWidth',
	'hideOverflowingChips',
	'onChipsDeletion',
	'onChipClick',
	'onAddChipClick',
	'onFirstRenderEnding',


])
// export default function ($filter) {

		templateUrl: 'views/directives/chips-list-view.html',
		// link: function (scope, elem, attr) {
			// scope.chipsToDisplay = [];
			scope.hiddenChips = []
			scope.hiddenChipsTexts = ''

			scope.orderOptions = null

			if (scope.orderChips) {
				scope.orderOptions = 'text'
			}

			let addChipBtn,
				addChipWidth = 0
			let lastChipRendered = false
			/* scope.orderMenuOptions = null

                if (scope.orderMenuOptions) {
                    scope.orderMenuOptions = "name"
                } */

			let chipsContainer,
				chipsContainerWidth = 0
			// let dropdownMenuFilter;

			scope.getChipsListClasses = function () {
				let classes = ''

				if (scope.chipsDeletion) {
					classes = 'chips-deletion-enabled'
				}

				return classes
			}

			scope.onChipClickMethod = function (chipData, $event) {
				$event.stopPropagation()

				let chipsData = {
					hiddenChips: Array.isArray(chipData),
					data: chipData,
				}

				if (scope.onChipClick) {
					scope.onChipClick({ chipsData: chipsData, event: $event })
				}
			}

			let getHiddenChipsTexts = function () {
				scope.hiddenChipsTexts = ''

				let hiddenChips = scope.hiddenChips

				if (scope.orderOptions) {
					hiddenChips = $filter('orderBy')(hiddenChips, scope.orderOptions)
				}

				hiddenChips.forEach(function (hChip) {
					if (hChip.text) {
						scope.hiddenChipsTexts = scope.hiddenChipsTexts + hChip.text + '; '
					}
				})

				if (scope.hiddenChipsTexts) {
					// remove "; " from the end
					let endIndex = scope.hiddenChipsTexts.length - 2
					scope.hiddenChipsTexts = scope.hiddenChipsTexts.substring(0, endIndex)

					scope.hiddenChipsTexts =
						'Hidden chips: ' + scope.hiddenChipsTexts + '.'
				}
			}

			// hideOverflowingChips function called from chips-list-view.html by ng-init
			scope.getChipClasses = (chipData) => {
				return chipData.classes ? chipData.classes : ''
			}

			scope.getTooltipContent = (chipData) => {
				if (chipData.error_data) {
					return chipData.error_data.description
				}

				if (chipData.hasOwnProperty('tooltipContent')) {
					return chipData.tooltipContent
				}

				return chipData.text
			}

			scope.concealOverflowingChips = function (updateScope) {
				if (scope.hideOverflowingChips !== 'false') {
					setTimeout(function () {
						// wait for ng-repeat to finish rendering

						scope.hiddenChips = []

						const expandChipWidth = 74
						let chipsElemsList = elem[0].querySelectorAll('.chipWrapElem')
						let chipsWidth = 0 // size of .expand-chip (width + margins)

						const hideChips = function (index) {
							scope.hiddenChips = scope.chipsList.slice(index)
							getHiddenChipsTexts()
						}

						chipsElemsList.forEach(function (cElem) {
							cElem.classList.add('chip-hidden')
						})

						for (let i = 0; i < chipsElemsList.length; i++) {
							let cElem = chipsElemsList[i]
							chipsWidth += cElem.clientWidth

							if (i + 1 === chipsElemsList.length) {
								// for the last chip

								if (chipsWidth > chipsContainerWidth) {
									hideChips(i)
									break
								}
							} else if (chipsWidth + expandChipWidth > chipsContainerWidth) {
								hideChips(i)
								break
							}

							cElem.classList.remove('chip-hidden')
						}

						if (updateScope) {
							scope.$apply()
						}
					}, 0)
				}
			}

			scope.deleteChips = function (chipsData, $event) {
				$event.stopPropagation()

				let chipsForDeletion = JSON.parse(JSON.stringify(chipsData))

				if (!Array.isArray(chipsForDeletion)) {
					// one chip deletion

					chipsForDeletion = [chipsForDeletion]
				} else {
					// hidden chips deletion
					scope.hiddenChips = []
				}

				chipsForDeletion.forEach(function (chipData) {
					for (let i = 0; i < scope.chipsList.length; i++) {
						if (scope.chipsList[i].id === chipData.id) {
							scope.chipsList.splice(i, 1)
							break
						}
					}
				})

				scope.concealOverflowingChips()

				if (scope.onChipsDeletion) {
					scope.onChipsDeletion({ chipsData: chipsForDeletion })
				}
			}

			/* scope.selectOption = function (option) {

                    let newChip = {
                        id: option.id,
                        text: option.name
                    };

                    scope.chipsList.push(newChip);
                    scope.concealOverflowingChips();

                }; */

			let onFirstRenderEnding = function () {
				if (scope.onFirstRenderEnding) {
					setTimeout(function () {
						// wait until DOM elems reflow after ng-repeat
						scope.onFirstRenderEnding()
					}, 0)
				}

				scope.onLastChipInit = function () {
					// discard all on first time init callbacks
					scope.concealOverflowingChips(true)
				}
			}

			scope.onLastChipInit = function () {
				if (typeof scope.chipsAddition === 'string') {
					lastChipRendered = true

					if (addChipBtn) {
						// whether addChipBtn already loaded
						scope.concealOverflowingChips(true)
						onFirstRenderEnding()
					}
				} else {
					scope.concealOverflowingChips(true)
					onFirstRenderEnding()
				}
			}

			scope.onAddChipInit = function () {
				addChipBtn = elem[0].querySelector('.add-chip-wrap')
				addChipWidth = addChipBtn.clientWidth

				if (lastChipRendered) {
					scope.concealOverflowingChips(true)
					onFirstRenderEnding()
				}
			}

			let init = function () {
				if (scope.chipsContainerWidth) {
					chipsContainerWidth = scope.chipsContainerWidth - addChipWidth
				} else {
					chipsContainer = elem[0].querySelector('.chipsListContainer')
					chipsContainerWidth = chipsContainer.clientWidth - addChipWidth
				}

				if (!scope.chipsList || !scope.chipsList.length) {
					onFirstRenderEnding()
				}

				if (scope.eventService) {
					scope.eventService.addEventListener(
						directivesEvents.CHIPS_LIST_CHANGED,
						function (argumentsObj) {
							/*
							argumentsObj properties
							chipsList: new array of chips
							updateScope: whether call scope.$apply at the end of concealOverflowingChips()
							*/
							scope.chipsList = argumentsObj.chipsList
							scope.concealOverflowingChips(argumentsObj.updateScope)
						}
					)

					scope.eventService.addEventListener(
						directivesEvents.CHIPS_LIST_ELEMENT_SIZE_CHANGED,
						function () {
							if (scope.chipsContainerWidth) {
								chipsContainerWidth = scope.chipsContainerWidth - addChipWidth
							} else {
								chipsContainerWidth = chipsContainer.clientWidth - addChipWidth
							}

							scope.concealOverflowingChips()
						}
					)

					/* scope.eventService.addEventListener(directivesEvents.DROPDOWN_MENU_OPTIONS_CHANGED, function (argumentsObj) {

                            if (argumentsObj.optionsList) {

                                scope.dropdownMenuOptions = argumentsObj.optionsList
                                scope.menuOptions = JSON.parse(JSON.stringify(scope.dropdownMenuOptions));

                            }

                        }); */
				}

				/* if (scope.dropdownMenuOptions) {

					    scope.menuOptions = JSON.parse(JSON.stringify(scope.dropdownMenuOptions));

                        scope.addDropdownMenuListeners = function () {

							chipsContainer.addEventListener("click", function () {
								scope.dropdownMenuShown = true
							});

                        	dropdownMenuFilter = elem[0].querySelector('.dropdownMenuFilter');

							dropdownMenuFilter.addEventListener('blur', function () {
								scope.dropdownMenuShown = false
							});

						}



                    } */
			}

			init()
// 		},
// 	}
// }

</script>

<style lang="scss" scoped>

</style>
