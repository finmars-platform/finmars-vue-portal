import baseUrlService from '../services/baseUrlService'
import configureRepositoryUrlService from '@/angular/shell/scripts/app/services/configureRepositoryUrlService'

export default function (cookieService, xhrService, metaContentTypesService) {
	const baseUrl = baseUrlService.resolve()

	var getRequestParams = function (method, bodyData) {
		// TODO: move to xhrService

		if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
			throw new Error('Invalid request method')
		}

		var reqestParamsObj = {
			method: method,
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		}

		reqestParamsObj.headers['Authorization'] =
			'Token ' + cookieService.getCookie('access_token')

		if (['POST', 'PATCH', 'PUT'].includes(method)) {
			reqestParamsObj.headers['X-CSRFToken'] =
				cookieService.getCookie('csrftoken')
			reqestParamsObj.body = JSON.stringify(bodyData)
		} else if (method === 'DELETE') {
			reqestParamsObj.headers['X-CSRFToken'] =
				cookieService.getCookie('csrftoken')
		}

		return reqestParamsObj
	}

	var getPortalInterfaceAccess = function (uiLayoutId) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/portal-interface-access/',
			getRequestParams('GET')
		)
	}

	var getListLayout = function (entity, options) {
		/* if (entity == 'all') {


var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(configureRepositoryUrlService.configureUrl(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/', options),
                getRequestParams('GET'))

        } else {

            if (!options) {
                options = {}
            }

            if (!options.content_type) {
                options.content_type = metaContentTypesService.findContentTypeByEntity(entity, 'ui');
            }


var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(configureRepositoryUrlService.configureUrl(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/', options),
                getRequestParams('GET'));
        } */

		if (!options) {
			options = {}
		}

		if (entity !== 'all') {
			if (!options.filters) {
				options.filters = {}
			}

			if (!options.filters.content_type) {
				options.filters.content_type =
					metaContentTypesService.findContentTypeByEntity(entity, 'ui')
			}

			var prefix = baseUrlService.getMasterUserPrefix()
			var apiVersion = baseUrlService.getApiVersion()

			return xhrService.fetch(
				configureRepositoryUrlService.configureUrl(
					baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/',
					options
				),
				getRequestParams('GET')
			)
		}

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getListLayoutLight = function (entity, options) {
		if (!options) {
			options = {}
		}

		if (entity !== 'all') {
			if (!options.filters) {
				options.filters = {}
			}

			if (!options.filters.content_type) {
				options.filters.content_type =
					metaContentTypesService.findContentTypeByEntity(entity, 'ui')
			}

			var prefix = baseUrlService.getMasterUserPrefix()
			var apiVersion = baseUrlService.getApiVersion()

			return xhrService.fetch(
				configureRepositoryUrlService.configureUrl(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/list-layout-light/',
					options
				),
				getRequestParams('GET')
			)
		}

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/list-layout-light/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getListLayoutByKey = function (uiLayoutId) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/list-layout/' +
				uiLayoutId +
				'/',
			getRequestParams('GET')
		)
	}

	/* var getListLayoutDefault = function (options) {

var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(configureRepositoryUrlService.configureUrl(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/', options),
            getRequestParams('GET'));
    }; */

	/* var getActiveListLayout = function (entity) {

        var contentType = metaContentTypesService.findContentTypeByEntity(entity, 'ui');


var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return xhrService.fetch(baseUrl   +  '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/?is_active=2&content_type=' + contentType,
            getRequestParams('GET'))
    }; */

	var getDefaultListLayout = function (entityType) {
		var contentType = entityType

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/list-layout/?is_default=2&content_type=' +
				contentType,
			getRequestParams('GET')
		)
	}

	var createListLayout = function (ui) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/list-layout/',
			getRequestParams('POST', ui)
		)
	}

	var updateListLayout = function (id, ui) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/list-layout/' +
				id +
				'/',
			getRequestParams('PUT', ui)
		)
	}

	var deleteListLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/list-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}
	/**
	 *
	 * @param layoutId {number}
	 * @param xhrOptions {=Object} - options for xhrService
	 * @returns {Promise<Object>}
	 */
	var pingListLayoutByKey = function (layoutId, xhrOptions) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/list-layout/' +
				layoutId +
				'/ping/',
			getRequestParams('GET'),
			xhrOptions
		)
	}

	var getListLayoutTemplate = function (isReport) {
		const template = {
			name: '',
			user_code: '',
			content_type: '',
			data: {
				entityType: null,
				folding: false,
				sorting: {
					group: {
						id: null,
						sort: 'DESC',
						key: null,
					},
					column: {
						id: null,
						sort: 'ASC',
						key: null,
					},
				},
				grouping: [],
				columns: [],
				filters: { backend: [], frontend: [] },
				additions: {},
			},
		}

		if (isReport) {
			template.data.filters = []
			template.data.reportOptions = {}
			template.data.reportLayoutOptions = {}
		}

		return [template]
	}

	// Input Form Layout

	var getListEditLayout = function (entity, options) {
		console.log('getListEditLayout.entity', entity)

		if (!options) {
			options = {}
		}

		if (entity !== 'all') {
			if (!options.filters) {
				options.filters = {}
			}

			if (!options.filters.content_type) {
				options.filters.content_type =
					metaContentTypesService.findContentTypeByEntity(entity, 'ui')
			}

			var prefix = baseUrlService.getMasterUserPrefix()
			var apiVersion = baseUrlService.getApiVersion()

			return xhrService.fetch(
				configureRepositoryUrlService.configureUrl(
					baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/edit-layout/',
					options
				),
				getRequestParams('GET')
			)
		}

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/edit-layout/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getDefaultEditLayout = function (entityType) {
		var contentType = metaContentTypesService.findContentTypeByEntity(
			entityType,
			'ui'
		)
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/edit-layout/?is_default=2&content_type=' +
				contentType,
			getRequestParams('GET')
		)
	}

	var getEditLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/edit-layout/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var getEditLayoutByUserCode = function (entityType, userCode) {
		var contentType = metaContentTypesService.findContentTypeByEntity(
			entityType,
			'ui'
		)
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/edit-layout/?content_type=' +
				contentType +
				'&user_code=' +
				userCode,
			getRequestParams('GET')
		)
	}

	var createEditLayout = function (ui) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/edit-layout/',
			getRequestParams('POST', ui)
		)
	}

	var updateEditLayout = function (id, ui) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/edit-layout/' +
				id +
				'/',
			getRequestParams('PUT', ui)
		)
	}

	var deleteEditLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/edit-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	// Configuration Layout

	var getConfigurationList = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/configuration/',
			getRequestParams('GET')
		)
	}

	var createConfiguration = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/configuration/',
			getRequestParams('POST', data)
		)
	}

	var updateConfiguration = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/configuration/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteConfigurationByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/configuration/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	var getConfigurationExportLayoutList = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/configuration-export-layout/',
			getRequestParams('GET')
		)
	}

	var createConfigurationExportLayout = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/configuration-export-layout/',
			getRequestParams('POST', data)
		)
	}

	var updateConfigurationExportLayout = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/configuration-export-layout/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteConfigurationExportLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/configuration-export-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	var getTransactionFieldList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/transaction-user-field/',
				options
			),
			getRequestParams('GET')
		)
	}

	var createTransactionField = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/transaction-user-field/',
			getRequestParams('POST', data)
		)
	}

	var updateTransactionField = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/transaction-user-field/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var getInstrumentFieldList = function (options) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/instrument-user-field/',
				options
			),
			getRequestParams('GET')
		)
	}

	var createInstrumentField = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/instrument-user-field/',
			getRequestParams('POST', data)
		)
	}

	var updateInstrumentField = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/instrument-user-field/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var getDashboardLayoutList = function (entity, options) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/dashboard-layout/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getDashboardLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/dashboard-layout/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var getActiveDashboardLayout = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/dashboard-layout/?is_active=2',
			getRequestParams('GET')
		)
	}

	var getDefaultDashboardLayout = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/dashboard-layout/?is_default=2',
			getRequestParams('GET')
		)
	}

	var createDashboardLayout = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/dashboard-layout/',
			getRequestParams('POST', data)
		)
	}

	var updateDashboardLayout = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/dashboard-layout/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteDashboardLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/dashboard-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	var getTemplateLayoutList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/template-layout/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getTemplateLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/template-layout/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var getDefaultTemplateLayout = function () {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/template-layout/?is_default=2',
			getRequestParams('GET')
		)
	}

	var createTemplateLayout = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/template-layout/',
			getRequestParams('POST', data)
		)
	}

	var updateTemplateLayout = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/template-layout/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteTemplateLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/template-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	var getContextMenuLayoutList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/context-menu-layout/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getContextMenuLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/context-menu-layout/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var createContextMenuLayout = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/context-menu-layout/',
			getRequestParams('POST', data)
		)
	}

	var updateContextMenuLayout = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/context-menu-layout/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteContextMenuLayoutByKey = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/context-menu-layout/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	var getEntityTooltipList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/entity-tooltip/',
				options
			),
			getRequestParams('GET')
		)
	}

	var createEntityTooltip = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/entity-tooltip/',
			getRequestParams('POST', data)
		)
	}

	var updateEntityTooltip = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/entity-tooltip/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	// Cross Entity Attribute Extension

	var getCrossEntityAttributeExtensionList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/cross-entity-attribute-extension/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getCrossEntityAttributeExtension = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/cross-entity-attribute-extension/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var createCrossEntityAttributeExtension = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/cross-entity-attribute-extension/',
			getRequestParams('POST', data)
		)
	}

	var updateCrossEntityAttributeExtension = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/cross-entity-attribute-extension/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteCrossEntityAttributeExtension = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/cross-entity-attribute-extension/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	// Column Sort Data

	var getColumnSortDataList = function (options) {
		console.log('options', options)

		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			configureRepositoryUrlService.configureUrl(
				baseUrl +
					'/' +
					prefix +
					'/' +
					apiVersion +
					'/' +
					'ui/column-sort-data/',
				options
			),
			getRequestParams('GET')
		)
	}

	var getColumnSortData = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/column-sort-data/' +
				id +
				'/',
			getRequestParams('GET')
		)
	}

	var createColumnSortData = function (data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl + '/' + prefix + '/' + apiVersion + '/' + 'ui/column-sort-data/',
			getRequestParams('POST', data)
		)
	}

	var updateColumnSortData = function (id, data) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return xhrService.fetch(
			baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/' +
				'ui/column-sort-data/' +
				id +
				'/',
			getRequestParams('PUT', data)
		)
	}

	var deleteColumnSortData = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return new Promise(function (resolve, reject) {
			xhrService
				.fetch(
					baseUrl +
						'/' +
						prefix +
						'/' +
						apiVersion +
						'/' +
						'ui/column-sort-data/' +
						id +
						'/',
					getRequestParams('DELETE')
				)
				.then(function (data) {
					resolve(undefined)
				})
		})
	}

	return {
		getPortalInterfaceAccess: getPortalInterfaceAccess,

		getDefaultListLayout: getDefaultListLayout,

		// getActiveListLayout: getActiveListLayout,

		getListLayoutTemplate: getListLayoutTemplate,

		getListLayout: getListLayout,
		getListLayoutLight: getListLayoutLight,
		getListLayoutByKey: getListLayoutByKey,
		// getListLayoutDefault: getListLayoutDefault,
		createListLayout: createListLayout,
		updateListLayout: updateListLayout,
		deleteListLayoutByKey: deleteListLayoutByKey,

		pingListLayoutByKey: pingListLayoutByKey,

		// Input Form Layout

		getListEditLayout: getListEditLayout,
		getDefaultEditLayout: getDefaultEditLayout,
		getEditLayoutByKey: getEditLayoutByKey,
		getEditLayoutByUserCode: getEditLayoutByUserCode,
		createEditLayout: createEditLayout,
		updateEditLayout: updateEditLayout,
		deleteEditLayoutByKey: deleteEditLayoutByKey,

		// Configuration Layout

		getConfigurationList: getConfigurationList,
		createConfiguration: createConfiguration,
		updateConfiguration: updateConfiguration,
		deleteConfigurationByKey: deleteConfigurationByKey,

		getConfigurationExportLayoutList: getConfigurationExportLayoutList,
		createConfigurationExportLayout: createConfigurationExportLayout,
		updateConfigurationExportLayout: updateConfigurationExportLayout,
		deleteConfigurationExportLayoutByKey: deleteConfigurationExportLayoutByKey,

		getTransactionFieldList: getTransactionFieldList,
		createTransactionField: createTransactionField,
		updateTransactionField: updateTransactionField,

		getInstrumentFieldList: getInstrumentFieldList,
		createInstrumentField: createInstrumentField,
		updateInstrumentField: updateInstrumentField,

		getDashboardLayoutList: getDashboardLayoutList,
		getDashboardLayoutByKey: getDashboardLayoutByKey,
		getActiveDashboardLayout: getActiveDashboardLayout,
		getDefaultDashboardLayout: getDefaultDashboardLayout,
		createDashboardLayout: createDashboardLayout,
		updateDashboardLayout: updateDashboardLayout,
		deleteDashboardLayoutByKey: deleteDashboardLayoutByKey,

		getTemplateLayoutList: getTemplateLayoutList,
		getTemplateLayoutByKey: getTemplateLayoutByKey,
		getDefaultTemplateLayout: getDefaultTemplateLayout,
		createTemplateLayout: createTemplateLayout,
		updateTemplateLayout: updateTemplateLayout,
		deleteTemplateLayoutByKey: deleteTemplateLayoutByKey,

		getContextMenuLayoutList: getContextMenuLayoutList,
		getContextMenuLayoutByKey: getContextMenuLayoutByKey,
		createContextMenuLayout: createContextMenuLayout,
		updateContextMenuLayout: updateContextMenuLayout,
		deleteContextMenuLayoutByKey: deleteContextMenuLayoutByKey,

		getEntityTooltipList: getEntityTooltipList,
		createEntityTooltip: createEntityTooltip,
		updateEntityTooltip: updateEntityTooltip,

		getCrossEntityAttributeExtensionList: getCrossEntityAttributeExtensionList,
		getCrossEntityAttributeExtension: getCrossEntityAttributeExtension,
		createCrossEntityAttributeExtension: createCrossEntityAttributeExtension,
		updateCrossEntityAttributeExtension: updateCrossEntityAttributeExtension,
		deleteCrossEntityAttributeExtension: deleteCrossEntityAttributeExtension,

		getColumnSortDataList: getColumnSortDataList,
		getColumnSortData: getColumnSortData,
		createColumnSortData: createColumnSortData,
		updateColumnSortData: updateColumnSortData,
		deleteColumnSortData: deleteColumnSortData,
	}
}
