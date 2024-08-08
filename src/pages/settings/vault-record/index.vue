<template>
	<div class="container">
		<div class="vault-record-page">
			<div class="m-b-8">
				<h1 class="title">Vault Record</h1>
			</div>
			<FmCard class="m-b-8" v-for="vaultRecord of vaultRecords">

				<div class="flex_cb">
					<div>
						<span>{{vaultRecord.user_code}}</span>
					</div>
					<div>
						<FmBtn class="m-l-8 m-r-8" @click="editRecord(vaultRecord)">Edit</FmBtn>
						<FmBtn class="m-l-8 m-r-8" type="text" @click="openDeleteRecordModal(vaultRecord)">Delete</FmBtn>
					</div>
				</div>

			</FmCard>

			<div class="flex m-t-20">
				<FmBtn @click="createRecord()">Add Record</FmBtn>
			</div>
		</div>

		<BaseModal
			v-model="showModal"
			title="Create Vault Record"
			class="width-60"
		>
			<span v-if="!newRecord.user_code.length">Field is required</span>
			<BaseInput class="m-b-10" v-model="newRecord.user_code" label="User Code" />
			<span v-if="!newRecord.name.length">Field is required</span>
			<BaseInput class="m-b-10" v-model="newRecord.name" label="Name" />
			<div class="m-t-8 m-b-8">
				<span class="m-l-8" v-if="!newRecord.data.length">Field is required</span>
				<span class="m-l-8" v-if="errorValidateData">Data is invalid</span>
			</div>
			<v-ace-editor
				v-model:value="newRecord.data"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 100%; margin-bottom: 10px" />
			<template #controls>
				<div class="flex aic sb">
					<FmBtn type="text" @click="cancelBaseModal"> Cancel </FmBtn>

					<FmBtn :disabled="!validateNewRecord" @click="createNewRecord">Create</FmBtn>
				</div>
			</template>
		</BaseModal>
		<BaseModal
			v-model="showEditModal"
			title="Edit Vault Record"
		    class="width-60"
		>

			<div class="m-b-10 p-8">
				<span>user_code: {{editRecordObject.user_code}}</span>
			</div>
			<div>
				<span v-if="!editRecordObject.name.length">Field is required</span>
				<BaseInput class="m-b-10" v-model="editRecordObject.name" label="Name" />
			</div>
			<FmCard class="p-8 m-b-10" v-for="item in items">
				<div class="flex_cb">
					<div>
						<span>{{item.key}}</span>
					</div>
					<div class="right-container">
						<FmBtn @click="copy(item)" type="text" class="m-l-8 m-r-8">{{item.copied ? 'Copied' : 'Copy'}}</FmBtn>
						<FmBtn
							@click="item.showValue = !item.showValue"
							type="text"
							class="m-l-8 m-r-8"
						>
							{{item.showValue ? 'Hide' : 'Show'}}
						</FmBtn>
						<span>{{item.showValue ? item.originalValue : item.maskedValue}}</span>
					</div>
				</div>
			</FmCard>
			<div class="m-t-8 m-b-8">
				<span class="cursor-pointer" @click="showEditJson = !showEditJson">{{showEditJson ? 'Hide' : 'Show'}} JSON</span>
				<span class="m-l-8" v-if="!editRecordObject.data.length">Field is required</span>
				<span class="m-l-8" v-if="errorValidateData">Data is invalid</span>
			</div>
			<v-ace-editor
				v-if="showEditJson"
				v-model:value="editRecordObject.data"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 100%; margin-bottom: 10px" />
			<template #controls>
				<div class="flex aic sb">
					<FmBtn type="text" @click="cancelBaseModal"> Cancel </FmBtn>

					<FmBtn :disabled="!validateEditRecord" @click="updateRecord">Update</FmBtn>
				</div>
			</template>
		</BaseModal>
		<BaseModal v-model="openDeleteModal" title="Delete Vault Record"
				   :controls="{
                cancel: {name: 'Cancel', cb: cancelDeleteBaseModal},
                action: {name: 'Delete', cb: deleteRecord},
            }"
				   class="width-30"
		>
			<div class="m-b-16">Are you sure you want delete secret {{deleteRecordObject.user_code}}?</div>
		</BaseModal>
	</div>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Settings Vault Record',
				to: '/settings/vault-record',
			},
		],
	})

	let newRecord = reactive({
		name: '',
		user_code: '',
		data: '{}'
	});

	const editRecordObject = ref({});
	const deleteRecordObject = ref({});

	const status = ref({});
	const vaultRecords = ref([]);
	const items = ref([]);
	const showModal = ref(false);
	const showEditModal = ref(false);
	const showEditJson = ref(false);
	const openDeleteModal = ref(false);
	const userCode = ref('');

	const errorValidateData = ref(false);

	const validateEditRecord = computed(() => {
		return editRecordObject.value.name.length && editRecordObject.value.data.length;
	});

	const validateNewRecord = computed(() => {
		return newRecord.name.length && newRecord.data.length && newRecord.user_code.length;
	});

	const getRecords = async () => {
		const res = await useApi('vaultRecord.get');
		vaultRecords.value = res.results;
	}

	const createRecord = () => {
		showModal.value = true;
	}

	watch(
		() => editRecordObject.value.data,
		(newValue) => {
			try {
				JSON.stringify(JSON.parse(newValue));
				errorValidateData.value = false;
			} catch (error) {
				errorValidateData.value = true;
			}
		}
	);

	watch(
		() => newRecord.data,
		(newValue) => {
			try {
				JSON.stringify(JSON.parse(newValue));
				errorValidateData.value = false;
			} catch (error) {
				errorValidateData.value = true;
			}
		}
	);


	const updateRecord = async () => {
		if (!validateEditRecord.value) return;
		try {
			JSON.stringify(JSON.parse(editRecordObject.value.data));
			await useApi('vaultRecord.put', {
				params: { id: editRecordObject.value.id },
				body: {
					name: editRecordObject.value.name,
					data: editRecordObject.value.data,
					user_code: editRecordObject.value.user_code,
				},
			});
			await getRecords();
			showEditModal.value = false;
			items.value = [];
			errorValidateData.value = false;
		} catch (error) {
			errorValidateData.value = true;
		}
	};

	const createNewRecord = async () => {
		try {
			if (!validateNewRecord.value) return;
			JSON.stringify(JSON.parse(newRecord.data));
			await useApi('vaultRecord.post', {
				body: newRecord,
			});
			newRecord = {
				name: '',
				user_code: '',
				data: '{}'
			};
			await getRecords();
			showModal.value = false;
			items.value = [];
			errorValidateData.value = false;
		} catch (error) {
			errorValidateData.value = true;
		}
	}

	const editorInit = (editor) => {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);

		editor.focus();
		editor.navigateFileStart();
	}

	const editRecord = (vaultRecord) => {
		editRecordObject.value = vaultRecord;
		const recordObject = vaultRecord.data;
		for (const key in recordObject) {

			items.value.push({
				key,
				originalValue: recordObject[key],
				maskedValue: convertToAsterisks(recordObject[key]),
				showValue: false
			})
		}
		showEditModal.value = true;
	}

	const openDeleteRecordModal = async (vaultRecord) => {
		openDeleteModal.value = true;
		deleteRecordObject.value = vaultRecord;
	}

	const deleteRecord = async () => {
		await useApi('vaultRecord.delete', {
			params: { id: deleteRecordObject.value.id },
		});
		await getRecords();
		deleteRecordObject.value = {};
	}

	const cancelDeleteBaseModal = () => {
		deleteRecordObject.value = {};
	}

	const cancelBaseModal = () => {
		showEditModal.value = false;
		showModal.value = false;
		items.value = [];
		userCode.value = "";
		editRecordObject.value = {};
		newRecord.data = '{}';
	}

	const convertToAsterisks = (str) => {
		return '*'.repeat(str.length);
	}

	const copy = (item) => {
		navigator.clipboard.writeText(item.originalValue).then(() => {
			item.copied = true;
		})
		setTimeout(() => {
			item.copied = false;
		}, 3000);
	}

	onMounted(async () => {
		await getRecords();
	})
</script>

<style lang="scss" scoped>
	.title {
		margin-top: 5px;
		font-size: 20px
	}
	.container {
		padding: 30px;
	}

	.right-container {
		width: 36%;
	}
	.right-container span{
		display: inline-block;
		width: 140px;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		vertical-align: middle;
	}
</style>
