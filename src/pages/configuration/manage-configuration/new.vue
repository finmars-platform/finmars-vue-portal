<template>
	<section class="manage-configuration-id">
		<h1 class="text-[20px] font-bold mb-6">Configuration Manager</h1>

		<ManageConfigurationForm />
	</section>
</template>

<script setup>
	import ManageConfigurationForm from '~/pages/configuration/manage-configuration/_components/ManageConfigurationForm.vue';
</script>

<style scoped lang="scss">
	.manage-configuration-id {
		font-size: 14px;
		padding: 8px;
		color: var(--on-surface);
	}
</style>
