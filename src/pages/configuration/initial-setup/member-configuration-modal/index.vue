<template>
	<BaseModal :title="title" class="width-60">
		<div class="flex flex-column gap-3 py-3">
			<div class="code-wrapper">
				<div class="flex flex-row gap-1">
					<div class="w-1/3">
						<FmSelect
							v-model="selectedItem.configuration_code"
							:options="configList"
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
				<FmCheckbox
					v-model="selectedItem.target_configuration_is_package"
					label="Is Package"
				/>
			</div>
			<div v-else class="flex flex-row items-center gap-1">
				<div class="brows-file-info">
					{{ selectedItem.file_name ? selectedItem.file_name : 'Select File' }}
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
					class="border-none decoration-0 p-2"
				/>
			</div>
		</div>
		<template #controls>
			<div class="flex aic sb">
				<FmButton type="secondary" @click="closeModal"> Close </FmButton>
				<FmButton
					type="primary"
					@click="confirmModal"
					:disabled="
						!selectedItem.configuration_code || !selectedItem.user_code
					"
				>
					Save
				</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { FmButton, FmCheckbox, FmSelect, FmTextField } from '@finmars/ui';

	const props = defineProps({
		item: {
			type: Object,
			required: true
		},
		title: { type: String, default: 'Create New Member Setup Configuration' },
		modalType: {
			type: String,
			default: 'create'
		},
		configList: {
			type: Array,
			default() {
				return [];
			}
		}
	});

	watch(
		() => props.item,
		(newValue) => {
			selectedItem.value = newValue;
		},
		{ deep: true }
	);

	const emit = defineEmits([
		'edit',
		'create',
		'cancelModal',
		'handleMarketplace'
	]);

	const isFromMarketplace = ref(true);
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

	const configChanelOptions = [
		{ title: 'Stable', value: 'stable' },
		{ title: 'Release Candidate', value: 'rc' }
	];

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const toggleFileMode = () => {
		isFromMarketplace.value = !isFromMarketplace.value;
		emit('handleMarketplace', isFromMarketplace.value);
	};

	const getBrowsedFiles = (files) => {
		selectedItem.value.file = files[files.length - 1].file;
		selectedItem.value.file_name = files[files.length - 1].file.name;
	};

	const closeModal = () => {
		emit('close');
	};

	const confirmModal = () => {
		emit(`${props.modalType}`, selectedItem.value);
	};

	function init() {
		selectedItem.value = props.item;
		isFromMarketplace.value = !props.item.file_name;
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
</style>
