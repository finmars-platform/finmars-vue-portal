<template>
	<div
		class="custom-input-container classifier-input-container customInputBackgroundColor"
		:class="scope.getInputContainerClasses()"
		ref="elem"
	>
		<FmMenu>
			<template #btn>
				<BaseInput
					v-model="scope.inputText"
					:label="label"
					:disabled="scope.isDisabled"
					@update:modelValue="scope.onInputTextChange()"
					@onFocus="onFocus"
					class="custom-input dropdown-select-input dropdownSelectInputElem"
				>
					<template #button>
						<FmIcon
							v-if="!scope.noIndicatorBtn"
							icon="menu"
							:disabled="scope.isDisabled"
							@click.stop="scope.openSelectorDialog($event)"
						/>
					</template>

					<template #rightBtn>
						<div class="custom-input-custom-btns-holder">
							<div
								v-if="customButtons && customButtons.length"
								class="height-100 flex-row"
							>
								<button
									v-for="button in scope.customButtons"
									class="{{button.classes}} custom-input-custom-btn"
									data-ng-click="callFnForCustomBtn(button.action)"
								>
									{{ button.caption }}
									<ng-md-icon
										v-if="button.iconObj.type === 'angularjs-material'"
										size="24"
										icon="{{button.iconObj.icon}}"
										class="ci-custom-btn-icon"
									></ng-md-icon>

									<md-tooltip
										v-if="button.tooltip"
										class="tooltip_1"
										md-direction="top"
										>{{ scope.button.tooltip }}
									</md-tooltip>
								</button>
							</div>
						</div>
					</template>
				</BaseInput>
			</template>

			<template #default="{ close }">
				<div class="fm_list">
					<div
						v-for="option in scope.menuOptions"
						class="fm_list_item"
						:style="{ paddingLeft: `${(option.level + 1) * 10}px` }"
						@click="scope.selectOption(option), close()"
					>
						{{ option.name }}
					</div>
				</div>
			</template>
		</FmMenu>

		<LazyAngularClassifierSelectM
			v-if="$mdDialog.modals['ClassifierSelectDialogController']"
			:modelValue="true"
			:payload="$mdDialog.modals['ClassifierSelectDialogController']"
		/>
	</div>
</template>

