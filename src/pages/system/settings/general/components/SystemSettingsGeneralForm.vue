<template>
	<div class="general-id">
		<h1 class="title">Edit White label</h1>
		<form @submit.prevent="uploadWhiteLabel">
			<FmInputText
				label="Enter company name"
				v-model="formState.company_name"
			/>
			<FmInputText label="Enter theme code" v-model="formState.theme_code" />
			<FmInputFile
				label="Select css url"
				@change="onFileChange($event, 'theme_css_url')"
			/>
			<FmInputFile
				label="Select light logo"
				@change="onFileChange($event, 'logo_light_url')"
				accept="image/*"
			/>

			<FmInputFile
				label="Select dark logo"
				@change="onFileChange($event, 'logo_dark_url')"
				accept="image/*"
			/>

			<FmInputFile
				label="Select favicon"
				@change="onFileChange($event, 'favicon_url')"
			/>

			<FmInputArea v-model="formState.custom_css" class="m-b-24" />
			<FmCheckbox v-model="isDefault" label="Default" />
			<FmBtn type="submit"> Upload Image</FmBtn>
		</form>
	</div>
</template>

<script setup>
	import { SystemApi } from '~/api/endpoints/system.api'

	const isDefault = ref(true)

	const formState = reactive({
		company_name: '',
		theme_code: '',
		theme_css_url: null,
		logo_dark_url: null,
		logo_light_url: null,
		favicon_url: null,
		custom_css: '',
	})

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

		try {
			const response = await SystemApi.whiteLabelUpload(formData)

			if (!response) {
				throw new Error('Upload failed')
			}
			useNotify({ type: 'success', title: 'White logo uploaded successfully!' })
		} catch (e) {
			console.warn('Error uploading white:', e)
		}
	}

	async function getWhiteLabel() {
		try {
			let response = await SystemApi.whiteLabelFetc(isDefault.value)

			if (response) {
				console.log('response', response)
			}
		} catch (e) {
			console.warn('Error fetch white:', e)
		}
	}

	onMounted(() => {
		getWhiteLabel()
	})
</script>

<style scoped lang="scss">
	.general-id {
		font-size: 14px;
		padding: 8px;
	}
</style>
