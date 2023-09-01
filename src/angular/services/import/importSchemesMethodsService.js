export default function ($mdDialog) {
	var setProviderFieldExpression = function (viewModel, item) {
		if (!item.name_expr || item.name_expr === '') {
			item.name_expr = item.name
			viewModel.inputsFunctions = viewModel.getFunctions()
		}
	}

	var setCalculatedFieldExpression = function (viewModel, item) {
		if (!item.name_expr || item.name_expr === '') {
			item.name_expr = item.name
			viewModel.inputsFunctions = viewModel.getFunctions()
		}
	}

	var checkForUserExpr = function (item) {
		if (item.name_expr) {
			if (item.name && item.name === item.name_expr) {
				return false
			}

			return 'md-primary'
		}

		return false
	}

	var openFxBtnExprBuilder = function (item, viewModel, $event) {
		$mdDialog
			.show({
				controller: 'ExpressionEditorDialogController as vm',
				templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
				parent: document.querySelector('.dialog-containers-wrap'),
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: { expression: item.name_expr },
					data: {
						groups: [viewModel.inputsGroup],
						functions: [viewModel.inputsFunctions],
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.name_expr = res.data.item.expression
					viewModel.inputsFunctions = viewModel.getFunctions()
				}
			})
	}

	var openExprBuilder = function (item, key, viewModel, $event) {
		$mdDialog
			.show({
				controller: 'ExpressionEditorDialogController as vm',
				templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
				parent: document.querySelector('.dialog-containers-wrap'),
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: { expression: item[key] },
					data: {
						groups: [viewModel.inputsGroup],
						functions: [viewModel.inputsFunctions],
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item[key] = res.data.item.expression
					viewModel.inputsFunctions = viewModel.getFunctions()
				}
			})
	}

	var openMappingDialog = function (locals, $event) {
		$mdDialog.show({
			controller: 'EntityTypeMappingDialogController as vm',
			templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
			parent: document.querySelector('.dialog-containers-wrap'),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			multiple: true,
			skipHide: true,
			locals: locals,
		})
	}

	var checkForClassifierMapping = function (items, classifierId) {
		var i
		for (i = 0; i < items.length; i++) {
			// if (items[i].id === classifierId) {
			if (items[i].value && items[i].value.id === classifierId) {
				if (items[i].value.value_type === 30) {
					return true
				}
			}
		}

		return false
	}

	var openClassifierMapping = function (locals, $event) {
		$mdDialog.show({
			controller: 'EntityTypeClassifierMappingDialogController as vm',
			templateUrl:
				'views/dialogs/entity-type-classifier-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: locals,
		})
	}

	/************ Add edit transaction import scheme ************/

	var onTTypeCalcFielNamedBlur = function (item) {
		if (item.name && !item.name_expr) {
			if (!item.frontOptions) {
				item.frontOptions = {}
			}

			item.frontOptions.noNameExpr = true
		} else if (item.frontOptions && item.frontOptions.noNameExpr) {
			item.frontOptions.noNameExpr = false
		}
	}

	var getCalcFieldFxBtnClasses = function (item) {
		if (item.frontOptions && item.frontOptions.noNameExpr) {
			return 'btn-error'
		} else if (item.name_expr && item.name !== item.name_expr) {
			return 'md-primary'
		}

		return ''
	}

	var openCalcFieldFxBtnExprBuilder = function (item, viewModel, $event) {
		$mdDialog
			.show({
				controller: 'ExpressionEditorDialogController as vm',
				templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: { expression: item.name_expr },
					data: {
						groups: [viewModel.inputsGroup],
						functions: [viewModel.inputsFunctions],
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.name_expr = res.data.item.expression
					viewModel.inputsFunctions = viewModel.getFunctions()

					if (res.data.item.expression) {
						if (item.frontOptions) {
							item.frontOptions.noNameExpr = false
						}
					} else if (item.name) {
						if (!item.frontOptions) {
							item.frontOptions = {}
						}

						item.frontOptions.noNameExpr = true
					}
				}
			})
	}

	/************ < Add edit transaction import scheme > ************/

	return {
		setProviderFieldExpression: setProviderFieldExpression,
		setCalculatedFieldExpression: setCalculatedFieldExpression,
		checkForUserExpr: checkForUserExpr,
		openFxBtnExprBuilder: openFxBtnExprBuilder,
		openExprBuilder: openExprBuilder,
		openMappingDialog: openMappingDialog,
		checkForClassifierMapping: checkForClassifierMapping,
		openClassifierMapping: openClassifierMapping,

		openCalcFieldFxBtnExprBuilder: openCalcFieldFxBtnExprBuilder,
		onTTypeCalcFielNamedBlur: onTTypeCalcFielNamedBlur,
		getCalcFieldFxBtnClasses: getCalcFieldFxBtnClasses,
	}
}
