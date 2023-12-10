<template>
	<div
		class="chips-list-container overflow-hidden chipsListContainer"
		:class="scope.getChipsListClasses()"
		ref="elem"
	>
		<div
			v-for="chip in items"
			class="chip-wrap"
			:class="scope.getChipClasses(chip)"
			ng-init="$last && onLastChipInit()"
		>
			<div
				class="chip flex aic"
				:class="{ active: chip.isActive }"
				v-fm-tooltip:[getTooltipArg(chip.error_data)]="scope.getTooltipContent(chip)"
				@click="onChipClick(chip, $event)"
			>
				<span v-if="chip.error_data" class="material-icons error">error</span>

				<div
					v-html="chip.text"
					:class="{ 'custom-field-error': !!chip.error_data }"
					class="chip_content flex aic"
				></div>

				<FmBtn
					v-if="canDelete"
                    type="icon"
					class="flex-shrink-0 m-l-4"
					:class="{ 'custom-field-error': !!chip.error_data }"
					@click.stop="$emit('delete', [chip])"
                >
<!--                    <FmIcon icon="cancel" size="16" />-->
					<div class="icon material-icons" style="font-size: 16px;">cancel</div>
                </FmBtn>
			</div>
		</div>

<!--		<div class="chip-wrap" v-if="hiddenChips.length">
			<div
				class="chip expand-chip"
				@click="onChipClickMethod(hiddenChips, $event)"
			>
				<div class="chip_content">+{{ hiddenChips.length }}</div>

				<md-button
					v-if="chipsDeletion"
					@click="deleteChips(hiddenChips, $event)"
					class="chip-deletion-btn"
				>
					<span class="material-icons">cancel</span>
				</md-button>

				<md-tooltip
					ng-if="hiddenChipsTexts"
					md-direction="top"
					class="tooltip_1"
					ng-bind="hiddenChipsTexts"
				></md-tooltip>
			</div>
		</div>-->

		<slot></slot>
	</div>
</template>

