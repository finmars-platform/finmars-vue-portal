<template>
	<div class="addon-page">
		<div v-if="errorMessage">
			{{ errorMessage }}
		</div>
		<div v-if="!errorMessage">
			<iframe
				:src="configurationUrl"
				style="width: 100%; height: 100vh; border: 0"
			/>
		</div>
	</div>
</template>

<script setup>
	import { useRoute } from 'vue-router';
	import useApi from '~/composables/useApi';
	import { ref } from 'vue';
	import { getRealmSpaceCodes } from '~/pages/explorer/helper';

	// get the route info
	const route = useRoute();

	// the module name, e.g. "com.finmars.cleanup"
	const moduleName = route.params.module;

	// the rest of the path, as an array
	const pathArray = route.params.path || [];

	// join array into a string, e.g. "path_to_component"
	const pathString = Array.isArray(pathArray)
		? pathArray.join('/')
		: pathArray;

	const configuration = ref({});
	const isLoading = ref(false);
	const total = ref(0);
	const items = ref([]);
	const errorMessage = ref(null);
	const configurationUrl = ref(null);

	async function getConfigurationList() {
		try {
			isLoading.value = true;

			const { realmCode, spaceCode } = getRealmSpaceCodes(route);

			const filters = ref({
				page: 1,
				query: moduleName,
				page_size: 20
			});

			const { query, page, page_size } = filters.value;

			const data = await useApi('configurationList.get', {
				filters: {
					...(query && { query }),
					page,
					page_size,
					ordering: 'name'
				}
			});

			items.value = data?.results || [];
			total.value = data?.count || 0;

			if (data?.results.length) {
				configuration.value = data?.results[0];

				if (configuration.value.manifest) {
					if (configuration.value.manifest.settings) {
						if (configuration.value.manifest.settings.ui) {
							if (
								configuration.value.manifest.settings.ui
									.url_type
							) {
								if (
									configuration.value.manifest.settings.ui
										.url_type === 'relative_url'
								) {
									let origin = window.location.origin;

									configurationUrl.value =
										origin +
										'/' +
										realmCode +
										'/' +
										spaceCode +
										configuration.value.manifest.settings.ui
											.index;
								} else if (
									configuration.value.manifest.settings.ui
										.url_type === 'absolute_url'
								) {
									configurationUrl.value =
										configuration.value.manifest.settings.ui.index;
								} else {
									errorMessage.value = 'Unknown URL Type';
								}
							} else {
								errorMessage.value = 'URL Type is not set';
							}
						} else {
							errorMessage.value = 'Addon has no UI';
						}
					} else {
						errorMessage.value = 'Addon is not configured';
					}
				} else {
					errorMessage.value = 'Manifest is not set';
				}
			} else {
				errorMessage.value = 'Addon does not exist';
			}
		} catch (e) {
			console.warn('CONFIGURATION LIST LOADING ERROR. ', e);
			errorMessage.value = e;
		} finally {
			isLoading.value = false;
		}
	}

	getConfigurationList();
</script>

<style lang="scss" scoped>
	.addon-page {
		padding: 0;
	}
</style>
