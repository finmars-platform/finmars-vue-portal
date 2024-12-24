<template>
	<div class="py-3 px-8">
		<div class="">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-h-36"
		>
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<template v-else>
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
					<FmButton @click="toggleFileMode" rounded>
						<span v-if="isFromMarketplace">
							I want to upload .zip file manually
						</span>
						<span v-else>I want to provide code from marketplace</span>
					</FmButton>
				</div>
				<div v-if="isFromMarketplace" class="flex flex-col gap-4">
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
					<FmCheckbox
						v-model="selectedItem.target_configuration_is_package"
						label="Is Package"
					/>
				</div>
				<div v-else class="flex flex-row items-center gap-1">
					<div class="brows-file-info">
						{{
							selectedItem.file_name ? selectedItem.file_name : 'Select File...'
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
				<div class="flex flex-column pt-2">
					<span class="mb-1">Notes</span>
					<textarea
						id="notes"
						name="notes"
						rows="6"
						cols="50"
						v-model="selectedItem.notes"
						class="decoration-0 p-2"
					/>
				</div>
			</div>
			<div class="flex items-center justify-start gap-2">
				<FmButton
					type="primary"
					@click="createItem"
					:loading="confirmButtonLoader"
					:disabled="
						!selectedItem.configuration_code || !selectedItem.user_code
					"
					rounded
				>
					Save
				</FmButton>
				<FmButton type="secondary" @click="cancel" rounded> Cancel </FmButton>
			</div>
		</template>
	</div>
</template>

<script setup>
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import {
		FmButton,
		FmCheckbox,
		FmSelect,
		FmTextField,
		FmProgressCircular,
		FmBreadcrumbs,
		FmFileUpload
	} from '@finmars/ui';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'New User Setups', path: 'initial-setup' },
		{ title: 'New', path: 'new' }
	]);

	const configChanelOptions = [
		{ title: 'Stable', value: 'stable' },
		{ title: 'Release Candidate', value: 'rc' }
	];

	const loading = ref(false);
	const isFromMarketplace = ref(true);
	const confirmButtonLoader = ref(false);
	const configCodeOptions = ref([{ title: 'No codes !', value: '' }]);
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

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const toggleFileMode = () => {
		isFromMarketplace.value = !isFromMarketplace.value;
	};

	const getBrowsedFiles = (files) => {
		if (files && files.length) {
			selectedItem.value.file = files[files.length - 1].file;
			selectedItem.value.file_name = files[files.length - 1].file.name;
		} else {
			selectedItem.value.file = null;
			selectedItem.value.file_name = '';
		}
	};

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/configuration` + newPath);
	};

	const cancel = () => {
		selectedItem.value = {};
		confirmButtonLoader.value = false;
		router.back();
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
			appendField('file_url', '');
			appendField('file_name', '');
			appendField('file', null);
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

	async function createItem() {
		try {
			confirmButtonLoader.value = true;
			const formData = generateFormData(selectedItem.value);
			await useApi('newMemberSetupConfig.post', {
				body: formData
			});
			cancel();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	function init() {
		getConfigList();
	}

	init();
</script>

<style scoped lang="scss">
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
	textarea {
		border: 1px solid var(--border-color);
		border-radius: var(--spacing-4);
	}
	:deep(.upload-process-panel) {
		z-index: 56 !important;
	}
</style>
