import { defineStore } from "pinia";
// import useNotify from "~/composables/useNotify";
// import {useRecursiveDeepCopy} from "~/composables/useMeta";

/**
 * Check whether local layout newer than server one
 *
 * @param {Object} layout - layout stored locally
 * @param {Object} fetchedLayoutData - light layout or data of ping
 * @returns boolean
 */
function layoutIsActual(layout, fetchedLayoutData) {

	if (fetchedLayoutData.error) {

		console.error(fetchedLayoutData.error);
		useNotify({type: 'error', title: fetchedLayoutData.error.message || fetchedLayoutData.error.detail});

		return false;

	}

	if (layout.modified) { // check that default layout still default

		const layoutModDate = new Date(layout.modified).getTime();
		let fetchedLayoutModDate = new Date(fetchedLayoutData.modified).getTime();

		if (layoutModDate >= fetchedLayoutModDate) {
			return true;
		}

	}

	return false;

}

function processError(dataWithError) {

	console.error(dataWithError.error);
	useNotify({type: 'error', title: dataWithError.error.message || dataWithError.error.detail});

	return dataWithError;

}

export default defineStore({
	id: "layouts",
	state: () => {
		return {
			listLayoutsData: {},
			defaultListLayoutsData: {}, // do not contain full layouts
			listLayoutsLightData: {}, // used by LayoutsManager

			layoutToOpen: null, // id of layout
			dashboardLayouts: [],

		};
	},
	actions: {

		async fetchAndCacheLayout(route_opt, options) {

			const res = await useApi(route_opt, options);

			if (res.error) {
				return processError(res);
			}

			let layout = res;

			const fetchingByUc = options.filters && options.filters.hasOwnProperty('user_code');
			const fetchingDefault = options.filters && options.filters.is_default === 2;

			if (fetchingByUc || fetchingDefault) {

				if (!res.results.length) {

					const errorData = {
						error: {
							key: 'not_found',
							message: 'No layouts were found when searching by user code: ' + options.filters.user_code,
						},
					};

					if (fetchingDefault) errorData.message = "No default layout were found."

					console.error(errorData.error);

					return null;

				}

				layout = res.results[0];

			}

			this.listLayoutsData[layout.id] = layout;

			// TODO: place layout inside localStorage

			if (fetchingDefault) {

				const defaultData = {
					id: layout.id,
					name: layout.name,
					user_code: layout.user_code,
				};

				this.defaultListLayoutsData[layout.id] = defaultData;
				// TODO: place defaultData inside localStorage

			}

			return useRecursiveDeepCopy(layout);

		},

		async getLayoutByUserCode(contentType, userCode) {

			const options = {
				filters: {
					content_type: contentType,
					user_code: userCode,
				}
			};


			const res = await useApi('listLayoutListLight.get', options);

			if (res.error) {
				return processError(res);

			} else if (!res.results.length) {
				return processError({error: {message: `Layout with usercode "${userCode}" is not found.`}});
			}

			let layoutData = res.results[0];

			// TODO: process res.length === 0
			let layout = this.listLayoutsData[layoutData.id];

			if (layout && layoutIsActual(layout, res)) {
				return useRecursiveDeepCopy(layout);
			}

			return this.fetchAndCacheLayout('listLayout.get', {params: {id: layoutData.id}});

		},

		async getLayoutByKey(id) {

			let layout = this.listLayoutsData[id];

			// TODO: get layout from localStorage if it is not inside a store

			if (layout) {

				let pingRes = await useApi('listLayoutPing.get', {params: {id: layout.id}});

				if (layoutIsActual(layout, pingRes)) {
					return useRecursiveDeepCopy(layout);
				}

			}

			return this.fetchAndCacheLayout('listLayout.get', {params: {id: id}});

		},

		async getDefaultLayout(contentType) {

			const defLayoutData = this.defaultListLayoutsData[contentType];
			let layout;

			if (defLayoutData) layout = this.listLayoutsData[defLayoutData.id];

			// TODO: get layout from localStorage if it is not inside a store

			if (layout) {

				let pingRes = await useApi('listLayoutPing.get', {params: {id: layout.id}});

				if (layoutIsActual(layout, pingRes) && pingRes.is_default) {
					return useRecursiveDeepCopy(layout);
				}

			}

			const options = {
				filters: {
					content_type: contentType,
					is_default: 2
				}
			}

			return this.fetchAndCacheLayout('listLayoutList.get', options);

		},

		async updateLayout(layoutId, layout) {

			const options = {
				params: {
					id: layoutId,
				},
				body: layout
			};

			let res = await useApi('listLayout.put', options);

			if (res.error) {
				return processError(res);

			} else {

				this.listLayoutsData[res.id] = res;

				if (res.is_default) {

					this.defaultListLayoutsData[res.id] = {
						id: res.id,
						name: res.name,
						user_code: res.user_code,
					};

				}

				// TODO: save layout inside localStorage
				return useRecursiveDeepCopy(res);

			}

		},

		removeLayoutLight(layoutId) {

			const contentTypesList = Object.keys(this.listLayoutsLightData);

			while (contentTypesList.length) {

				const ct = contentTypesList.pop();

				const llIndex = this.listLayoutsLightData[ct].findIndex(lLayout => lLayout.id === layoutId);

				if (llIndex > -1) {

					this.listLayoutsLightData[ct].splice(llIndex, 1);
					break;

				}

			}

		},

		async deleteLayout(layoutId) {

			const res = useApi('listLayout.delete', {params: {id: layoutId}});

			if (res.error) {
				return processError(res);

			} else {

				// TODO: delete layout from localStorage
				delete this.listLayoutsData[layoutId];
				this.removeLayoutLight(layoutId);

				return res;

			}

		},

		async getListLayoutsLight(contentType) {

			const filters = {
				pageSize: 1000,
				content_type: contentType,
			}

			const res = await useApi('listLayoutListLight.get', {filters});

			if (res.error) {
				return processError(res);

			} else {

				this.listLayoutsLightData[contentType] = res.results;
				return this.listLayoutsLightData[contentType];

			}

		}

	},
	getters: {},
});
