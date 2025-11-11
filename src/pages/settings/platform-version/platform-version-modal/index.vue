<template>
	<BaseModal :title="title" class="w-3/5">
		<div class="flex flex-col gap-2 pb-2">
			<FmTextField
				v-model="currentItem.user_code"
				:rules="[rules.required]"
				label="User Code"
			/>

			<FmTextField
				v-model="currentItem.name"
				:rules="[rules.required]"
				label="Name"
			/>
			<FmTextField v-model="currentItem.short_name" label="Short Name" />
			<FmTextField
				v-model="currentItem.public_name"
				label="Public Name"
			/>
			<div class="flex flex-col mb-2">
				<span class="mb-1">Notes</span>
				<textarea
					id="notes"
					name="notes"
					rows="6"
					cols="50"
					v-model="currentItem.notes"
				/>
			</div>
			<v-ace-editor
				v-model:value="stringData"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px; width: 100%; margin-bottom: 10px"
			/>
		</div>
		<template #controls>
			<div class="flex aic sb">
				<FmButton type="secondary" @click="closeModal">
					Cancel
				</FmButton>
				<FmButton
					type="primary"
					@click="confirmModal"
					:disabled="validateForm"
					rounded
				>
					{{ modalType === 'create' ? 'Create' : 'Save' }}
				</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { FmButton, FmTextField } from '@finmars/ui';
	import { VAceEditor } from 'vue3-ace-editor';

	let stringData = ref('');

	const props = defineProps({
		item: {
			type: Object,
			required: true
		},
		title: { type: String, default: 'Create Platform Version' },
		modalType: {
			type: String,
			default: 'create'
		},
		portfoliosOptions: {
			type: Array,
			default() {
				return [];
			}
		}
	});

	const emit = defineEmits(['edit', 'create', 'close']);
	const clientSecrets = ref([]);
	const currentItem = ref({});

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const confirmModal = () => {
		currentItem.value.version_details = JSON.parse(stringData.value);

		emit(`${props.modalType}`, currentItem.value);
	};

	const closeModal = () => {
		emit('close');
	};

	const validateForm = computed(() => {
		const isCurrentItemInvalid =
			!currentItem.value.name || !currentItem.value.user_code;

		return isCurrentItemInvalid;
	});

	const editorInit = (editor) => {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);

		editor.focus();
		editor.navigateFileStart();
	};

	function init() {
		currentItem.value = props?.item;

		stringData.value = JSON.stringify(
			currentItem.value.version_details,
			null,
			2
		);
	}

	init();
</script>

<style scoped lang="scss">
	textarea {
		border-radius: var(--spacing-4);
		border: 1px solid var(--table-border-color);
		padding: 2px;
	}

	input {
		border: 1px solid var(--table-border-color);
		padding: 2px;
	}

	table {
		height: 100%;
		width: 100%;
		border-collapse: collapse;
		text-align: left;

		th,
		td {
			border: 1px solid var(--table-border-color);
			padding: 6px;
			text-align: left;
		}

		th:not(#header_id) {
			font-size: 14px;
			background-color: var(--activeState-backgroundColor);
		}

		td {
			font-size: 12px;
		}

		tr {
			border: 1px solid var(--table-border-color);
		}
	}
</style>
