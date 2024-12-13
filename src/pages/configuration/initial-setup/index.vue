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
			<div
				class="card flex justify-between items-center"
				v-for="item in items"
				:key="item"
			>
				<span>Name: {{ item.name }}</span>
				<div>
					<FmButton type="secondary" @click="openModal(item)" rounded>
						Edit
					</FmButton>
					<FmButton type="secondary" @click="deleteItem(item)" rounded>
						Delete
					</FmButton>
				</div>
			</div>
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

		<BaseModal
			v-model="showModal"
			title="Create New Member Setup Configuration"
			class="width-60"
		>
			<div class="flex flex-column gap-3 py-3">
				<div class="code-wrapper">
					<div class="flex flex-row gap-1">
						<div class="w-1/3">
							<FmSelect
								v-model="selectedItem.configuration_code"
								:options="configCodeOptions"
								label="Configuration"
								variant="outlined"
							/>
							<span v-if="!selectedItem.configuration_code" class="error-text"
								>Field is required</span
							>
						</div>
						<div class="w-full">
							<FmTextField
								v-model="selectedItem.user_code"
								:rules="[rules.required]"
								label="User Code"
								outlined
							/>
						</div>
					</div>
					<i class="text-xs my-1">
						Result: {{ selectedItem.configuration_code }}:{{
							selectedItem.user_code
						}}
					</i>
				</div>
				<FmTextField v-model="selectedItem.name" label="Name" outlined />
				<div class="flex w-full justify-center items-center">
					<FmButton @click="toggleFileMode">
						<span v-if="isFromMarketplace">
							I want to upload .zip file manually
						</span>
						<span v-else>I want to provide code from marketplace</span>
					</FmButton>
				</div>
				<div v-if="isFromMarketplace">
					<FmTextField
						v-model="selectedItem.target_configuration_code"
						label="Configuration Code"
						outlined
					/>
					<FmTextField
						v-model="selectedItem.target_configuration_version"
						label="Configuration Version"
						outlined
					/>
					<FmSelect
						v-model="selectedItem.target_configuration_channel"
						variant="outlined"
						:options="configChanelOptions"
						label="Configuration Chanel"
					/>
				</div>
				<div v-else class="flex flex-row items-center gap-1">
					<div class="brows-file-info">
						{{
							selectedItem.file_name ? selectedItem.file_name : 'Select File'
						}}
					</div>
					<div class="max-w-32">
						<FmFileUpload
							@update-files="getBrowsedFiles"
							:multiple="false"
							icon="mdi-upload"
							variant="large"
							label="BROWSE"
						/>
					</div>
				</div>
				<FmCheckbox
					v-model="selectedItem.target_configuration_is_package"
					label="Is Package"
				/>
				<div class="flex flex-column pt-2">
					<span class="mb-1">Notes</span>
					<textarea
						id="notes"
						name="notes"
						rows="6"
						cols="50"
						v-model="selectedItem.notes"
						class="border-none decoration-0 p-2"
					/>
				</div>
			</div>
			<template #controls>
				<div class="flex aic sb">
					<FmButton type="secondary" @click="cancelModal"> Close </FmButton>
					<FmButton
						type="primary"
						@click="confirmModal()"
						:disabled="
							!selectedItem.configuration_code ||
							!selectedItem.user_code ||
							(!isFromMarketplace && !selectedItem.file_name)
						"
					>
						Save
					</FmButton>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup>
	import {
		FmButton,
		FmTextField,
		FmSelect,
		FmPagination,
		FmCheckbox,
		FmProgressCircular
	} from '@finmars/ui';

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
	const isEdit = ref(false);
	const isCreate = ref(false);

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
	const configChanelOptions = [
		{ title: 'Stable', value: 'stable' },
		{ title: 'Release Candidate', value: 'rc' }
	];

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	const getEditableObject = (item = null) => {
		return {
			id: item ? item.id : '',
			name: item ? item.name : '',
			user_code: item ? item.user_code : '',
			configuration_code: item ? item.configuration_code : '',
			notes: item ? item.notes : '',
			target_configuration_code: item ? item.target_configuration_code : '',
			target_configuration_version: item
				? item.target_configuration_version
				: '',
			target_configuration_channel: item
				? item.target_configuration_channel
				: 'stable',
			target_configuration_is_package: item
				? item.target_configuration_is_package
				: false,
			file_name: '',
			file: null
		};
	};

	const generateFormData = (item = null) => {
		const formData = new FormData();
		formData.append('name', item ? item.id : '');
		formData.append('name', item ? item.name : '');
		formData.append('user_code', item ? item.user_code : '');
		formData.append('configuration_code', item ? item.configuration_code : '');
		formData.append('notes', item ? item.notes : '');
		formData.append(
			'target_configuration_code',
			item ? item.target_configuration_code : ''
		);
		formData.append(
			'target_configuration_version',
			item ? item.target_configuration_version : ''
		);
		formData.append(
			'target_configuration_channel',
			item ? item.target_configuration_channel : 'stable'
		);
		formData.append(
			'target_configuration_is_package',
			item ? item.target_configuration_is_package : false
		);
		if (selectedItem.value.file) {
			formData.append('file', selectedItem.value.file);
		} else {
			formData.append('file', null);
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
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	const toggleFileMode = () => {
		isFromMarketplace.value = !isFromMarketplace.value;
	};

	const getBrowsedFiles = (files) => {
		selectedItem.value.file = files[files.length - 1].file;
		selectedItem.value.file_name = files[files.length - 1].file_name;
	};

	async function createNewItem() {
		try {
			const formData = generateFormData(selectedItem.value);
			await useApi('newMemberSetupConfig.post', {
				body: formData
			});
			await getList();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function editItem() {
		try {
			const formData = generateFormData(selectedItem.value);
			await useApi('newMemberSetupConfig.put', {
				params: { id: selectedItem.value.id },
				body: formData
			});
			await getList();
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

	async function openModal(item = null) {
		isCreate.value = !item;
		isEdit.value = !!item;
		showModal.value = true;
		isFromMarketplace.value = true;
		selectedItem.value = getEditableObject(item);
	}

	const cancelModal = () => {
		isEdit.value = false;
		isCreate.value = false;
		showModal.value = false;
		isFromMarketplace.value = true;
		selectedItem.value = getEditableObject(null);
	};

	const confirmModal = () => {
		(isEdit.value ? editItem : createNewItem)();
		isEdit.value = false;
		isCreate.value = false;
		showModal.value = false;
		isFromMarketplace.value = true;
		selectedItem.value = getEditableObject(null);
	};

	function init(newPage = 1) {
		getList(newPage);
		getConfigList();
	}

	init();
</script>

<style scoped lang="scss">
	.card {
		border-radius: var(--spacing-4);
		border: 1px solid var(--card-border-color);
		background: var(--card-background-color);
		padding: var(--spacing-12);
		width: 100%;
		.card-title {
			padding-bottom: var(--spacing-8);
			margin-bottom: var(--spacing-4);
			border-bottom: 1px solid var(--border-color);
		}
		.table-wrapper {
			max-height: 480px;
			overflow-y: auto;
		}
	}
	.code-wrapper {
		display: flex;
		flex-direction: column;
		border-radius: var(--spacing-4);
		border: 1px solid var(--border-color);
		padding: var(--spacing-12);
	}
	.error-text {
		font-size: var(--spacing-12);
		color: var(--error-color);
		margin: var(--spacing-12);
	}
	.brows-file-info {
		width: 100%;
		border-radius: var(--spacing-4);
		border: 1px solid var(--border-color);
		padding: var(--spacing-4);
	}
</style>
