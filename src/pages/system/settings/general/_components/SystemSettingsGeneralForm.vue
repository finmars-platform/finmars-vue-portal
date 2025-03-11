<template>
	<div class="system-settings-general-form">
		<form @submit.prevent="isEdit ? editWhiteLabel() : uploadWhiteLabel()">
			<FmInputText label="Enter company name" v-model="formState.name" />
			<FmInputText
				label="Enter theme code"
				v-model="formState.configuration_code"
			/>
			<FmInputFile
				:fileName="theme_css_file || null"
				label="Select css file"
				@change="onFileChange($event, 'theme_css_file')"
			/>
			<FmInputFile
				:fileName="logo_light_image || null"
				label="Select light logo file"
				@change="onFileChange($event, 'logo_light_image')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="logo_dark_image || null"
				label="Select dark logo file "
				@change="onFileChange($event, 'logo_dark_image')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="favicon_image || null"
				label="Select favicon file"
				@change="onFileChange($event, 'favicon_image')"
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
		favicon_image: String,
		name: String,
		is_default: Boolean,
		logo_dark_image: String,
		logo_light_image: String,
		configuration_code: String,
		theme_css_file: String
	});

	const formState = reactive({
		name: props.name || '',
		configuration_code: props.configuration_code || '',
		theme_css_file: null,
		logo_dark_image: null,
		logo_light_image: null,
		favicon_image: null,
		custom_css: props.custom_css || '',
		is_default: props.is_default || false
	});

	const isEdit = computed(() => !!props.id);

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
		const formData = new FormData();
		formData.append('name', formState.name);
		formData.append('configuration_code', formState.configuration_code);
		formData.append('theme_css_file', formState.theme_css_file);
		formData.append('logo_dark_image', formState.logo_dark_image);
		formData.append('logo_light_image', formState.logo_light_image);
		formData.append('favicon_image', formState.favicon_image);
		formData.append('custom_css', formState.custom_css);
		formData.append('is_default', formState.is_default);

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
		const formData = new FormData();
		if (props.name !== formState.name)
			formData.append('name', formState.name);
		if (props.configuration_code !== formState.configuration_code)
			formData.append('configuration_code', formState.configuration_code);
		if (formState.theme_css_file)
			formData.append('theme_css_file', formState.theme_css_file);
		if (formState.logo_dark_image)
			formData.append('logo_dark_image', formState.logo_dark_image);
		if (formState.logo_light_image)
			formData.append('logo_light_image', formState.logo_light_image);
		if (formState.favicon_image)
			formData.append('favicon_image', formState.favicon_image);
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
</style>
