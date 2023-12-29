<template>
	<BaseDrawer :modelValue="modelValue">

		<div class="drawer_header">

			<div class="flex-row">
				<div>{{ title }}</div>

				<slot name="headerLeft" />
			</div>

			<slot name="headerRight" />

		</div>

		<div class="drawer_content">
			<slot />
		</div>

		<div class="drawer_footer">
			<slot name="footer" />
		</div>

	</BaseDrawer>
</template>

<script setup>

// stores
// props, emits
let props = defineProps({
	modelValue: Boolean,
	title: String,
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

.drawer_header {
	display: flex;
	justify-content: space-between;
}

</style>
