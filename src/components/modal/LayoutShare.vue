<template>
	<BaseModal title="Share Layout"
						 v-model="modelValue"
						 @update:modelValue="newVal => emit('update:modelValue', newVal)">

		<div class="p-b-16">

			<div v-show="readyStatus">

				<h4>Share Layout</h4>

				<div>
					<FmInputText label="Name" v-model="globalConfigFile.name" />
				</div>

				<div>
					<FmSelect label="Publicity Type"
										:items="publicityTypeOpts"
										v-model="globalConfigFile.publicity_type" />
				</div>

				<div class="m-t-16">

					<div>
						<label for="shareGlobalConfigNotes">Notes</label>
					</div>
					<div>
					<textarea name=""
										v-model="globalConfigFile.notes"
										id="shareGlobalConfigNotes"
										cols="60"
										rows="5"></textarea>
					</div>

				</div>

				<div v-if="globalConfigFile.publicity_type === 2"
						 class="m-t-16">

					<h4>Share Invites to Members</h4>

					<BaseMultiSelectTwoAreas v-model="assignedMembersList"
																	 :items="membersList"
																	 item_id="id"
																	 item_title="username"
																	 @update:modelValue="newValue => assignedMembersList = newValue" />

				</div>

				<div class="m-t-16">

					<div>
						<label for="shareMessageToMember">Message to members</label>
					</div>
					<div>
						<textarea name=""
											v-model="inviteNotes"
											id="shareMessageToMember"
											cols="60"
											rows="5"></textarea>
					</div>

				</div>

			</div>

			<div v-if="!readyStatus" class="flex-row fc-center">
				<FmLoader />
			</div>

		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel">CLOSE</FmBtn>

				<div>

					<FmBtn v-if="!globalConfigFile.id"
								 type="basic"
								 class="m-r-20"
								 @click="pushLayout"

					>{{ globalConfigFile.id ? 'SHARE' : 'PUBLISH UPDATE' }}</FmBtn>

					<FmBtn v-if="globalConfigFile.id" type="basic" @click="pushLayout(true)">FORCE PUBLISH UPDATE</FmBtn>

				</div>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import {useLogResponseError} from "../../composables/useMeta";

	const layoutStore = useLayoutsStore();

	let props = defineProps({
		modelValue: Boolean,
		layout: Object,
		/** @values ui.dashboardlayout, ui.listlayout, ui.reportlayout **/
		layoutType: String,
	});

	let emit = defineEmits(['update:modelValue', 'updateLayouts'])

	let membersReady = ref(false);
	let configFileReady = ref(false);

	let layout = null;
	let globalConfigFile = ref({});

	let publicityTypeOpts = ref([
		{id: 1, name: 'Public'},
		{id: 2, name: 'Ecosystem Only'},
	]);

	let membersList = ref([]);
	let assignedMembersList = ref([]);
	let inviteNotes = ref('');

	let readyStatus = computed(() => membersReady.value && configFileReady.value);

	async function getMembersList() {

		membersReady.value = false;

		const res = await useApi('memberList.get');

		if (res.error) {
			useLogResponseError(res);

		} else {
			membersList.value = res.results;
			membersReady.value = true;
		}

	}

	async function getGlobalConfigurationFile() {

		if (layout.origin_for_global_layout) {

			const opts = {
				params: {
					id: layout.origin_for_global_layout
				}
			};

			const res = await useApi('configSharingConfigFile.get', opts);

			if (!res.error) {
				globalConfigFile.value = res;
				configFileReady.value = true;
			}


		}
		else {

			globalConfigFile.value.name = layout.name;
			configFileReady.value = true;

		}

	}

	watch(
		() => props.modelValue,
		() => {

			if (props.modelValue && props.layout) {

				layout = JSON.parse(JSON.stringify(props.layout));

				getGlobalConfigurationFile();
				getMembersList();

			}

		}
	)

	/* TODO: rework this functions for DashboardLayoutsManager.vue

	vm.getAllReportLayouts = function () {

		return new Promise(function (resolve, reject) {

			var promises = [];

			promises.push(uiService.getListLayout(
				null,
				{
					pageSize: 1000,
					filters: {
						content_type: 'reports.balancereport'
					}
				}
			));

			promises.push(uiService.getListLayout(
				null,
				{
					pageSize: 1000,
					filters: {
						content_type: 'reports.plreport'
					}
				}
			));

			promises.push(uiService.getListLayout(
				null,
				{
					pageSize: 1000,
					filters: {
						content_type: 'reports.transactionreport'
					}
				}
			));

			Promise.all(promises).then(function (data) {

				console.log('data', data);

				var result = [];

				data.forEach(function (dataItem) {
					dataItem.results.forEach(function (layout) {
						result.push(layout)
					})
				});

				console.log('result', result);

				resolve(result)

			})

		})

	};

	vm.getReportLayoutsFromDashboardLayout = function (dashboardLayout) {

		return new Promise(function (resolve, reject) {

			vm.getAllReportLayouts().then(function (data) {

				var layouts = data;

				var result = [];
				var addedLayouts = {};


				dashboardLayout.data.components_types.forEach(function (component) {


					if (['report_viewer', 'report_viewer_matrix',
						'report_viewer_split_panel', 'report_viewer_bars_chart'].indexOf(component.type) !== -1) {


						layouts.forEach(function (layout) {


							if (component.settings.layout_name === layout.name && component.settings.content_type === layout.content_type) {

								delete layout.id;
								delete layout.is_default;
								delete layout.is_active;

								if (!addedLayouts.hasOwnProperty(layout.content_type)) {
									addedLayouts[layout.content_type] = [];
								}

								if (addedLayouts[layout.content_type].indexOf(layout.name) === -1) {

									addedLayouts[layout.content_type].push(layout.name);

									result.push(layout);

								}
							}


						})
					}


				});


				resolve(result);

			});

		})

	};*/

	async function createConfigFile() {

		let configuration;

		const date = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

		let layoutCopy = useRecursiveDeepCopy(layout);

		delete layoutCopy.origin_for_global_layout;
		delete layoutCopy.sourced_from_global_layout;

		if (props.layoutType === 'ui.dashboardlayout') {

			/* vm.getReportLayoutsFromDashboardLayout(layoutCopy).then(function (data) {

				var reportLayouts = data;

				configuration = {
					"head": {
						"date": date
					},
					"body": [
						{
							"section_name": "configuration",
							"items": [
								{
									"entity": props.layoutType,
									"content": [
										layoutCopy
									],
									"count": 1
								},
								{
									"entity": "ui.reportlayout",
									"content": reportLayouts,
									"count": reportLayouts.length
								}
							]
						}
					]
				};

				resolve(configuration)

			}) */

		}
		else {

			configuration = {
				"head": {
					"date": date
				},
				"body": [
					{
						"section_name": "configuration",
						"items": [
							{
								"entity": props.layoutType,
								"content": [
									layoutCopy
								],
								"count": 1
							}
						]
					}
				]
			};

		}

		return configuration;

	}

	async function createOrUpdateGlobalConfigFile(forcePush) {

		let res;
		let opts = {
			body: globalConfigFile.value
		}

		if (globalConfigFile.value.id) {

			opts.params = {id: globalConfigFile.value.id};
			opts.filters = {force: forcePush};

			res = await useApi('configSharingConfigFile.put', opts);

		} else {
			res = await useApi('configSharingConfigFile.post', opts);
		}

		if (res.error) {
			return useLogResponseError(res);
		}

		layout.origin_for_global_layout = res.id;
		layout.sourced_from_global_layout = res.id;

		return res;

	}

	async function updateLayout(id, item) {

		let res;

		if (props.layoutType === 'dashboard') {

			/* Save dashboard layout
			uiService.updateDashboardLayout(item.id, item).then(function (data) {

				resolve(data)

			})*/

		} else {
			res = await layoutStore.updateLayout(item.id, item);
		}

		if (res.error) {
			return useLogResponseError(res);
		}

		return res;

	}

	async function sendInvite(member) {

		const opts = {
			body: {
				shared_configuration_file: globalConfigFile.value.id,
				notes: inviteNotes,
				member_to: member.id,
			}
		}

		const res = useApi('configSharingInvite.pust', opts);

		if (res.error) {
			return useLogResponseError(res);
		}

		return res;

	}

	async function pushLayout(forcePush) {

		const res1 = await createConfigFile();

		if (res1.error) {
			return;
		}

		globalConfigFile.value.data = res1;

		const res2 = await createOrUpdateGlobalConfigFile(forcePush);

		if (res2.error) {
			return;
		}

		const res3 = await updateLayout(layout.id, layout);

		if (res3.error) {
			return;
		}

		globalConfigFile.value = res2;
		layout = res3;

		const promises = assignedMembersList.value.map( member => sendInvite(member) );

		await Promise.allSettled(promises);

		emit('update:modelValue', false);
		emit('updateLayouts');

	}

</script>

<style lang="scss" scoped>

</style>
