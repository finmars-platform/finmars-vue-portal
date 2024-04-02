<template>
	<CommonSettingsLayout
		title="Add Access Policy"
		saveText="Create Access Policy"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-6">
				<BaseInput
					label="Name"
					v-model="form.name"
				/>
				<BaseInput
					label="User Code"
					v-model="form.user_code"
				/>

				<BaseInput
					label="Configuration Code"
					v-model="form.configuration_code"
				/>

				<BaseInput
					label="Description"
					v-model="form.description"
				/>

				<v-ace-editor
					v-model:value="policyJson"
					@init="editorInit"
					lang="json"
					theme="monokai"
					style="height: 300px;width: 600px;"/>


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
					<li><b>Resource</b>: The resource or resources to which the statement applies. The value can be a specific resource
						identifier or a wildcard * to represent all resources.
					</li>
				</ul>

				<h4>Action</h4>

				<p>An action represents a specific operation that can be performed on a resource. Actions are represented as
					strings in the format "service:resource:operation", such as "finmars:accounts:create" or "finmars:accounts:edit".</p>

				<h4>Example</h4>

				<p>The following AccessPolicy JSON allows the user to create and edit portfolios but denies the ability to delete
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
}</pre>

			</div>

			<h4>Resource Example</h4>

			<p>Following pattern to assign access to objects</p>
			<pre class="code-block">frn:[service]:[content_type]:[user_code]</pre>

			<p>Example:</p>
			<pre class="code-block">frn:poms:portfolios.portfolio:portfolio_1</pre>
			<pre class="code-block">frn:poms:accounts.account:bank_1</pre>

		</template>
	</CommonSettingsLayout>
</template>

<script setup>

import dayjs from 'dayjs'
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

definePageMeta({
	bread: [
		{
			text: 'Permissions: Access Policies',
			to: '/settings/permissions',
			disabled: false
		},
		{
			text: 'Add Access Policy',
			disabled: true
		},
	],
});
const store = useStore()
let route = useRoute()
let router = useRouter()

let form = reactive({
	name: '',
	user_code: '',
	configuration_code: 'com.finmars.local',
	policy: null
})

let policyJson = ref(JSON.stringify({
			"Version": "2023-01-01",
			"Statement": [
				{
					"Effect": "Allow",
					"Action": [],
					"Principal": "*",
					"Resource": "*"

				}
			]
		}
		, null, 4)
)

async function init() {

}

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14)
	editor.setBehavioursEnabled(true);

	editor.focus();
	editor.navigateFileStart();
}

async function save() {

	form.policy = JSON.parse(policyJson.value)

	let res = await useApi('accessPolicyList.post', {body: form})

	if (!res.error) {
		useNotify({type: 'success', title: 'Access Policy created!'})
		// TODO move to active tab Groups
		router.push('/settings/permissions')
	}
}

async function cancel() {
	router.push('/settings/permissions')
}

function fromatDate(date) {
	return dayjs(date).format('DD.MM.YYYY LT')
}

if (store.isUrlValid) {
	init()
} else {
	watch(() => store.current, async () => {
		init()
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
	border-top: 1px solid $border;
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

pre.code-block {
	background: #272822;
	color: #fff;
	padding: 8px;
}

</style>
