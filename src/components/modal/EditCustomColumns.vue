<template>
	<BaseModal
		:title="title"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
		class="modal--rename"
	>
		<div class="wrapp">
			<FmInputText label="Custom Column Name" v-model="newName" />
			<FmInputText
				label="Custom Column Reference Code (use programming language naming rules)"
				v-model="newUserCode"
				v-model:configuration_code="configCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
			/>
			<FmSelect
				label="Value type"
				v-model="newValueType"
				:items="dataValueType"
			></FmSelect>
			<textarea
				class="bi_area"
				cols="73"
				rows="5"
				v-model="newNotes"
			></textarea>

			<h4 class="title-custom">Custom Column Expression</h4>
			<v-ace-editor
				v-model:value="newExpression"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px; width: 600px"
			/>
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<div class="modal-bottom">
					<FmBtn type="basic" @click="() => cancelModal(cancel)">CANCEL</FmBtn>

					<FmBtn
						v-if="activeTypeModal == 'edit'"
						type="primary"
						:disabled="!!nucErrorData"
						@click="save()"
						>Save</FmBtn
					>
					<FmBtn
						v-else
						type="primary"
						:disabled="!!nucErrorData"
						@click="create()"
						>Save</FmBtn
					>
				</div>
			</slot>
		</template>
	</BaseModal>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-json'
	import 'ace-builds/src-noconflict/theme-monokai'
	let props = defineProps({
		title: String,
		name: String,
		user_code: String,
		notes: String,
		value_type: String,
		expr: String,
		valueTypeItems: Object,
		typeModal: String,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])

	let dataValueType = ref(props.valueTypeItems)
	let activeTypeModal = ref(props.typeModal)
	let newName = ref(props.name)
	let newNotes = ref(props.notes)
	let newValueType = ref(props.value_type)
	let newExpression = ref(props.expr)
	let newUserCode = ref(props.user_code)
	let configCode = ref('')
	let nucErrorData = ref(null)

	watch(
		() => props.name,
		() => (newName.value = props.name)
	)
	watch(
		() => props.notes,
		() => (newUserCode.value = props.user_code)
	)
	watch(
		() => props.value_type,
		() => (newName.value = props.name)
	)
	watch(
		() => props.expr,
		() => (newUserCode.value = props.user_code)
	)
	watch(
		() => props.user_code,
		() => (newName.value = props.name)
	)

	function editorInit(editor) {
		editor.setHighlightActiveLine(false)
		editor.setShowPrintMargin(false)
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true)

		editor.focus()
		editor.navigateFileStart()
	}
	function save() {
		if (!newUserCode.value) {
			nucErrorData.value = {
				message: 'User code should not be empty',
			}
		} else {
			emit('save', {
				name: newName.value,
				user_code: newUserCode.value,
				configuration_code: configCode.value,
				notes: newNotes.value,
				value_type: newValueType.value,
				expr: newExpression.value,
			})
		}
	}
	function create() {
		if (!newUserCode.value) {
			nucErrorData.value = {
				message: 'User code should not be empty',
			}
		} else {
			emit('create', {
				name: newName.value,
				user_code: newUserCode.value,
				configuration_code: configCode.value,
				notes: newNotes.value,
				value_type: newValueType.value,
				expr: newExpression.value,
			})
		}
	}

	function cancelModal(cancelFn) {
		newName.value = props.name
		newUserCode.value = props.user_code

		cancelFn()
	}
</script>

<style lang="scss" scoped>
	.wrapp {
		padding: 0px 15px;
		min-width: 500px;
	}
	.modal-bottom {
		display: flex;
		justify-content: flex-end;
	}
	.title-custom {
		padding: 20px 0;
	}
</style>
