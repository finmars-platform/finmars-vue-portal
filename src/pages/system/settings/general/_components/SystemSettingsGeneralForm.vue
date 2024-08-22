<template>
	<div class="system-settings-general-form">
		<form @submit.prevent="isEdit ? editWhiteLabel() : uploadWhiteLabel()">
			<FmInputText
				label="Enter company name"
				v-model="formState.company_name"
			/>
			<FmInputText label="Enter theme code" v-model="formState.theme_code" />
			<FmInputFile
				:fileName="theme_css_url || null"
				label="Select css url"
				@change="onFileChange($event, 'theme_css_url')"
			/>
			<FmInputFile
				:fileName="logo_light_url || null"
				label="Select light logo"
				@change="onFileChange($event, 'logo_light_url')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="logo_dark_url || null"
				label="Select dark logo"
				@change="onFileChange($event, 'logo_dark_url')"
				accept="image/*"
			/>

			<FmInputFile
				:fileName="favicon_url || null"
				label="Select favicon"
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
			<FmCheckbox v-model="formState.is_default" label="Default" />
			<button class="btn" type="submit">
				<FmBtn>Save</FmBtn>
			</button>
		</form>
	</div>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta'
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-css'
	import 'ace-builds/src-noconflict/theme-monokai'
	import Button from '~/pages/demo/button.vue'

	const route = useRoute()
	const router = useRouter()

	const EDITOR_OPTIONS = {
		enableBasicAutocompletion: true,
		enableSnippets: true,
		fontSize: 14,
		behavioursEnabled: true,
		highlightActiveLine: false,
		showPrintMargin: false,
		useWorker: false
	}

	const props = defineProps({
		id: Number,
		custom_css: String,
		favicon_url: String,
		company_name: String,
		is_default: Boolean,
		logo_dark_url: String,
		logo_light_url: String,
		theme_code: String,
		theme_css_url: String
	})

	const formState = reactive({
		company_name: props.company_name || '',
		theme_code: props.theme_code || '',
		theme_css_url: null,
		logo_dark_url: null,
		logo_light_url: null,
		favicon_url: null,
		custom_css: props.custom_css || '',
		is_default: props.is_default || false
	})

	const isEdit = computed(() => !!props.id)

	function onFileChange(event, fieldName) {
		const file = event.target.files[0]
		if (file) {
			formState[fieldName] = file
		} else {
			formState[fieldName] = null
			alert('Please select a valid image file.')
		}
	}

	async function uploadWhiteLabel() {
		const formData = new FormData()
		formData.append('company_name', formState.company_name)
		formData.append('theme_code', formState.theme_code)
		formData.append('theme_css_file', formState.theme_css_url)
		formData.append('logo_dark_image', formState.logo_dark_url)
		formData.append('logo_light_image', formState.logo_light_url)
		formData.append('favicon_image', formState.favicon_url)
		formData.append('custom_css', formState.custom_css)
		formData.append('is_default', formState.is_default)

		try {
			const response = await useApi('systemWhiteLabel.post', { body: formData })

			if (!response) {
				throw new Error('Upload failed')
			}
			useNotify({ type: 'success', title: 'White logo uploaded successfully!' })

			await router.push(
				useGetNuxtLink(`/system/settings/general`, route.params)
			)
		} catch (e) {
			console.warn('Error uploading white:', e)
		}
	}

	async function editWhiteLabel() {
		const formData = new FormData()
		if (props.company_name !== formState.company_name)
			formData.append('company_name', formState.company_name)
		if (props.theme_code !== formState.theme_code)
			formData.append('theme_code', formState.theme_code)
		if (formState.theme_css_url)
			formData.append('theme_css_file', formState.theme_css_url)
		if (formState.logo_dark_url)
			formData.append('logo_dark_image', formState.logo_dark_url)
		if (formState.logo_light_url)
			formData.append('logo_light_image', formState.logo_light_url)
		if (formState.favicon_url)
			formData.append('favicon_image', formState.favicon_url)
		if (props.custom_css !== formState.custom_css)
			formData.append('custom_css', formState.custom_css)
		if (props.is_default !== formState.is_default)
			formData.append('is_default', formState.is_default)

		try {
			const response = await useApi('systemWhiteLabelById.patch', {
				body: formData,
				params: { id: props.id }
			})

			if (!response) {
				throw new Error('Upload failed')
			}
			useNotify({ type: 'success', title: 'White logo uploaded successfully!' })

			await router.push(
				useGetNuxtLink(`/system/settings/general`, route.params)
			)
		} catch (e) {
			console.warn('Error uploading white:', e)
		}
	}

	function editorInit(editor) {
		editor.focus()
		editor.navigateFileStart()
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
