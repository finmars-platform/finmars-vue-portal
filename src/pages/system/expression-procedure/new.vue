<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div class="py-3 px-8 flex flex-column gap-2">
			<div class="code-wrapper">
				<UserCodeInput
					:user-code="expressionProcedureItem.user_code"
					@update:user-code="updateField('user_code', $event)"
					@update:configuration-code="
						updateField('configuration_code', $event)
					"
					@update:valid="updateUserCodeValidationValue"
				/>
			</div>
			<FmTextField
				:model-value="expressionProcedureItem.name"
				outlined
				label="Name"
				:error="formData.name.isDirty && !formData.name.isValid"
				:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? 'This field may not be blank.'
							: ''
					"
				@change="updateField('name', $event)"
			/>
			<div class="flex flex-col mb-2">
				<span class="mb-1">Notes</span>
				<textarea
					id="notes"
					name="notes"
					rows="4"
					cols="50"
					v-model="expressionProcedureItem.notes"
				/>
			</div>
		</div>
		<div class="py-3 px-8 flex flex-column gap-4">
			<span>Context Variables</span>
			<div v-if="contextVariablesList.length" class="context-variable-card">
				<ContextVariable
					v-for="variable of contextVariablesList"
					:key="variable.order"
					:item="variable"
					@remove-item="removeVariable"
					@update-item="updateVariable"
				/>
			</div>
			<FmButton type="primary" @click="addNewVariable" rounded>Add Context Variable</FmButton>
		</div>
		<div class="py-3 px-8 flex flex-col gap-4 w-full h-full">
			<VAceEditor
				id="expressionEditor"
				lang="json"
				theme="monokai"
				class="min-h-64 w-full h-full"
				@init="onEditorInit"
			/>
		</div>
		<div class="flex items-center justify-start gap-4 py-3 px-8">
			<FmButton
				type="primary"
				@click="createItem"
				:loading="confirmButtonLoader"
				:disabled="!isFormValid || !isContextVariablesValid"
				rounded
			>
				Create
			</FmButton>
			<FmButton type="secondary" @click="closeItem" rounded>Close</FmButton>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton, FmTextField
	} from '@finmars/ui';
	import debounce from 'lodash/debounce';
	import cloneDeep from 'lodash/cloneDeep';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import useAceEditor from '~/composables/useAceEditor';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import ContextVariable from '~/pages/system/expression-procedure/context-variable/index.vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { VAceEditor, onEditorInit } = useAceEditor();
	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const confirmButtonLoader = ref(false);
	const isCopyMode = ref(false);
	const contextVariablesList = ref([]);
	const expressionProcedureItem = ref({});
	const crumbs = [
		{ title: 'Expression procedure', path: 'expression-procedure' },
		{ title: 'New', path: 'new' }
	];
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

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const isDirty = computed(() => Object.values(formData.value).some((i) => i.isDirty));

	const isValid = computed(() => !Object.values(formData.value).some((i) => !i.isValid));

	const isFormValid = computed(() => {
		return !!(
			expressionProcedureItem.value.name?.length &&
			expressionProcedureItem.value.user_code?.length &&
			expressionProcedureItem.value.configuration_code?.length &&
			formData.value.user_code.isValid &&
			formData.value.configuration_code.isValid
		);
	});

	const isContextVariablesValid = computed(() =>
		!contextVariablesList.value.length || contextVariablesList.value.every(v => v.name?.startsWith('context_'))
	);

	const setEditorValueDebounced = debounce((editorId, value) => {
		const editor = ace.edit(editorId);
		if (editor) {
			editor.setValue(value);
		}
	}, 200);

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system` + newPath);
	};

	const addNewVariable = () => {
		const order = !contextVariablesList.value.length ? 0 : Math.max(...contextVariablesList.value.map(variable => variable.order)) + 1;
		contextVariablesList.value.push({
			name: '',
			notes: '',
			expression: '',
			order: order
		});
	};

	const removeVariable = (item) => {
		const index = contextVariablesList.value.indexOf(item);
		if (index !== -1) {
			contextVariablesList.value.splice(index, 1);
		}
	};

	const updateVariable = (item) => {
		const obj = contextVariablesList.value.find(obj => obj === item);
		if (obj) {
			Object.assign(obj, item);
		}
	};

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!expressionProcedureItem.value[field];
			}
		});
	}

	function updateField(field, value) {
		expressionProcedureItem.value[field] = value;
		!formData.value[field].isDirty &&
		(formData.value[field].isDirty = true);
		validateForm();
	}

	function closeItem() {
		if (isCopyMode.value) {
			router.push(`/${realmCode}/${spaceCode}/v/system/expression-procedure`);
		} else {
			router.back();
		}
		expressionProcedureItem.value = {};
		contextVariablesList.value = [];
		confirmButtonLoader.value = false;
		isContextVariablesValid.value = true;
	}

	async function createItem() {
		confirmButtonLoader.value = true;
		const editor = ace.edit('expressionEditor');
		expressionProcedureItem.value.code = editor.getValue();
		expressionProcedureItem.value.context_variables = contextVariablesList.value;
		const payload = {
			body: expressionProcedureItem.value
		};
		const res = await useApi('expressionProcedureList.post', payload);
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.error.message || res._$error.error.details });
		} else {
			useNotify({
				type: 'success',
				title: 'Execute is being processed'
			});
			if (isCopyMode.value) {
				router.push(`/${realmCode}/${spaceCode}/v/system/expression-procedure`);
			} else {
				router.back();
			}
		}
		confirmButtonLoader.value = false;
	}

	onMounted(() => {
		const data = JSON.parse(localStorage.getItem('copedExpressionProcedureData'));
		if (!data) {
			isCopyMode.value = false;
			return;
		}

		expressionProcedureItem.value = cloneDeep(data);
		contextVariablesList.value = cloneDeep(data.context_variables);
		setEditorValueDebounced('expressionEditor', cloneDeep(data.code));
		expressionProcedureItem.value.user_code += '_copy';
		localStorage.removeItem('copedExpressionProcedureData');
		isCopyMode.value = true;
	});
</script>

<style scoped lang="scss">
	.code-wrapper {
		position: relative;
		width: 100%;
		padding: 16px 12px;
		border-radius: 8px;
		border: 1px solid var(--outline-variant);
		margin-bottom: var(--spacing-16);
	}

	.context-variable-card {
		border-radius: var(--spacing-4);
		border: 1px solid var(--card-border-color);
		background: var(--card-background-color);
		padding: var(--spacing-4);
	}

	textarea {
		border-radius: var(--spacing-4);
		padding: var(--spacing-8);
		border: 1px solid var(--card-border-color);
	}
</style>
