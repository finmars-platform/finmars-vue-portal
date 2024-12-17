<template>
	<div class="flex flex-column gap-6 px-6 py-6">
		<div class="text-lg">System Dashboard</div>

		<div class="card">
			<template v-if="masterUser">
				<div class="card-title">Space</div>
				<div class="table-wrapper">
					<div>
						<b>Full</b> - Finmars will track changes of all important objects.
					</div>
					<div>
						<b>Disabled</b> - Journal is disabled, changes will not be tracked.
					</div>
					<div class="max-w-80 py-4">
						<FmSelect
							v-model="masterUser.journal_status"
							:options="journalStatus"
							label="Journal Status"
						/>
					</div>
					<div>
						<b>Week</b> - Finmars will delete all journal records older then 1
						week.
					</div>
					<div>
						<b>Month</b> - Finmars will delete all journal records older then 30
						days.
					</div>
					<div>
						<b>Quarter</b> - Finmars will delete all journal records older then
						90 days.
					</div>
					<div class="max-w-80 py-4">
						<FmSelect
							v-model="masterUser.journal_storage_policy"
							:options="journalPolicy"
							label="Journal Policy"
						/>
					</div>
					<FmButton @click="saveMasterUser" rounded>
						Save Space Settings
					</FmButton>
				</div>
			</template>
			<div v-else class="w-full min-h-36 flex items-center justify-center">
				<FmProgressCircular :size="32" indeterminate />
			</div>
		</div>

		<template v-if="!fullLoading">
			<div class="card">
				<template v-if="tablesSizes">
					<div class="card-title">Database</div>
					<div class="table-wrapper">
						<table class="w-full">
							<thead class="text-left">
								<tr>
									<th><span class="mb-1">Table Name</span></th>
									<th><span class="mb-1">Size</span></th>
								</tr>
							</thead>
							<tbody class="text-left">
								<tr v-for="item in tablesSizes" :key="item">
									<td>{{ item.table_name }}</td>
									<td>{{ item.pg_size_pretty }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.vm">
					<div class="card-title">Machine</div>
					<div
						v-for="item in systemInfo.vm"
						:key="item"
						class="table-wrapper mb-4"
					>
						<div v-for="(value, key) in item" :key="key">
							<div v-if="isObject(value)">
								<div>
									<div v-for="subValue in value" :key="subValue">
										<strong>{{ subValue.name }} ({{ subValue.key }}):</strong>
										{{ subValue.value }}
									</div>
								</div>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.pip_freeze">
					<div class="card-title">Python Libraries</div>
					<div class="table-wrapper mb-4">
						<div>
							<strong>Python Version</strong> {{ systemInfo.python_version }}
						</div>
						<div class="mb-1">
							<strong>Django Version</strong> {{ systemInfo.django_version }}
						</div>
						<div
							v-for="(value, key) in systemInfo.pip_freeze"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.db_adapter">
					<div class="card-title">Database Adapter</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.db_adapter"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.storage_adapter">
					<div class="card-title">Storage</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.storage_adapter"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.vault_status">
					<div class="card-title">Vault Status</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.vault_status"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.rabbitmq_status">
					<div class="card-title">RabbitMQ Status</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.rabbitmq_status"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.workflow_status">
					<div class="card-title">Workflow Status</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.workflow_status"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.celery_status">
					<div class="card-title">Celery Status</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.celery_status"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemInfo?.redis_status">
					<div class="card-title">Redis Status</div>
					<div class="table-wrapper">
						<div
							v-for="(value, key) in systemInfo.redis_status"
							:key="key"
							class="mb-1"
						>
							<div v-if="isObject(value)">
								<strong>{{ key }}:</strong>
								<ul>
									<li v-for="(subValue, subKey) in value" :key="subKey">
										{{ subKey }}: {{ subValue }}
									</li>
								</ul>
							</div>
							<div v-else>
								<strong>{{ key }}:</strong> {{ value }}
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>

			<div class="card">
				<template v-if="systemLogs">
					<div class="card-title">Logs</div>
					<div class="table-wrapper">
						<div
							v-for="item in systemLogs"
							:key="item"
							class="flex justify-start items-center gap-3"
						>
							<div class="min-w-40">{{ item }}</div>
							<div>
								<FmButton
									type="secondary"
									@click="previewLog(item)"
									rounded
									:loading="loadingStates[item]"
								>
									Preview
								</FmButton>
								<FmButton type="secondary" @click="downloadLog(item)" rounded>
									Download
								</FmButton>
							</div>
						</div>
					</div>
				</template>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
			</div>
		</template>
		<div v-else class="w-full min-h-36 flex items-center justify-center">
			<FmProgressCircular :size="32" indeterminate />
		</div>

		<BaseModal
			title="File Preview"
			v-model="isModal"
			@update:model-value="() => cancel"
			style="width: 80vw"
		>
			<div class="flex relative w-full h-full pb-4">
				<div v-if="modalItem.data" class="overflow-y-auto w-full">
					{{ modalItem.data }}
				</div>
				<div v-else class="w-full min-h-36 flex items-center justify-center">
					<FmProgressCircular :size="32" indeterminate />
				</div>
				<div class="copy-wrap" @click="copy(modalItem.data)">
					<FmTooltip type="secondary">
						<template #activator="{ props }">
							<FmIcon
								v-bind="props"
								icon="mdi-content-copy"
								class="copy-icon"
								:size="20"
								color="var(--on-primary-container)"
							/>
						</template>
						<span>Copy to clipboard</span>
					</FmTooltip>
				</div>
			</div>
			<template #controls>
				<div class="flex-row fc-space-between">
					<FmBtn type="text" @click="downloadLog(modalItem.name)"
						>Download</FmBtn
					>
					<FmBtn @click="cancel">Ok</FmBtn>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup>
	import { downloadFile, isObject } from '~/pages/system/helper';
	import { FmButton, FmSelect, FmIcon, FmTooltip } from '@finmars/ui';

	const tablesSizes = ref(null);
	const isModal = ref(false);

	const masterUser = ref(null);
	const systemInfo = ref(null);
	const systemLogs = ref(null);
	const loadingStates = ref({});
	const fullLoading = ref(false);
	const modalItem = ref({ name: '', data: null });

	const journalStatus = ref([
		{
			title: 'Full',
			value: 'full'
		},
		{
			title: 'Disabled',
			value: 'disabled'
		}
	]);
	const journalPolicy = ref([
		{
			title: 'Week',
			value: 'week'
		},
		{
			title: 'Month',
			value: 'month'
		},
		{
			title: 'Quarter',
			value: 'quarter'
		}
	]);

	const getStats = async () => {
		try {
			const res = await useApi('systemInfo.get');
			if (res.results) {
				systemInfo.value = res.results;
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const getLogs = async () => {
		try {
			const res = await useApi('systemLogs.get');
			if (res.results) {
				systemLogs.value = res.results;
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const getTablesSize = async () => {
		try {
			const res = await useApi('tablesSize.get');
			if (res.results) {
				tablesSizes.value = res.results;
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const getMasterUser = async () => {
		try {
			const res = await useApi('masterUserInfo.get');
			if (res) {
				masterUser.value = res;
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const saveMasterUser = async () => {
		try {
			fullLoading.value = true;
			const res = await useApi('masterUserInfo.post', {
				body: masterUser.value
			});
			if (res.results) {
				useNotify({
					type: 'success',
					title: 'Space Updated !'
				});
				await getMasterUser();
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			fullLoading.value = false;
		}
	};

	const previewLog = async (fileName) => {
		try {
			loadingStates.value[fileName] = true;
			modalItem.value.name = fileName;
			const res = await useApi('viewLog.get', {
				filters: { log_file: fileName }
			});
			if (res instanceof Blob) {
				const reader = new FileReader();
				reader.onloadend = () => {
					modalItem.value.data = reader.result;
					loadingStates.value[fileName] = false;
				};
				reader.readAsText(res);
			} else {
				modalItem.value.data = res;
			}
			isModal.value = true;
			loadingStates.value[fileName] = false;
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const downloadLog = async (fileName) => {
		try {
			const blobType = 'plain/text';
			const blobData = await useApi('viewLog.get', {
				filters: { log_file: fileName }
			});
			downloadFile(blobData, blobType, fileName);
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	};

	const cancel = () => {
		isModal.value = false;
		loadingStates.value = {};
		modalItem.value = { name: '', data: null };
	};

	const copy = async (valueToCopy) => {
		await navigator.clipboard.writeText(valueToCopy);
		useNotify({
			type: 'success',
			title: 'Copied to clipboard'
		});
	};

	const init = () => {
		getStats();
		getLogs();
		getTablesSize();
		getMasterUser();
	};

	init();
</script>

<style lang="scss" scoped>
	.card {
		border-radius: var(--spacing-4);
		border: 1px solid var(--card-border-color);
		background: var(--card-background-color);
		padding: var(--spacing-12);
		.card-title {
			padding-bottom: var(--spacing-8);
			margin-bottom: var(--spacing-4);
			border-bottom: 1px solid var(--border-color);
		}
		.table-wrapper {
			max-height: 480px;
			overflow-y: auto;
		}
	}
	.copy-wrap {
		position: sticky;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		top: var(--spacing-4);
		right: var(--spacing-4);
		border-radius: var(--spacing-4);
		width: var(--spacing-32);
		height: var(--spacing-32);
		background: var(--secondary-container);
		.copy-icon {
			margin: var(--spacing-8);
		}
	}
</style>
