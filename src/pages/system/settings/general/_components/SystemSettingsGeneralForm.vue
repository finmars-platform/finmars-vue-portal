<template>
	<div class="system-settings-general-form">
		<form @submit.prevent="isEdit ? editWhiteLabel() : uploadWhiteLabel()">
			<div class="card">
				<UserCodeInput
					:user-code="formState.user_code"
					@update:user-code="updateField('user_code', $event)"
					@update:configuration-code="
						updateField('configuration_code', $event)
					"
					@update:valid="formData['user_code'].isValid = $event"
					class="mb-6"
				/>
				<FmTextField
					:model-value="formState.name"
					outlined
					label="Name"
					:error="formData.name.isDirty && !formData.name.isValid"
					:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? ['This field may not blank']
							: []
					"
					@update:model-value="updateField('name', $event)"
				/>
			</div>
			<FmInputFile
				:fileName="theme_css_url || null"
				label="Select css file"
				@change="onFileChange($event, 'theme_css_url')"
			/>
			<FmInputFile
				:fileName="logo_light_url || null"
				label="Select light logo file"
				@change="onFileChange($event, 'logo_light_url')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="logo_dark_url || null"
				label="Select dark logo file "
				@change="onFileChange($event, 'logo_dark_url')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="favicon_url || null"
				label="Select favicon file"
				@change="onFileChange($event, 'favicon_url')"
			/>

			<p>Custom CSS</p>
			<VAceEditor
				v-model:value="formState.custom_css"
				theme="monokai"
				lang="css"
				:options="EDITOR_OPTIONS"
				@init="editorInit"
				style="height: 200px"
				class="m-b-24"
			/>
			<FmInputArea class="mb-4" label="Notes" v-model="formState.notes" />
			<FmCheckbox v-model="formState.is_default" label="Default" />
			<button class="btn" type="submit">
				<FmBtn>Save</FmBtn>
			</button>
		</form>
	</div>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta';
	import { VAceEditor } from 'vue3-ace-editor';
	import 'ace-builds/src-noconflict/mode-css';
	import 'ace-builds/src-noconflict/theme-monokai';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import { FmTextField } from '@finmars/ui';

	const route = useRoute();
	const router = useRouter();
	const { loadThemeSettingsDefault } = useWhiteLabelStore();

	const EDITOR_OPTIONS = {
		enableBasicAutocompletion: true,
		enableSnippets: true,
		fontSize: 14,
		behavioursEnabled: true,
		highlightActiveLine: false,
		showPrintMargin: false,
		useWorker: false
	};

	const props = defineProps({
		id: Number,
		custom_css: String,
		favicon_url: String,
		company_name: String,
		is_default: Boolean,
		logo_dark_url: String,
		logo_light_url: String,
		theme_code: String,
		theme_css_url: String,
		name: String,
		notes: String,
		user_code: String,
		configuration_code: String
	});

	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});

	const formState = reactive({
		company_name: props.company_name || '',
		theme_code: props.theme_code || '',
		theme_css_url: null,
		logo_dark_url: null,
		logo_light_url: null,
		favicon_url: null,
		custom_css: props.custom_css || '',
		name: props.name || '',
		configuration_code: props.configuration_code || '',
		user_code: props.user_code || '',
		notes: props.notes || '',
		is_default: props.is_default || false
	});

	const isEdit = computed(() => !!props.id);
	const isFormValid = computed(
		() =>
			!Object.keys(formData.value).find(
				(fieldName) => !formData.value[fieldName].isValid
			)
	);

	function onFileChange(event, fieldName) {
		const file = event.target.files[0];
		if (file) {
			formState[fieldName] = file;
		} else {
			formState[fieldName] = null;
			alert('Please select a valid image file.');
		}
	}

	async function uploadWhiteLabel() {
		beforeSave();
		if (!isFormValid.value) return;

		const formData = new FormData();
		formData.append('name', formState.name);
		formData.append('configuration_code', formState.configuration_code);
		formData.append('company_name', formState.company_name);
		formData.append('theme_code', formState.theme_code);
		formData.append('theme_css_file', formState.theme_css_url);
		formData.append('logo_dark_image', formState.logo_dark_url);
		formData.append('logo_light_image', formState.logo_light_url);
		formData.append('favicon_image', formState.favicon_url);
		formData.append('custom_css', formState.custom_css);
		formData.append('is_default', formState.is_default);
		formData.append('notes', formState.notes);
		formData.append('user_code', formState.user_code);

		try {
			const response = await useApi('systemWhiteLabel.post', {
				body: formData
			});

			if (response._$error) {
				throw new Error('Save failed');
			}

			useNotify({
				type: 'success',
				title: 'White label added successfully!'
			});

			await router.push(
				useGetNuxtLink(`/system/settings/general`, route.params)
			);

			if (formState.is_default) await loadThemeSettingsDefault();
		} catch (e) {
			console.warn('Error uploading white:', e);
		}
	}

	async function editWhiteLabel() {
		beforeSave();
		if (!isFormValid.value) return;

		const formData = new FormData();
		if (props.company_name !== formState.company_name)
			formData.append('company_name', formState.company_name);
		if (props.name !== formState.name)
			formData.append('name', formState.name);
		if (props.configuration_code !== formState.configuration_code)
			formData.append('configuration_code', formState.configuration_code);
		if (props.user_code !== formState.user_code)
			formData.append('user_code', formState.user_code);
		if (props.notes !== formState.notes)
			formData.append('notes', formState.notes);
		if (props.theme_code !== formState.theme_code)
			formData.append('theme_code', formState.theme_code);
		if (formState.theme_css_url)
			formData.append('theme_css_file', formState.theme_css_url);
		if (formState.logo_dark_url)
			formData.append('logo_dark_image', formState.logo_dark_url);
		if (formState.logo_light_url)
			formData.append('logo_light_image', formState.logo_light_url);
		if (formState.favicon_url)
			formData.append('favicon_image', formState.favicon_url);
		if (props.custom_css !== formState.custom_css)
			formData.append('custom_css', formState.custom_css);
		if (props.is_default !== formState.is_default)
			formData.append('is_default', formState.is_default);

		try {
			const response = await useApi('systemWhiteLabelById.patch', {
				body: formData,
				params: { id: props.id }
			});

			if (response._$error) {
				throw new Error('Save failed');
			}

			useNotify({
				type: 'success',
				title: 'White label edited successfully!'
			});

			if (formData.get('is_default')) await loadThemeSettingsDefault();

			await router.push(
				useGetNuxtLink(`/system/settings/general`, route.params)
			);
		} catch (e) {
			console.warn('Error uploading white:', e);
		}
	}

	function updateField(field, value) {
		formState[field] = value;
		!formData.value[field].isDirty &&
			(formData.value[field].isDirty = true);
		validateForm();
	}

	function beforeSave() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isDirty = true;
			}
		});
		validateForm();
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!formState[field];
			}
		});
	}

	function editorInit(editor) {
		editor.focus();
		editor.navigateFileStart();
	}
</script>

<style scoped lang="scss">
	.system-settings-general-form {
		font-size: 14px;
		padding: 8px;
	}

	.btn {
		margin-top: 24px;
		padding: 0;
	}

	.card {
		position: relative;
		width: 100%;
		padding: 16px 12px 0;
		border-radius: 8px;
		border: 1px solid var(--outline-variant);
		margin-bottom: var(--spacing-16);
	}
</style>
