<template>
	<BaseModal
		:title="title"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
		class="modal--rename"
	>
		<div class="wrapp">
			<FmInputUserCode
				style="width: 500px"
				class="m-b-20"
				v-model="newUserCode"
				v-model:configuration_code="newConfigCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
			/>
			

			<FmInputText label="Name" v-model="newName" />
			<FmInputText label="Short Name" v-model="newShortName" />
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<div class="modal-bottom">
					<FmBtn type="basic" @click="() => cancelModal(cancel)">CANCEL</FmBtn>

					<FmBtn
						v-if="activeCreation == false"
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
		modelValue: Boolean,
		title: String,
		name: String,
		user_code: String,
		notes: String,
		ShortName: String,
		сreation: Boolean,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])
	let modelValue = ref(props.modelValue)
	let activeCreation = ref(props.сreation)
	let newName = ref(props.name)
	let newUserCode = ref(props.user_code)
	let newConfigCode = ref(props.configuration_code)
	let newShortName = ref(props.ShortName)
	let nucErrorData = ref(null)
	let configurationList = ref()

	watch(
		() => props.modelValue,
		() => {
			if (props.modelValue) {
				;(newName.value = props.name),
					(newUserCode.value = props.user_code),
					(newShortName.value = props.ShortName),
					(newConfigCode.value = props.configuration_code)
			}
		}
	)
	async function getСonfigurationList() {
		let edRes = await useApi('configurationList.get')
		configurationList.value = edRes.error ? {} : edRes.results
	}
	getСonfigurationList()

	function save() {
		if (!newUserCode.value) {
			nucErrorData.value = {
				message: 'User code should not be empty',
			}
		} else {
			emit('save', {
				name: newName.value,
				user_code: newUserCode.value,
				configuration_code: newConfigCode.value,
				short_name: newShortName.value,
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
				configuration_code: newConfigCode.value,
				short_name: newShortName.value,
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
