<template>
    <!-- TODO: finish this component -->
	<FmTableToolbarActions>
		<template #leftPart>
			<FmIcon
				icon="refresh"
				@click="scope.refreshTable()"
				v-fm-tooltip="'Refresh Database Filters'"
				btn
			/>

		</template>

	</FmTableToolbarActions>
</template>

<script setup>
// TODO: finish this component
// stores
// props, emits
let props = defineProps({
	content_type: {
		type: String,
		required: true,
	}
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
