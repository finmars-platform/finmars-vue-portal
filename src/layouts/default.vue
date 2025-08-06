<template>
	<div v-if="notLoadingMember && store.user" class="default">
		<TheHeader />
		<div class="main">
			<FmNavigationPortal
				v-if="!$route?.meta?.isHideSidebar"
				alternativeLink="RouterLink"
				:base="config?.public?.apiURL"
				:route="$route"
				:isVue="true"
				:items="allowedItems"
			/>
			<div class="content scrollable">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';
	import useApi from '~/composables/useApi';
	import { ref } from 'vue';

	const { loadThemeSettingsDefault } = useWhiteLabelStore();
	const store = useStore();
	const evAttrsStore = useEvAttributesStore();
	const config = useRuntimeConfig();

	const { init } = useNavigationRoutes();

	store.init();

	const notLoadingMember = ref(true);
	const allowedItems = ref(null);
	const addons = ref([]);

	watchEffect(async (onCleanup) => {
		if (store.isUrlValid) {
			onCleanup(() => {});

			notLoadingMember.value = false;

			await Promise.all([
				store.getMe(),
				store.fetchEcosystemDefaults(),
				evAttrsStore.fetchSystemAttributes()
			]);

			notLoadingMember.value = true;
		}
	});

	loadThemeSettingsDefault();

	watch(
		() => store.user?.data?.dark_mode,
		() => {
			store.user.data.dark_mode =
				JSON.parse(localStorage.getItem('isDarkMode')) || false;

			useToggleDarkMode(store.user.data.dark_mode);
		}
	);

	async function getConfigurationList() {
		try {
			const filters = ref({
				page: 1,
				query: null,
				page_size: 100
			});

			const { query, page, page_size } = filters.value;

			const data = await useApi('configurationList.get', {
				filters: {
					...(query && { query }),
					page,
					page_size,
					ordering: 'name',
					'manifest.settings.ui.is_shown_in_sidenav': true
				}
			});

			addons.value = data?.results || [];

			addons.value = addons.value.map((item) => {
				return {
					key: item.configuration_code,
					label:
						item.manifest?.settings?.ui?.sidenav_label || item.name,
					to: '/addons/' + item.configuration_code + '/',
					href: null
				};
			});

			console.log('addons', addons.value);
		} catch (e) {
			console.warn('CONFIGURATION LIST LOADING ERROR. ', e);
		}
	}

	watch(
		() => store.member,
		async () => {
			const result = await init();
			if (result) {
				allowedItems.value = result;

				console.log('result', result);

				await getConfigurationList();

				allowedItems.value = allowedItems.value.map((item) => {
					if (item.key === 'add-ons') {
						item.children = addons.value;
					}

					return item;
				});
			}
		}
	);
</script>
<style lang="scss" scoped>
	.main {
		display: flex;
		background: var(--base-backgroundColor);
	}

	.content {
		flex-grow: 1;
		height: calc(100vh - 80px);
		overflow: auto;
	}
</style>
