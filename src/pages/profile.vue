<template>
	<div>
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
			<v-window-item value="Databases">
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
		</v-window>
	</div>
</template>

<script>
export default defineComponent({
	async setup() {},
	data() {
		return {
			tabs: ["Databases", "Backups", "Billing", "Settings"],
			tab: null,
			menus: [{ title: "test" }, { title: "test2" }],
			error: null,
		};
	},
	created() {
		definePageMeta({
			title: "Profile",
		});
	},
	methods: {},
	head() {
		return {
			title: "Profile",
		};
	},
});
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
