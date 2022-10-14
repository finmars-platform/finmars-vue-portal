<template>
	<div class="setup_wrap">
		<h1 class="tac">Welcome</h1>
		<h2 class="tac">Setup your account </h2>

		<h3 class="tac">Please select init configuration you would like to use </h3>

		<div class="config_wrap flex sb">
			<FmCard class="config_item"
				v-for="item in configs"
				:title="item.name"
			>
				<div class="fm_card_text">{{ item.description }}</div>
			</FmCard>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		isHideSidebar: true,
		bread: [
			{
				text: "Profile",
				to: "/profile",
				disabled: false,
			},
			{
				text: "Create New Database",
				disabled: true,
			},
		],
	})

	let router = useRouter()

	let step = ref("create")
	let isShow = ref(false)
	let processing = ref(false)

	let form = reactive({
		description: "",
	})

	let res = await useApi("configurationList.get")
	let configs = ref(res.results)

	let config = ref(null)
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
