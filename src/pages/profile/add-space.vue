<template>
	<div class="flex jcc">
		<FmCard class="fm_card_text form_block" title="Setup your new Space">
			<BaseInput v-model="form.name" label="Name"/>
			<BaseInput v-model="form.license_key" label="License Key"/>
			<BaseInput v-model="form.realm_code" label="Realm Code" :disabled="true"/>
<!--			<FmSelect v-model="config" :items="configs" label="Init configuration"/>-->
			<BaseInput v-model="form.description" label="Description"/>

			<div class="show_btn tac">
				<FmBtn type="action" @click="isShow = !isShow"
				>{{ !isShow ? "Show" : "Hide" }} details
				</FmBtn
				>
			</div>

			<template v-if="isShow">

				<BaseInput v-model="form.versions.backend" label="Backend Version"/>
				<BaseInput v-model="form.versions.portal" label="Portal Version"/>
				<BaseInput v-model="form.versions.vue_portal" label="Vue Portal Version"/>
				<BaseInput v-model="form.versions.workflow" label="Workflow Version"/>

			</template>

			<div class="flex sb">
				<FmBtn type="text" @click="$router.push('/v/profile')">cancel</FmBtn>
				<FmBtn :disabled="processing" @click="createDb()"> finish</FmBtn>
			</div>
		</FmCard>
	</div>
</template>

<script setup>
import {usePrefixedRouterPush} from "~/composables/useMeta";

definePageMeta({
	middleware: 'auth',
	isHideSidebar: true,
	bread: [
		{
			text: "Profile",
			to: "/v/profile",
			disabled: false,
		},
		{
			text: "Create New Space",
			disabled: true,
		},
	],
})

let router = useRouter()
let route = useRoute()

let step = ref("create")
let isShow = ref(false)
let processing = ref(false)

let form = reactive({
	description: "",
	realm_code: route.query.realm_code,
	versions: {
		backend: "",
		portal: "",
		vue_portal: "",
		workflow: "",
	},
})
let configs = [
	{
		id: "Blank",
		name: "Blank",
	},
]
let config = ref("Blank")

async function createDb() {
	processing.value = true

	let res = await useApi("realmCreateSpace.put",

		{
			params: {id: route.query.realm_id},
			body: form
		}
	)

	if (res.task_id) {
		router.push("/v/profile")
		useNotify({
			type: "success",
			title: "Space is initializing.",
		})
	}

	processing.value = false
}
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(2, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}

.form_block {
	width: 360px;
	margin-bottom: 0;
}

.show_btn {
	margin-bottom: 25px;
}
</style>
