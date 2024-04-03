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
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		isHideSidebar: true,
		bread: [
			{
				text: "Profile",
				to: "/v/profile",
				disabled: true,
			},
		],
	})

	let route = useRoute()

	const tabs = ["Workspaces", "Backups", "Billing", "Settings"]
	let tab = ref(route.query.tab || "Workspaces")
	let error = ref(null)
</script>
