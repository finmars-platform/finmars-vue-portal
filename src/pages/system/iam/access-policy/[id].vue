<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<CommonSettingsLayout
			title="Update Access Policy"
			@save="save"
			@cancel="cancel"
		>
			<template #left>
				<FmCard title="General" v-if="accessPolicy.id" class="flex flex-col gap-3 mb-6">
					<FmTextField
						v-model="accessPolicy.name"
						label="Name"
						outlined
					/>
					<FmTextField
						label="User Code"
						v-model="accessPolicy.user_code"
						disabled
						outlined
					/>
					<FmTextField
						label="Configuration Code"
						v-model="accessPolicy.configuration_code"
						disabled
						outlined
					/>
					<FmTextField
						label="Description"
						v-model="accessPolicy.description"
						outlined
					/>
					<div :class="!isJsonValid ? 'invalid-json' : ''">
						<v-ace-editor
							v-model:value="policyJson"
							@init="editorInit"
							lang="json"
							theme="monokai"
							style="height: 300px"
						/>
					</div>
					<p v-if="!isJsonValid" class="text-red-500 text-sm mt-2">Invalid JSON format. Please check.</p>
				</FmCard>
			</template>

			<template #right>

				<div class="finmars-documentation-block">

					<h4>Access Policy</h4>

					<p>
						An AccessPolicy JSON is used to define the permissions a user, role, or group has within a system. The JSON
						object consists of a version number, and an array of statements, each describing a set of permissions.
					</p>

					<h4>AccessPolicy JSON Structure</h4>

					<p>
					<pre class="code-block">{
					  "Version": "2021-01-01",
					  "Statement": [
						{
						  "Effect": "Allow",
						  "Action": [
							"service:resource:create",
							"service:resource:edit"
						  ],
						  "Resource": "*"
						},
						{
						  "Effect": "Deny",
						  "Action": "service:resource:delete",
						  "Resource": "*"
						}
					  ]
					}
					</pre>
					</p>

					<h4>Version</h4>
					<p>The Version field represents the date when the policy format was defined. It is a string in the format
						"YYYY-MM-DD".</p>

					<h4>Statement</h4>
					<p>The Statement field is an array of objects, where each object represents a set of permissions. Each statement
						object contains the following fields:</p>

					<ul>
						<li><b>Effect</b>: The effect of the statement, either "Allow" or "Deny".</li>
						<li><b>Action</b>: A single action or an array of actions that the statement applies to. <b>Action String is case insensitive. Policy Engine forces it to lowercase when permission evaluated</b></li>
						<li><b>Resource</b>: The resource or resources to which the statement applies. The value can be a specific
							resource
							identifier or a wildcard * to represent all resources.
						</li>
					</ul>

					<h4>Action</h4>

					<p>An action represents a specific operation that can be performed on a resource. Actions are represented as
						strings in the format "service:resource:operation", such as "finmars:accounts:create" or "finmars:accounts:edit".</p>

					<h4>Example</h4>

					<p>The following AccessPolicy JSON allows the user to create and edit portfolios but denies the ability to
						delete
						portfolios:</p>

					<pre class="code-block">{
				  "Version": "2021-01-01",
				  "Statement": [
					{
					  "Effect": "Allow",
					  "Action": [
						"finmars:portfolio:create",
						"finmars:portfolio:edit"
					  ],
					  "Resource": "*"
					},
					{
					  "Effect": "Deny",
					  "Action": "finmars:portfolio:delete",
					  "Resource": "*"
					}
				  ]
				}
				</pre>
					<h4>Resource Example</h4>

					<p>Following pattern to assign access to objects</p>
					<pre class="code-block">frn:[service]:[content_type]:[user_code]</pre>

					<p>Example:</p>
					<pre class="code-block">frn:finmars:portfolios.portfolio:portfolio_1</pre>
					<pre class="code-block">frn:finmars:accounts.account:bank_1</pre>

					<h4>Allow Full Access only to one portfolio</h4>

					<pre class="code-block">{
				  "Version": "2021-01-01",
				  "Statement": [
					{
					  "Effect": "Allow",
					  "Action": [
						"finmars:portfolio:*"
					  ],
					  "Resource": ["frn:finmars:portfolios.portfolio:portfolio_1"]
					},

				  ]
				}</pre>

				</div>

			</template>

		</CommonSettingsLayout>
	</div>
</template>

<script setup>
	import { getRealmSpaceCodes } from '~/pages/system/helper'
	import {VAceEditor} from 'vue3-ace-editor';
	import 'ace-builds/src-noconflict/mode-json';
	import 'ace-builds/src-noconflict/ext-searchbox';
	import 'ace-builds/src-noconflict/theme-monokai';
	import { FmBreadcrumbs, FmTextField } from '@finmars/ui'

	const store = useStore()
	const route = useRoute()
	const router = useRouter()

	const accessPolicy = ref({})
	const policyJson = ref({})

	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = ref([
		{ title: 'Access Policy', path: 'access-policy' },
		{ title: 'Update', path: '' }
	]);

	const isJsonValid = computed(() => {
		try {
			JSON.parse(policyJson.value);
			return true;
		} catch (e) {
			return false;
		}
	});

	async function init() {
		try {
			accessPolicy.value = await useApi('accessPolicy.get', {params: {id: route.params.id}})
			policyJson.value = JSON.stringify(accessPolicy.value.policy, null, 2)
		} catch (e) {
			useNotify({ type: 'error', title: e.message});
		}

	}

	async function save() {
		if (!isJsonValid.value) {
			useNotify({ type: 'error', title: 'Invalid JSON format'});
			return;
		}

		accessPolicy.value.policy = JSON.parse(policyJson.value)

		const res = await useApi('accessPolicy.put', {body: accessPolicy.value, params: {id: route.params.id}})

		if (res) {
			useNotify({type: 'success', title: 'Saved!'});
			router.back();
		}
	}

	async function cancel() {
		router.back();
	}

	function editorInit(editor) {
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true);

		editor.focus();
		editor.navigateFileStart();
	}

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system/iam` + newPath);
	};

	if (store.isUrlValid) {
		init()
	} else {
		watch(() => store.current, async () => {
			await init()
		})
	}
</script>

<style lang="scss" scoped>
	.coll {
		width: 48%;
	}

	.control_line {
		width: calc(100% - 160px);
		position: fixed;
		left: 160px;
		bottom: 0;
		border-top: 1px solid var(--table-border-color);
	}

	.finmars-documentation-block {

		h4 {
			margin: 20px 0 10px 0;
			font-size: 16px;
			font-weight: bold;
		}

		p {
			margin: 10px 0;
		}

		ul {
			padding-left: 40px;
			list-style: disc;
		}

		li {
			margin: 10px 0;
			list-style: disc;
		}

	}

	.invalid-json{
		border: 2px solid var(--error-color);
	}

	pre.code-block {
		background: #272822;
		color: #fff;
		padding: 8px;
	}
</style>
