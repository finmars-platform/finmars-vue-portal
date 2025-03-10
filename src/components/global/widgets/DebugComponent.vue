<template>
	<div class="wrap">
		<div class="title">Debug Component</div>

		<div class="log_wrap">
			<div v-for="item in dashStore.__log" class="p-b-10">
				<code
					>[{{ item.time }}] {{ item.componentName }} /
					{{ item.name }} (Output)</code
				>
				was changed from <b>[{{ item.oldVal }}]</b> to
				<b>[{{ item.newVal }}]</b>

				<div class="p-l-16" v-for="childProp in item.children">
					->
					<code
						>{{ childProp.componentName }} /
						{{ childProp.name }} (Input)</code
					>
					was changed
					<b>[{{ childProp.oldVal }}]</b> to
					<b>[{{ childProp.newVal }}]</b>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	let dashStore = useStoreDashboard();
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid #e0e0e0;
	}

	.title {
		height: 36px;
		line-height: 36px;
		background: var(--table-header-background-color);
		padding: 0 20px;
	}

	.log_wrap {
		padding: 15px;
	}
</style>
