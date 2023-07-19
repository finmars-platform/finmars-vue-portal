<template>
	<div>
		<FmSelect
			v-if="content_type"
			:items="portfolios"
			label="Layout"
			prop_name="name"
			prop_id="name"
			:modelValue="layoutName"
			@update:modelValue="getData($event), (layoutName = $event)"
		/>

		<FmBtn v-if="layoutName" @click="isOpenCode = true">Edit layout</FmBtn>

		<BaseModal
			v-model="isOpenCode"
			no_padding
			title="Edit layout"
			:controls="{
				cancel: { name: 'Cancel', cb: () => (isOpenCode = false) },
				action: { name: 'Save', cb: saveLayout },
			}"
			style="z-index: 500"
		>
			<v-ace-editor
				v-model:value="layout"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="width: 90vw; height: 80vh"
			/>
		</BaseModal>
	</div>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-json'
	import 'ace-builds/src-noconflict/theme-monokai'

	const emits = defineEmits(['update:modelValue'])
	const props = defineProps(['settings', 'layout'])

	let portfolios = ref([])
	let content_type = ref('')
	let layoutName = ref('')
	let layout = ref('{}')

	if (props.layout) {
		layoutName.value = JSON.parse(props.layout).name
		layout.value = props.layout
	}

	let isOpenCode = ref(false)

	if (props.settings.find((o) => o.key == 'content_type')) {
		let stg = props.settings.find((o) => o.key == 'content_type')

		content_type.value = stg.default_value

		init()
	}

	watch(
		props.settings,
		() => {
			let stg = props.settings.find((o) => o.key == 'content_type')

			content_type.value = stg.default_value

			init()
		},
		{ deep: true }
	)

	function editorInit(editor) {
		editor.setHighlightActiveLine(false)
		editor.setShowPrintMargin(false)
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true)

		editor.focus()
		editor.navigateFileStart()
	}

	async function getData(name) {
		let res = await useApi('listLayoutList.get', {
			filters: {
				name: name,
			},
		})
		console.log('res:', res)

		layout.value = JSON.stringify(res.results[0], null, 4)

		emits('update:modelValue', layout.value)
	}
	async function saveLayout() {
		emits('update:modelValue', layout.value)
	}

	async function init() {
		let res = await useApi('listLayoutListLight.get', {
			filters: {
				content_type: content_type.value,
			},
		})

		portfolios.value = res.results
	}
</script>

<style lang="scss" scoped></style>
