/**
 * Created by szhitenev on 17.06.2016.
 */

import logService from '@/angular/core/services/logService'
import metaService from '../services/metaService'

export default function ($mdDialog, fieldResolverService) {
	return {
		scope: {
			item: '=',
			options: '=',
		},
		templateUrl:
			'views/directives/instrument-scheme-manager-field-resolver-view.html',
		link: function (scope, elem, attrs) {
			logService.component('EntityViewerFieldResolverController', 'initialized')

			scope.readyStatus = { content: false, tags: false }
			scope.type = ''

			logService.property('field scope', scope.item)
			logService.property('field entity', scope.entity)
			logService.property('field options', scope.options)

			scope.searchTerm = ''

			fieldResolverService
				.getFields(scope.item.key, scope.options)
				.then(function (res) {
					logService.collection('DATA', res)
					scope.type = res.type
					scope.fields = res.data
					scope.readyStatus.content = true

					scope.$apply(function () {
						setTimeout(function () {
							$(elem)
								.find('.md-select-search-pattern')
								.on('keydown', function (ev) {
									ev.stopPropagation()
								})
						}, 100)
					})
				})

			scope.resolveSort = function (field) {
				if (field) {
					if (field.hasOwnProperty('name')) {
						return field.name
					}
					if (field.hasOwnProperty('user_code')) {
						return field.user_code
					}
					if (field.hasOwnProperty('public_name')) {
						return field.public_name
					}
				}
			}

			scope.checkComplexEntityType = function () {
				if (
					metaService.getFieldsWithTagGrouping().indexOf(scope.item.key) !== -1
				) {
					return true
				}
				return false
			}

			scope.getName = function () {
				if (scope.item.options && scope.item.options.fieldName) {
					return scope.item.options.fieldName
				}
				return scope.item.name
			}

			scope.bindFormFields = function () {
				var id = scope.item.expression
				if (id) {
					var i
					var attr

					for (i = 0; i < scope.fields.length; i = i + 1) {
						if (id == scope.fields[i].id) {
							attr = scope.fields[i]
						}
					}

					if (scope.item.options && scope.item.options.fieldsForm) {
						var resultCaption = ''
						scope.item.options.fieldsForm.forEach(function (item, index) {
							if (index + 1 === scope.item.options.fieldsForm.length) {
								resultCaption = resultCaption + attr[item]
							} else {
								resultCaption = resultCaption + attr[item] + ' / '
							}
						})

						return resultCaption
					}

					return attr.name
				} else {
					return scope.getName()
				}
			}

			scope.bindListFields = function (field) {
				//console.log('scope.item.options', scope.item.options);
				if (scope.item.options && scope.item.options.fieldsList) {
					var resultCaption = ''
					scope.item.options.fieldsList.forEach(function (item, index) {
						if (index + 1 === scope.item.options.fieldsList.length) {
							resultCaption = resultCaption + field[item]
						} else {
							resultCaption = resultCaption + field[item] + ' / '
						}
					})

					return resultCaption
				}

				return field.name
			}

			scope.openMapping = function ($event, item) {
				console.log('ITEEM', item)

				$mdDialog
					.show({
						controller: 'EntityTypeMappingDialogController as vm',
						templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							mapItem: item,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							console.log('res', res.data)
						}
					})
			}
		},
	}
}
