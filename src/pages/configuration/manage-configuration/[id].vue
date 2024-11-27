<template>
	<section class="manage-configuration-id">
		<h1 class="text-[20px] font-bold mb-6">Configuration Manager</h1>

		<ManageConfigurationForm
			v-if="item"
			:configuration_code="item.configuration_code"
			:name="item.name"
			:description="item.description"
			:version="item.version"
			:channel="item.channel"
			:type="item.type"
			:is_primary="item.is_primary"
			:is_package="item.is_package"
			:configurationId="item.id"
			:manifest="item.manifest"
			:user_code="item.user_code"
		/>
	</section>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta';
	import ManageConfigurationForm from '~/pages/configuration/manage-configuration/_components/ManageConfigurationForm.vue';

	definePageMeta({
		middleware: 'auth',
	});

	const route = useRoute();
	const router = useRouter();

	const item = ref(null);

	async function getConfiguration() {
		try {
			const response = await useApi('manageConfigurationListById.get', {
				params: { id: route.params.id }
			});

			item.value = response;
		} catch (e) {
			console.warn('CONFIGURATION ITEM LOADING ERROR. ', e);
			await router.push(
				useGetNuxtLink(`/configuration/manage-configuration/`, route.params)
			);
		}
	}

	getConfiguration();
</script>

<style scoped lang="scss">
	.manage-configuration-id {
		font-size: 14px;
		padding: 8px;
		color: var(--on-surface);
	}
</style>
