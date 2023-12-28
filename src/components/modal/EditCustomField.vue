<template>
	<BaseModal
		:title="activeTitle"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
		class="modal--rename"
	>
		<div class="wrap">
			<FmInputText
				label="Custom Column Name"
				v-model="newName"
				class="m-b-24"
			/>

			<FmInputUserCode
				userCodeLabel="Custom Column Reference Code (use programming language naming rules)"
				v-model="newUserCode"
				@configurationCodeChanged="(newVal) => (configCode = newVal)"
				class="m-b-24"
			/>

			<FmSelect
				label="Value type"
				v-model="newValueType"
				:items="valueTypeItems"
				class="m-b-24"
			></FmSelect>

			<FmInputArea
				label="Notes"
				cols="73"
				v-model="newNotes"
				class="m-b-24"
			></FmInputArea>

			<h4 class="p-b-8">Custom Column Expression</h4>
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
						v-if="activeEditing == 'edit'"
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
		editing: String,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])

	let activeEditing = ref(props.editing)
	let newName = ref(props.name)
	let newNotes = ref(props.notes)
	let newValueType = ref(props.value_type)
	let newExpression = ref(props.expr)
	let newUserCode = ref(props.user_code)

	let configCode = ref('')


	let activeTitle =
		activeEditing.value == 'edit' ? props.title : 'Create Custom Column'

	if (newUserCode.value) {
		let ucParts = newUserCode.value.split(':')

		if (ucParts.length) configCode.value = ucParts[0]
	}

	let nucErrorData = ref(null)
	let valueTypeItems = reactive([
		{
			id: 10,
			name: 'Text',
		},
		{
			id: 20,
			name: 'Number',
		},
		{
			id: 40,
			name: 'Date',
		},
	])

	watch(
		() => props.modelValue,
		() => {
			if (props.modelValue) {
				;(newName.value = props.name),
					(newUserCode.value = props.user_code),
					(newNote.value = props.notes),
					(newValueType.value = props.value_type),
					(newExpression.value = props.expr)
			}
		}
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
	.wrap {
		padding: 0px 15px 24px;
		min-width: 500px;
	}
	.modal-bottom {
		display: flex;
		justify-content: space-between;
	}
	.title-custom {
		padding: 20px 0;
	}
</style>
