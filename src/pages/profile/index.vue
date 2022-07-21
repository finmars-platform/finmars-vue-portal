<template>
	<div>
		<Head>
			<Title>Profile</Title>
			<Link type="image/x-icon" rel="icon" href="/v/img/favicon/favicon.ico" />
		</Head>
		<v-tabs v-model="tab" color="primary" class="bg-grey-lighten-5">
			<v-tab
				class="px-7"
				v-for="(item, index) in tabs"
				:key="index"
				:value="item"
			>
				{{ item }}
			</v-tab>
		</v-tabs>

		<v-divider></v-divider>

		<v-window v-model="tab">
			<v-window-item value="Workspaces">
				<PagesProfileDatabases></PagesProfileDatabases>
			</v-window-item>

			<v-window-item value="Backups">
				<PagesProfileBackups></PagesProfileBackups>
			</v-window-item>
			<v-window-item value="Billing">
				<PagesProfileBilling></PagesProfileBilling>
			</v-window-item>
			<v-window-item value="Settings">
				<PagesProfileSettings></PagesProfileSettings>
			</v-window-item>
			<v-window-item value="Api">
				<PagesProfileApi></PagesProfileApi>
			</v-window-item>
		</v-window>
	</div>
</template>

<script setup>
	definePageMeta({
		bread: [
			{
				text: 'Profile',
				to: '/profile',
				disabled: false
			}
		],
	});
	useState('isOpenSidbar').value = false

	let tabs = ref(["Workspaces", "Backups", "Billing", "Settings", "Api"])
	let tab = ref(null)
	let error = ref(null)



</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
