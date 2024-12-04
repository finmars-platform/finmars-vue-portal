<template>
	<form class="manage-configuration-form">
		<div class="m-16 p-16 card" v-if="!configurationId">
			<p>Configuration code pattern:</p>
			<span class="orange">com.[organization_name].[configuration_name]</span>
			<p>Examples:</p>
			<div class="pl-4">
				com.finmars.hnwi <span class="text">(good for packages)</span><br />
				com.finmars.asset-manager
				<span class="text">(good for packages)</span><br />

				com.finmars.hnwi-transaction-type
				<span class="text">(good for modules)</span><br />
				com.finmars.asset-manager-layout
				<span class="text">(good for modules)</span><br />
			</div>

			<p>
				Configuration code will be forcefully converted to lower case and
				special characters will be replaced with -
			</p>
		</div>

		<FmTextField
			outlined
			hide-details
			label="Configuration Code"
			placeholder="Enter configuration code"
			:disabled="!!configurationId"
			v-model="formState.configuration_code"
			class="input"
		/>
		<FmTextField
			outlined
			hide-details
			clearable
			label="Name"
			placeholder="Enter name"
			v-model="formState.name"
			class="input"
		/>
		<FmTextField
			outlined
			hide-details
			clearable
			label="Description"
			placeholder="Enter description"
			v-model="formState.description"
			class="input"
		/>
		<FmTextField
			outlined
			hide-details
			clearable
			label="Version"
			placeholder="Enter version"
			v-model="formState.version"
			class="input"
		/>
		<FmSelect
			v-model="formState.channel"
			:options="CHANNELS"
			variant="outlined"
			height="auto"
			label="Status"
			placeholder="Select statuses"
			persistent-placeholder
		/>
		<FmSelect
			v-model="formState.type"
			:options="TYPES"
			height="auto"
			variant="outlined"
			label="Status"
			placeholder="Select statuses"
			persistent-placeholder
		/>
		<div class="flex">
			<FmCheckbox
				v-bind="props"
				v-model="formState.is_primary"
				label="Is Primary"
			/>
			<FmTooltip>
				<template #activator="{ props }">
					<FmIcon class="ml-1" icon="mdi-information" v-bind="props" />
				</template>

				<span
					>User Fields or other entities will be take from Primary
					Configuration</span
				>
			</FmTooltip>
		</div>
		<div v-if="configurationId">
			<p>Manifest</p>
			{{ formState.manifest }}
			<VAceEditor
				v-model:value="formState.manifest"
				lang="json"
				theme="monokai"
				class="viewer"
				@init="onEditorInit"
			/>
		</div>

		<div class="m-16 p-16 card" v-if="!configurationId || is_package">
			<h3>Package Mode</h3>

			<div>
				<p>
					Package - special type on configuration that consist of other
					configurations together
				</p>

				<p>
					When you push your <b>Package Configuration</b> to marketplace. It
					scans <b>manifest.json</b>
					<span class="orange">dependencies</span> field and includes to result
					.zip file all configurations that you have in your
					<b>System Storage</b>
				</p>

				<FmCheckbox v-model="formState.is_package" label="Is Package" />
			</div>
		</div>

		<div class="m-16 p-16 card" v-if="configurationId">
			<h3>Dependencies</h3>

			<div>How to add Dependency</div>
			<div>
				1) in <b>manifest.json</b> find field
				<span class="orange">dependencies</span>
			</div>
			<div>2) Add dependency if following format:</div>
			<div>"com.[organzation_name].[configuration_name]": "[version]"</div>

			<div>Example:</div>
			<pre>
				{
					"configuration_code": "com.finmars.hnwi",
					"date": "2023-04-21",
					"dependencies": [
						{"configuration_code": "com.finmars.hnwi-transaction-type", version: "1.0.0"},
						{"configuration_code": "com.finmars.hnwi-layout", version: "1.0.0"}
					],
					"name": "HNWI Package",
					"version": "1.0.0"
				}
			</pre
			>
		</div>

		<div class="m-16 p-16 card" v-if="configurationId">
			<h3>Configuration Actions</h3>

			<div class="p-8">
				<p>
					This action will trigger <b>save</b> and export all configuration
					files to local Storage system. You can find your configuration files
					in the
					<NuxtLink
						:to="useGetNuxtLink(`/explorer`, $route.params)"
						target="_blank"
						>Explorer
					</NuxtLink>
				</p>

				<p>Destination path is:</p>
				<div>
					<b>
						configurations/{{ formState.configuration_code }}/{{
							formState.version
						}}/
					</b>
				</div>
				<FmButton
					@click="exportToStorage"
					rounded
					type="tertiary"
					class="button mt-4"
					>Export to Storage
				</FmButton>

				<FmTaskCard
					v-if="exportTaskId"
					:task-id="exportTaskId"
					@removeTaskId="exportTaskId = null"
					class="task-card"
				/>
			</div>

			<div
				class="p-8"
				v-if="formState.configuration_code !== defaultConfigurationCode"
			>
				<p>
					This action will trigger <b>save</b> and export current saved
					configuration (in System Storage) as zip to
					<b>Finmars Marketplace</b>
				</p>
				<p>Be aware of versions that you put there</p>
				<p><b>Finmars Marketplace</b> work only in append mode</p>
				<p>It means you cannot push multiple times the same version</p>
				<p>Each push should create new unique version</p>

				<div v-if="isShowLogin" class="my-4 p-16 card login">
					<h1 class="text-[20px] font-bold mb-6">Configuration Manager</h1>

					<FmTextField
						outlined
						hide-details
						clearable
						label="Username"
						placeholder="Enter Username"
						v-model="credential.username"
						class="input mb-4"
					/>
					<FmTextField
						outlined
						hide-details
						clearable
						label="Password"
						placeholder="Enter Password"
						v-model="credential.password"
						type="password"
						class="input mb-4"
					/>
					<div class="flex">
						<FmButton
							rounded
							type="secondary"
							class="button"
							@click="isShowLogin = false"
							>Cancel
						</FmButton>
						<FmButton rounded class="button ml-4" @click="pushConfiguration"
							>OK
						</FmButton>
					</div>
				</div>

				<template v-else>
					<FmTextField
						outlined
						:maxlength="100"
						hide-details
						clearable
						:label="`Changelog (optional) ${credential.changelog ? credential.changelog.length : 0} / 100)`"
						placeholder="Enter Changelog"
						v-model="credential.changelog"
						class="input mt-4"
					/>
					<span class="orange"
						>Warning. Before pushing new version, please, check if it was
						exported to your System Storage</span
					>

					<FmButton
						rounded
						type="tertiary"
						class="button my-4"
						@click="isShowLogin = true"
						>Push Configuration to Marketplace
					</FmButton>

					<FmTaskCard
						v-if="pushTaskId"
						:task-id="pushTaskId"
						@removeTaskId="pushTaskId = null"
						class="task-card"
					/>
				</template>

				<p>
					You can find status of your push in the
					<NuxtLink
						:to="useGetNuxtLink(`/system/task/`, $route.params)"
						target="_blank"
						>Tasks
					</NuxtLink>
					page
				</p>
				<p>
					If everything is good, your configuration will appear on
					<NuxtLink
						:to="useGetNuxtLink(`/marketplace`, $route.params)"
						target="_blank"
						>Marketplace
					</NuxtLink>
				</p>

				<div>
					<p>Configuration Sources and folders:</p>
					<p>
						* If you install Configuration via unknown .zip file it will placed
						to /configurations/custom/{configuration_code}
					</p>
					<p>
						* If you install Configuration via Finmars Marketplace it will
						placed to /configuration/{configuration_code}
					</p>

					<p>
						<b>Important!</b> So when you try to push new version to Markeplace
						priority will go to /configuration/{configuration_code}
					</p>

					<p>
						After you <b>installed configuration</b> and has right to modify it
						each new Configuration Export will be place to
						/configuration/{configuration_code}
					</p>
				</div>
			</div>
		</div>

		<div class="footer">
			<div class="flex justify-end">
				<FmButton
					v-if="
						configurationId &&
						formState.configuration_code !== defaultConfigurationCode
					"
					@click="deleteConfiguration"
					type="secondary"
					class="button mr-auto"
					>Delete
				</FmButton>
				<FmButton
					type="secondary"
					v-if="configurationId"
					@click="editAsJson"
					class="button mr-2"
					>Edit as JSON
				</FmButton>
				<FmButton
					v-if="configurationId"
					@click="makeCopy"
					type="secondary"
					:disabled="processing"
					class="button mr-2"
					:class="{ 'disabled-btn': processing }"
					>Make a copy
				</FmButton>
				<FmButton type="secondary" @click="cancel" class="button mr-2"
					>Cancel
				</FmButton>
				<FmButton
					@click="agree"
					class="button"
					:class="{ 'disabled-btn': processing }"
				>
					<span v-if="configurationId">Update</span>
					<span v-else>Create</span>
				</FmButton>
			</div>
		</div>

		<BaseModal
			v-model="showModal"
			title="JSON Editor - Configuration"
			class="width-80"
		>
			<VAceEditor
				v-model:value="asJson"
				lang="json"
				theme="monokai"
				class="viewer"
				@init="onEditorInit"
			/>

			<template #controls>
				<div class="flex justify-end">
					<FmButton
						@click="showModal = false"
						type="secondary"
						class="button mr-auto"
						>Close
					</FmButton>
					<FmButton
						@click="convertToExport"
						type="secondary"
						class="button mr-2"
						>Convert to Export
					</FmButton>
					<FmButton type="secondary" @click="downloadAsJson" class="button mr-2"
						>Download
					</FmButton>
					<FmButton @click="save" class="button"> Save</FmButton>
				</div>
			</template>
		</BaseModal>
	</form>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta';
	import {
		FmButton,
		FmSelect,
		FmTextField,
		FmTooltip,
		FmIcon
	} from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import { downloadFile } from '~/pages/explorer/helper';

	const route = useRoute();
	const router = useRouter();
	const store = useStore();
	const { VAceEditor, onEditorInit } = useAceEditor();

	const CHANNELS = [
		{
			value: 'stable',
			altValue: 'stable',
			title: 'Stable'
		},
		{
			value: 'rc',
			altValue: 'rc',
			title: 'Release Candidate'
		}
	];

	const TYPES = [
		{
			value: 'general',
			altValue: 'general',
			title: 'General'
		},
		{
			value: 'ui',
			altValue: 'ui',
			title: 'UI'
		},
		{
			value: 'pricing',
			altValue: 'pricing',
			title: 'Pricing'
		},
		{
			value: 'workflow',
			altValue: 'workflow',
			title: 'Workflow'
		},
		{
			value: 'app',
			altValue: 'app',
			title: 'App'
		}
	];

	const props = defineProps({
		configurationId: Number,
		configuration_code: String,
		name: String,
		description: String,
		version: String,
		channel: String,
		type: String,
		is_primary: Boolean,
		is_package: Boolean,
		manifest: Object,
		user_code: String,
		is_from_marketplace: Boolean,
		short_name: String
	});

	const formState = reactive({
		configuration_code: props.configuration_code || '',
		name: props.name || '',
		description: props.description || '',
		version: props.version || '',
		channel: props.channel || CHANNELS[0].value,
		type: props.type || TYPES[0].value,
		is_primary: props.is_primary || false,
		is_package: props.is_package || false,
		is_from_marketplace: props.is_from_marketplace || false,
		manifest: wrapperStringify(props.manifest),
		short_name: props.short_name || null
	});

	const credential = reactive({
		username: '',
		password: '',
		changelog: ''
	});

	const processing = ref(false);
	const isShowLogin = ref(false);
	const showModal = ref(false);
	const asJson = ref(null);

	const defaultConfigurationCode = computed(
		() => 'local.poms.' + store.user?.base_api_url
	);

	const pushTaskId = ref(null);
	const exportTaskId = ref(null);

	function cancel() {
		goToList();
	}

	function wrapperStringify(obj) {
		try {
			return JSON.stringify(obj || {}, null, 4);
		} catch (e) {
			console.warn(e, 'Json has problem');
			return '';
		}
	}

	async function makeCopy() {
		await create(true);
	}

	async function create(isCopy) {
		try {
			await useApi('setConfiguration.post', {
				body: Object.assign({}, formState, {
					manifest: props.configurationId
						? JSON.parse(formState.manifest)
						: {
								name: formState.name,
								configuration_code: formState.configuration_code,
								version: formState.version,
								description: formState.description,
								date: new Date().toJSON().slice(0, 10),
								dependencies: []
							}
				})
			});

			useNotify({
				type: 'success',
				title: `Configuration ${props.user_code} was successfully ${isCopy ? 'copied' : 'created'}`
			});

			await goToList();
		} catch (e) {
			console.warn('AGREE ERROR. ', e);
		} finally {
			processing.value = false;
		}
	}

	async function agree() {
		processing.value = true;

		if (props.configurationId) {
			try {
				await useApi('setConfiguration.put', {
					params: { id: props.configurationId },
					body: Object.assign({}, formState, {
						manifest: JSON.parse(formState.manifest)
					})
				});

				useNotify({
					type: 'success',
					title: `Configuration ${props.user_code} was successfully saved`
				});

				await goToList();
			} catch (e) {
				console.warn('AGREE ERROR. ', e);
			} finally {
				processing.value = false;
			}
		} else {
			await create();
		}
	}

	async function exportToStorage() {
		const isConfirm = await useConfirm({
			title: 'Warning',
			text: `It will overwrite your existing exported configuration.`
		});

		if (!isConfirm) return false;

		try {
			const response = await useApi('exportConfiguration.get', {
				params: { id: props.configurationId }
			});

			exportTaskId.value = response.task_id;

			useNotify({
				type: 'success',
				title: `Configuration exported successfully`
			});
		} catch (e) {
			console.warn('export Configuration LOADING ERROR. ', e);
		}
	}

	async function deleteConfiguration() {
		const isConfirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure that you want to delete configuration ${props.user_code}? It will affect whole system. Be careful!`
		});

		if (!isConfirm) return false;

		try {
			await useApi('setConfiguration.delete', {
				params: { id: props.configurationId }
			});

			useNotify({
				type: 'success',
				title: `Configuration deleted successfully`
			});

			await goToList();
		} catch (e) {
			console.warn('export Configuration LOADING ERROR. ', e);
		}
	}

	async function goToList() {
		await router.push(
			useGetNuxtLink('/configuration/manage-configuration', route.params)
		);
	}

	async function pushConfiguration() {
		try {
			const response = await useApi('pushConfigurationToMarketplace.put', {
				params: { id: props.configurationId },
				body: {
					username: credential.username,
					password: credential.password,
					changelog: credential.changelog
				}
			});

			pushTaskId.value = response.task_id;

			credential.username = '';
			credential.password = '';
			credential.changelog = '';
			isShowLogin.value = false;

			useNotify({
				type: 'success',
				title: `Configuration pushed successfully`
			});
		} catch (e) {
			console.warn('push Configuration LOADING ERROR. ', e);
		} finally {
			processing.value = false;
		}
	}

	function editAsJson() {
		asJson.value = wrapperStringify(
			Object.assign({}, formState, {
				manifest: JSON.parse(formState.manifest),
				id: props.configurationId
			})
		);
		showModal.value = true;
	}

	function downloadAsJson() {
		const name = formState.name;

		try {
			downloadFile(asJson.value, 'application/json', name);
		} catch (e) {
			console.warn(e, 'JSON has problem');
		}
	}

	function recursiveConvert(obj) {
		Object.keys(obj).forEach(function (key) {
			if (key === 'id') {
				delete obj.id;
			}

			if (key.indexOf('___') !== -1) {
				delete obj[key];
			}

			if (key === 'deleted_user_code') {
				delete obj.deleted_user_code;
			}

			if (key === 'procedure_modified_datetime') {
				delete obj['procedure_modified_datetime'];
			}

			if (key === 'created_at') {
				delete obj.created_at;
			}

			if (key === 'modified_at') {
				delete obj.modified_at;
			}

			if (key === 'is_deleted') {
				delete obj.is_deleted;
			}

			if (obj.hasOwnProperty(key + '_object')) {
				if (obj[key + '_object']) {
					obj[key] = obj[key + '_object']['user_code'];
					delete obj[key + '_object'];
				}
			}

			if (key === 'pricing_policies') {
				delete obj.pricing_policies;
			}
			if (key === 'registers') {
				delete obj.registers;
			}

			if (key === 'attributes') {
				obj.attributes = obj.attributes.map(function (attribute) {
					attribute.attribute_type = attribute.attribute_type_object.user_code;
					delete attribute.attribute_type_object;

					if (attribute.classifier_object) {
						attribute.classifier = attribute.classifier_object.name;
						delete attribute.classifier_object;
					}

					return attribute;
				});
			}

			if (key === 'accrual_calculation_schedules') {
				obj.accrual_calculation_schedules =
					obj.accrual_calculation_schedules.map(function (item) {
						delete item['id'];
						item['accrual_calculation_model'] =
							item['accrual_calculation_model_object']['user_code'];
						delete item['accrual_calculation_model_object'];

						item['periodicity'] = item['periodicity_object']['user_code'];
						delete item['periodicity_object'];

						return item;
					});
			}
		});

		return obj;
	}

	function convertToExport() {
		const converted = recursiveConvert(
			Object.assign({}, formState, {
				manifest: JSON.parse(formState.manifest),
				id: props.configurationId
			})
		);

		asJson.value = wrapperStringify(converted);

		useNotify({ title: 'Converted', type: 'success' });
	}

	async function save() {
		processing.value = true;

		try {
			if (props.configurationId) {
				try {
					await useApi('setConfiguration.put', {
						params: { id: props.configurationId },
						body: JSON.parse(asJson.value)
					});

					useNotify({
						type: 'success',
						title: `Configuration ${props.user_code} was successfully saved`
					});

					await goToList();
				} catch (e) {
					console.warn('SAVE ERROR. ', e);
				} finally {
					processing.value = false;
				}
			} else {
				await create();
			}
		} catch (error) {
			processing.value = false;
		}
	}
</script>

<style scoped lang="scss">
	.manage-configuration-form {
		max-width: 1024px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		font-size: 16px;
	}

	.orange {
		background: orange;
	}

	.card {
		border: 1px solid #ddd;
	}

	.viewer {
		position: relative;
		width: 100%;
		height: 300px;
		border-radius: 4px;
	}

	.task-card {
		position: relative;
	}

	.text {
		font-size: 10px;
	}
</style>
