<template>
	<FmMenu :disabled="disabled">
		<template #btn>
			<FmBtn type="icon" :disabled="disabled">
				<FmIcon
					class="add_ev_btn"
					btnPrimary
					icon="add"
					v-tooltip="'Add'"
				/>
			</FmBtn>
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
				<div
					v-for="item in items"
					class="fm_list_item"
					@click="emit('optionSelected', item)"
				>
					{{ item.name }}
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>

/* *
 * This component is used by FmTableToolbarAddBtnRv and FmTableToolbarAddBtnEv
 * */

// stores

let props = defineProps({
	items: Array,
	disabled: Boolean,
})

let emit = defineEmits(['optionSelected'])

//# region variables, refs, computed
//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
