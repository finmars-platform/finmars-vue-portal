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
				:items="temporaryItems"
			/>
			<div class="content scrollable">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';
	import { NavigationRoutes } from '@finmars/ui';

	const { loadThemeSettingsDefault } = useWhiteLabelStore();
	const store = useStore();
	const evAttrsStore = useEvAttributesStore();
	const config = useRuntimeConfig();

	const { init } = useNavigationRoutes();

	store.init();

	const notLoadingMember = ref(true);
	const temporaryItems = ref([]);

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
			useToggleDarkMode(store.user.data.dark_mode);
		}
	);

	watch(
		() => store.member,
		async () => {
			// if(store.member?.is_admin){
			// 	temporaryItems.value = NavigationRoutes;
			// } else {
				temporaryItems.value = await init();
			// }
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
