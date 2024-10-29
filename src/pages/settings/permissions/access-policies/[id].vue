<template>
	<CommonSettingsLayout
		title="Update Access Policy"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" v-if="accessPolicy.id">
				<BaseInput
					label="Name"
					v-model="accessPolicy.name"
				/>
				<BaseInput
					label="User Code"
					v-model="accessPolicy.user_code"
					disabled
				/>

				<BaseInput
					label="Configuration Code"
					v-model="accessPolicy.configuration_code"
					disabled
				/>

				<BaseInput
					label="Description"
					v-model="accessPolicy.description"
				/>

				<v-ace-editor
					v-model:value="policyJson"
					@init="editorInit"
					lang="json"
					theme="monokai"
					style="height: 300px;"/>
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
}</pre>
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
</template>

<script setup>

import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

import dayjs from 'dayjs'
import {usePrefixedRouterPush} from "~/composables/useMeta";

definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Permissions: Access Policies',
			to: '/settings/permissions',
			disabled: false
		},
		{
			text: 'Update Access Policy',
			disabled: true
		},
	],
});
const store = useStore()
let route = useRoute()
let router = useRouter()

let accessPolicy = ref({})
let policyJson = ref({})


async function init() {
	let res = await useApi('accessPolicy.get', {params: {id: route.params.id}})
	accessPolicy.value = res

	policyJson.value = JSON.stringify(accessPolicy.value.policy, null, 2)

}


async function save() {

	accessPolicy.value.policy = JSON.parse(policyJson.value)

	let res = await useApi('accessPolicy.put', {body: accessPolicy.value, params: {id: route.params.id}})

	if (res) {
		useNotify({type: 'success', title: 'Saved!'});
		router.back();
	}
}

async function cancel() {
	usePrefixedRouterPush(router, route, '/settings/permissions')
	router.back();
}

function fromatDate(date) {
	return dayjs(date).format('DD.MM.YYYY LT')
}

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14)
	editor.setBehavioursEnabled(true);

	editor.focus();
	editor.navigateFileStart();
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

pre.code-block {
	background: #272822;
	color: #fff;
	padding: 8px;
}

</style>