<script setup>
	import attributeTypeService from '@/angular/services/attributeTypeService'

	// scope: {
	// 	modelProp: '@', // 'id', 'name'. Default 'id'.
	// 	customStyles: '=',
	// 	eventSignal: '=',
	// 	smallOptions: '=',
	// 	itemName: '=',

	// 	onChangeCallback: '&?',
	// },
	// link: function ( attr) {

	const props = defineProps([
		'label',
		'model',
		'isDisabled',
		'classifierAttr',
		'classifierValue',
		'entityType',
	])
	const $mdDialog = inject('$mdDialog')

	const scope = reactive({ ...props })
	const elem = ref(null)

	scope.error = ''
	scope.inputValue = ''
	scope.dropdownMenuHidden = false
	scope.dropdownMenuFilter = ''
	scope.menuOptions = []

	var dialogParent
	/*
				TIPS
				scope.smallOptions probable properties
					tooltipText: custom tooltip text
					notNull: turn on error mode if field is not filled
					noIndicatorBtn: whether to show button at the right part of input
					readonly: making input readonly
					dialogParent: 'string' - querySelector content for element to insert mdDialog into
				*/
	if (scope.smallOptions) {
		scope.tooltipText = scope.smallOptions.tooltipText
		scope.noIndicatorBtn = scope.smallOptions.noIndicatorBtn
		dialogParent = scope.smallOptions.dialogParent
	}

	if (!scope.modelProp) scope.modelProp = 'id'

	var itemName = scope.itemName || ''

	if (scope.itemName) {
		// itemName and inputText needed for resetting selected option name
		scope.inputText = itemName
	}

	var stylePreset

	var inputContainer
	var inputElem

	onMounted(() => {
		inputContainer = elem.value
		inputElem = elem.value.querySelector('.dropdownSelectInputElem')

		init()
	})

	scope.getInputContainerClasses = function () {
		var classes = ''

		if (scope.isDisabled) {
			classes += 'custom-input-is-disabled'
		} else if (scope.error) {
			classes = 'custom-input-error'
		} else if (stylePreset) {
			classes = 'custom-input-preset' + stylePreset
		} else if (scope.valueIsValid) {
			classes = 'custom-input-is-valid'
		}

		if (scope.noIndicatorBtn) {
			classes += ' no-indicator-btn'
		}

		return classes
	}

	scope.callFnForCustomBtn = function (actionData) {
		if (actionData.parameters) {
			actionData.callback(actionData.parameters)
		} else {
			actionData.callback()
		}
	}

	scope.selectOption = function (item) {
		if (item[scope.modelProp] !== scope.model) {
			stylePreset = ''
			scope.error = ''

			scope.model = item[scope.modelProp]
			scope.valueIsValid = true

			/*if (typeof scope.itemName !== 'undefined') {
                            scope.itemName = item.name;
                        }*/
			itemName = item.name
			scope.inputText = itemName

			closeDropdownMenu()

			if (scope.onChangeCallback) {
				scope.onChangeCallback()
			}
		}
	}

	scope.onInputTextChange = function () {
		scope.dropdownMenuFilter = scope.inputText
	}

	var closeDropdownMenu = function (updateScope) {
		inputContainer.classList.remove('custom-input-focused')

		scope.inputText = itemName

		scope.dropdownMenuHidden = false

		window.removeEventListener('click', closeDDMenuOnClick)
		document.removeEventListener('keydown', onTabKeyPress)
	}

	function closeDDMenuOnClick(event) {
		var targetElem = event.target

		scope.dropdownMenuFilter = null

		if (!inputContainer.contains(targetElem)) {
			closeDropdownMenu(true)
		}
	}

	var onTabKeyPress = function (event) {
		var pressedKey = event.key

		if (pressedKey === 'Tab') {
			closeDropdownMenu(true)
		}
	}

	var applyCustomStyles = function () {
		Object.keys(scope.customStyles).forEach(function (className) {
			var elemClass = '.' + className
			var elemToApplyStyles = elem.value.querySelectorAll(elemClass)

			if (elemToApplyStyles.length) {
				elemToApplyStyles.forEach(function (htmlNode) {
					htmlNode.style.cssText = scope.customStyles[className]
				})
			}
		})
	}

	scope.openSelectorDialog = async function ($event) {
		// var parent = document.body

		// if (dialogParent) {
		// 	var parentElem = document.querySelector(dialogParent)

		// 	if (parentElem) {
		// 		parent = parentElem
		// 	}
		// }

		let res = await $mdDialog.show({
			controller: 'ClassifierSelectDialogController as vm',
			templateUrl: 'views/classifier-select-dialog-view.html',
			locals: {
				data: {
					classifier: scope.classifierAttr,
					classifierId: scope.classifierValue,
					entityType: scope.entityType,
				},
			},
		})

		if (res.status === 'agree') {
			scope.model = res.data.item

			if (scope.modelProp === 'name') {
				scope.model = res.data.name
			}

			if (typeof scope.itemName !== 'undefined') {
				scope.itemName = res.data.name
			}

			scope.inputText = res.data.name

			getTree()

			setTimeout(function () {
				if (scope.onChangeCallback) {
					scope.onChangeCallback()
				}
			}, 0)
		}
	}

	var initScopeWatchers = function () {
		watch(
			() => scope.model,
			() => {
				if (scope.model && scope.menuOptions && scope.menuOptions.length) {
					for (var i = 0; i < scope.menuOptions.length; i++) {
						if (scope.menuOptions[i][scope.modelProp] === scope.model) {
							itemName = scope.menuOptions[i].name
							scope.inputText = itemName
							scope.valueIsValid = true
							break
						}
					}
				} else {
					itemName = ''
					scope.inputText = itemName
					scope.valueIsValid = false
				}
			}
		)

		if (scope.eventSignal) {
			watch(
				() => scope.eventSignal,
				() => {
					if (scope.eventSignal && scope.eventSignal.key) {
						switch (scope.eventSignal.key) {
							case 'mark_not_valid_fields':
								if (
									scope.smallOptions &&
									scope.smallOptions.notNull &&
									!scope.model
								) {
									scope.error = 'Field should not be null'
								}

								break

							case 'error':
								scope.error = JSON.parse(
									JSON.stringify(scope.eventSignal.error)
								)
								break

							case 'set_style_preset1':
								stylePreset = 1
								break

							case 'set_style_preset2':
								stylePreset = 2
								break
						}

						scope.eventSignal = {} // reset signal
					}
				}
			)
		}

		watch(
			() => scope.itemName,
			() => {
				if (scope.itemName) {
					itemName = scope.itemName
				} else {
					itemName = ''
				}

				scope.inputText = itemName
			}
		)
	}

	async function onFocus() {
		// scope.inputText = ''
		inputContainer.classList.add('custom-input-focused')

		scope.dropdownMenuHidden = true

		window.addEventListener('click', closeDDMenuOnClick)
		document.addEventListener('keydown', onTabKeyPress)
	}
	var initEventListeners = function () {
		// elem.value.addEventListener('mouseover', function () {
		// 	inputContainer.classList.add('custom-input-hovered')
		// })
		// elem.value.addEventListener('mouseleave', function () {
		// 	inputContainer.classList.remove('custom-input-hovered')
		// })
	}

	/**
	 * Convert classifier data tree into flat list
	 *
	 * @param classifiers {Array}
	 */
	const recursiveFlat = (classifiers) => {
		return classifiers.reduce((acc, classifier) => {
			if (classifier.children.length > 0) {
				return [...acc, classifier, ...recursiveFlat(classifier.children)]
			}

			return [...acc, classifier]
		}, [])
	}

	var getTree = function () {
		var classifierId = scope.classifierAttr.id

		attributeTypeService
			.getByKey(scope.entityType, classifierId)
			.then(function (data) {
				scope.menuOptions = recursiveFlat(data.classifiers)

				for (var i = 0; i < scope.menuOptions.length; i++) {
					if (scope.menuOptions[i][scope.modelProp] === scope.model) {
						/*if (typeof scope.itemName !== 'undefined') {
                                    scope.itemName = scope.menuOptions[i].name;
                                }*/
						itemName = scope.menuOptions[i].name
						scope.inputText = itemName

						break
					}
				}
			})
	}

	function init() {
		if (scope.classifierAttr && scope.classifierAttr.id) {
			getTree()
		}

		initScopeWatchers()

		initEventListeners()

		/*scope.iconData = entityIndicatorIcons[indicatorBtnIcon];*/

		if (scope.customStyles) {
			applyCustomStyles()
		}
	}

	onUnmounted(() => {
		window.removeEventListener('click', closeDDMenuOnClick)
		document.removeEventListener('keydown', onTabKeyPress)
	})
</script>

<style lang="scss" scoped>
	.custom-input-container {
		position: relative;
	}
	.custom-input-sel-menu-container {
		border: 1px solid $border;
		position: absolute;
		top: 100%;
		background: #fff;
		z-index: 100;
		width: 100%;
	}
</style>
