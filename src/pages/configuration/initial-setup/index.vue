<template>
	<div class="px-5 py-5 flex flex-col items-start justify-start gap-2">
		<span class="mb-4 text-lg">Initial Configuration for Invited Users</span>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-w-36"
		>
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<div
			v-else-if="!items.length"
			class="flex w-full justify-center items-center min-w-36"
		>
			<span>No data available!</span>
		</div>
		<template v-else>
			<Card
				v-for="item in items"
				@open-modal="openModal"
				@delete-item="deleteItem"
				:item="item"
				:key="item.id"
			/>
			<FmPagination
				:with-info="true"
				:total-items="count"
				:items-per-page="pageSize"
				:model-value="currentPage"
				@update:modelValue="handlePageChange"
			/>
		</template>
		<div>
			<FmButton type="primary" @click="openModal()" rounded> Create </FmButton>
		</div>
		<MemberSetupModal
			v-model="showModal"
			:modal-type="modalType"
			:item="selectedItem"
			@edit="editItem"
			@create="createItem"
			@close="closeModal"
			@handle-marketplace="handleMarketplace"
			:config-list="configCodeOptions"
			:title="modalTitle"
		/>
	</div>
</template>

<script setup>
	import Card from '@/pages/configuration/initial-setup/card/index.vue';
	import { FmButton, FmPagination, FmProgressCircular } from '@finmars/ui';
	import MemberSetupModal from '@/pages/configuration/initial-setup/member-configuration-modal/index.vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query?.page ? parseInt(route.query.page) : 1);

	const items = ref([]);
	const isFromMarketplace = ref(true);
	const showModal = ref(false);
	const modalType = ref('create');
	const modalTitle = ref('Create New Member Setup Configuration');

	const selectedItem = ref({
		id: '',
		name: '',
		user_code: '',
		configuration_code: '',
		notes: '',
		target_configuration_code: '',
		target_configuration_version: '',
		target_configuration_channel: 'stable',
		target_configuration_is_package: false,
		file_name: '',
		file: null
	});

	const configCodeOptions = ref([{ title: 'No codes !', value: '' }]);

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	const getEditableObject = (item = null) => {
		return {
			id: item?.id || '',
			name: item?.name || '',
			user_code: item?.user_code || '',
			configuration_code: item?.configuration_code || '',
			notes: item?.notes || '',
			target_configuration_code: item?.target_configuration_code || '',
			target_configuration_version: item?.target_configuration_version || '',
			target_configuration_channel:
				item?.target_configuration_channel || 'stable',
			target_configuration_is_package:
				item?.target_configuration_is_package || false,
			file_name: '',
			file: null
		};
	};

	const generateFormData = (item = null) => {
		const formData = new FormData();
		const appendField = (key, value) => formData.append(key, value || '');
		appendField('id', item?.id);
		appendField('name', item?.name);
		appendField('user_code', item?.user_code);
		appendField('configuration_code', item?.configuration_code);
		appendField('notes', item?.notes);
		if (isFromMarketplace.value) {
			appendField('target_configuration_code', item?.target_configuration_code);
			appendField(
				'target_configuration_version',
				item?.target_configuration_version
			);
			appendField(
				'target_configuration_channel',
				item?.target_configuration_channel || 'stable'
			);
			appendField(
				'target_configuration_is_package',
				item?.target_configuration_is_package || false
			);
		} else if (selectedItem.value.file) {
			formData.append('file', selectedItem.value.file);
		}
		return formData;
	};

	async function getConfigList() {
		try {
			const res = await useApi('configurationList.get');
			if (res.results) {
				configCodeOptions.value = res.results.map((result) => {
					return {
						title: result.configuration_code,
						value: result.configuration_code
					};
				});
			} else {
				configCodeOptions.value = [{ title: 'No codes !', value: '' }];
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function getList(newPage = 1) {
		try {
			router.push({ query: { ...route.query, page: currentPage.value } });
			loading.value = true;
			const payload = {
				page_size: pageSize.value,
				page: newPage
			};
			const res = await useApi('newMemberSetupConfig.get', {
				filters: payload,
				query: { page: newPage }
			});
			count.value = res.count;
			items.value = res.results;
			selectedItem.value = getEditableObject(null);
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function createItem(item) {
		try {
			loading.value = true;
			selectedItem.value = item;
			const formData = generateFormData(selectedItem.value);
			await useApi('newMemberSetupConfig.post', {
				body: formData
			});
			await getList();
			closeModal();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function editItem(item) {
		try {
			loading.value = true;
			selectedItem.value = item;
			const formData = generateFormData(selectedItem.value);
			await useApi('newMemberSetupConfig.put', {
				params: { id: selectedItem.value.id },
				body: formData
			});
			await getList();
			closeModal();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function deleteItem(item) {
		const confirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure that you want to delete ${item.name}?`
		});
		if (confirm) {
			try {
				await useApi('newMemberSetupConfig.delete', {
					params: { id: item.id }
				});
				useNotify({
					type: 'success',
					title: `${item.name} successfully deleted`
				});
				await getList();
			} catch (e) {
				console.log(`Catch error: ${e}`);
			}
		}
	}

	const openModal = (item = null) => {
		modalType.value = !item ? 'create' : 'edit';
		modalTitle.value = !item
			? 'Create New Member Setup Configuration'
			: 'Edit Member Setup Configuration';
		selectedItem.value = getEditableObject(item);
		isFromMarketplace.value = !item?.file_name;
		showModal.value = true;
	};

	const handleMarketplace = (marketplace) => {
		isFromMarketplace.value = marketplace;
	};

	const closeModal = () => {
		modalType.value = 'create';
		selectedItem.value = getEditableObject(null);
		showModal.value = false;
	};

	function init(newPage = 1) {
		getList(newPage);
		getConfigList();
	}

	init();
</script>

<style scoped lang="scss"></style>
