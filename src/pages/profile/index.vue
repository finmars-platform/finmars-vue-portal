<template>
	<div>
		<Head>
			<Title>Profile</Title>
			<Link type="image/x-icon" rel="icon" href="/img/favicon/favicon.ico" />
		</Head>

		<FmTabs v-model="tab" :tabs="tabs" />

		<PagesProfileDatabases v-if="tab == 'Workspaces'" />
		<PagesProfileBackups v-if="tab == 'Backups'" />
		<PagesProfileBilling v-if="tab == 'Billing'" />
		<PagesProfileSettings v-if="tab == 'Settings'" />
		<PagesProfileApi v-if="tab == 'Api'" />
	</div>
</template>

<script setup>
	definePageMeta({
		isHideSidebar: true,
		bread: [
			{
				text: "Profile",
				to: "/profile",
				disabled: true,
			},
		],
	})

	const tabs = ["Workspaces", "Backups", "Billing", "Settings", "Api"]
	let tab = ref("Workspaces")
	let error = ref(null)
</script>