<script setup>
	import directivesEvents from '@/angular/services/events/directivesEvents'

	const emit = defineEmits(['chipClick', 'delete'])

	const props = defineProps({
		items: Array,
		canDelete: { type: Boolean, default: false },
		overflowing: Boolean,
	})

	let scope = {}
	const elem = ref(null)
	// $filter

	// chipsDeletion: '@', // whether allow chips deletion
	// chipsAddition: '@',
	// orderChips: '@',
	// isDisabled: '=',
	// // dropdownMenuOptions: "=",
	// chipsContainerWidth: '=', // in pixels

	// onChipsDeletion: '&?', // pass function with argument that is array of deleted inputs
	// onChipClick: '&?', // [ function({}) ]
	// onAddChipClick: '&?',
	// onFirstRenderEnding: '&?',
	// link: function (scope, elem, attr) {
	// scope.chipsToDisplay = [];
	const hiddenChips = ref([])
	scope.hiddenChipsTexts = ''

	scope.orderOptions = null

	if (scope.orderChips) {
		scope.orderOptions = 'text'
	}

	let addChipBtn,
		addChipWidth = 0
	let lastChipRendered = false

	let chipsContainer,
		chipsContainerWidth = 0
	// let dropdownMenuFilter;
	onMounted(() => {
		init()
	})

	function init() {
		if (scope.chipsContainerWidth) {
			chipsContainerWidth = scope.chipsContainerWidth - addChipWidth
		} else {
			chipsContainerWidth = elem.value.clientWidth - addChipWidth
		}

		if (!props.items || !props.items.length) {
			onFirstRenderEnding()
		}

		if (scope.eventService) {
			scope.eventService.addEventListener(
				directivesEvents.CHIPS_LIST_CHANGED,
				function (argumentsObj) {
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
		}
	}

	scope.getChipsListClasses = function () {
		let classes = ''

		if (scope.chipsDeletion) {
			classes = 'chips-deletion-enabled'
		}

		return classes
	}

	/* Method from angularjs. May be not needed. */
	scope.onChipClickMethod = function (chipData, $event) {
		/*let chipsData = {
			hiddenChips: Array.isArray(chipData),
			data: chipData,
		}

		if (scope.onChipClick) {
			scope.onChipClick({ chipsData: chipsData, event: $event })
		}*/
	}

	const onChipClick = function (chipData, $event) {

		emit(
			'chipClick',
			{
				data: JSON.parse(JSON.stringify(chipData)),
				event: $event
			}
		)

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

			scope.hiddenChipsTexts = 'Hidden chips: ' + scope.hiddenChipsTexts + '.'
		}
	}

	// hideOverflowingChips function called from chips-list-view.html by ng-init
	scope.getChipClasses = (chipData) => {
		return chipData.classes ? chipData.classes : ''
	}

	const getTooltipArg = chipError => chipError ? 'error' : '';

	scope.getTooltipContent = (chipData) => {
		if (chipData.error_data) {
			return `<div class="error">${chipData.error_data.description}</div>`;
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

	// scope.deleteChips = function (chipsData, $event) {
	// 	$event.stopPropagation()

	// 	let chipsForDeletion = JSON.parse(JSON.stringify(chipsData))

	// 	if (!Array.isArray(chipsForDeletion)) {
	// 		// one chip deletion

	// 		chipsForDeletion = [chipsForDeletion]
	// 	} else {
	// 		// hidden chips deletion
	// 		scope.hiddenChips = []
	// 	}

	// 	chipsForDeletion.forEach(function (chipData) {
	// 		for (let i = 0; i < scope.chipsList.length; i++) {
	// 			if (scope.chipsList[i].id === chipData.id) {
	// 				scope.chipsList.splice(i, 1)
	// 				break
	// 			}
	// 		}
	// 	})

	// 	scope.concealOverflowingChips()

	// }

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
</script>

<style lang="scss" scoped>
	.chips-list-container {
		display: flex;
		flex-wrap: wrap;
	}
	.chip {
		position: relative;
		height: 28px;
		background-color: rgb(235, 235, 235);
		border-radius: 16px;
		padding: 6px 12px;
		margin: 0 4px;
		font-size: 14px;

		.icon {
			color: inherit;

			&:hover {
				color: $text-pale2;
			}
		}

		&:hover {
			background-color: rgba(216, 216, 216, 1);
		}

		&:focus {
			outline: none;
		}

		.chip-deletion-btn {
			position: absolute;
			display: flex;
			flex-direction: column;
			justify-content: center;
			min-width: 18px;
			width: 18px;
			min-height: 0;
			height: 100%;
			top: 0;
			right: 0;
			margin: 0;
			padding: 0 6px 0 0;
			box-sizing: content-box;

			&:hover {
				background-color: transparent;
				opacity: 0.5;
			}

			.material-icons {
				color: $gray;
				font-size: 16px;
			}
		}

		.chip-list-content {
		}

		span.error {
			color: #f05a22;
			margin-right: 8px;
			margin-bottom: 2px;
			font-size: 16px;
		}
	}
	.chip_content {
		font-size: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/*.chip {
		max-width: 240px;
		height: 33px;
		padding-top: 9px;
		padding-bottom: 9px;
		cursor: pointer;

		// Victor 2021.03.26 #85 only active filters must be orange


		.chip-list-content {
			display: flex;
			flex-direction: row;
			align-items: center;

			.g-filter-chips-text {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.material-icons:not(.error) {
			color: inherit;
		}
	}*/

    //# region fm table filters
    /*.fm_filter_chips {

        .chip {

            // Only active filters must be orange
            &.active {
                background-color: $primary-lighten-2;
                color: $primary;

                &:hover {
                    background-color: $primary;
                    color: #fff;

					:deep(.icon) {
						color: #fff;
					}

                    span.error {
                        color: #fff;
                    }
                }

				:deep(.icon) {
					color: $primary;

					&:hover {
						color: $text-pale2;
					}
				}

            }
        }

        .chip_content {
            display: flex;
            flex-direction: row;
            align-items: center;

            !*.g-filter-chips-text {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }*!
        }

        .material-icons:not(.error) {
            color: inherit;
        }
    }

	.chip-wrap.use-from-above-filter-chip {
		.chip {
			padding-top: 5px;
			padding-bottom: 5px;

			.material-icons {
				margin-right: 5px;
			}
		}
	}

	.chip-wrap:not(.use-from-above-filter-chip) {
		.chip {
			padding-top: 9px;
			padding-bottom: 9px;

			.chip-list-content {
				&.custom-field-error {
					padding-left: 5px;
				}
			}
		}
	}*/
    //# endregion fm table filters

</style>
