<template>
	<div>
		<v-container class="justify-space-between d-flex py-3" fluid>
			<h2 class="text-h4">Coming soon</h2>
		</v-container>
	</div>
</template>

<script>
export default defineComponent({
	async setup() {},
	data() {
		return {
			menus: [{ title: "test" }, { title: "test2" }],
		};
	},
	created() {},
	methods: {},
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
