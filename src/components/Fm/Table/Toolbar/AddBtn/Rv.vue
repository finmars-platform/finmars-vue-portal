<template>
	<FmTableToolbarAddBtn
		:items="addMenuOptsListRef"
		:disabled="btnDisabledRef"
		@optionSelected="dispatchAddMenuAction"
	/>
</template>

<script setup>
import evEvents from '@/angular/services/entityViewerEvents'

// stores
// props, emits

const { evEventService, evDataService } =
	inject('fmTableData')

//# region variables, refs, computed
let addMenuOptsListRef = ref([
	{
		action: 'book_transaction',
		name: 'Book Transaction',
		order: 0,
	},
	{
		action: 'add_portfolio',
		name: 'Add Portfolio',
		order: 1,
	},
	{
		action: 'add_account',
		name: 'Add Account',
		order: 2,
	},
	{
		action: 'add_currency',
		name: 'Add Currency',
		order: 3,
	},
	{
		action: 'add_instrument',
		name: 'Add Instrument',
		order: 4,
	}
])
let btnDisabledRef = ref(true);
//# endregion

//# region hooks
//# endregion

const dispatchAddMenuAction = function (item) {

	evDataService.setUserRequestedAction(item.action)

	evEventService.dispatchEvent(evEvents.USER_REQUEST_AN_ACTION)

}

const getAddMenuLayout = async function () {

	btnDisabledRef.value = true;

	const data = await uiService.getContextMenuLayoutList({
		filters: {
			type: 'report_menu_add_entities'
		}
	})

	if (data.results.length) {
		addMenuOptsListRef.value = data.results[0].data.menu.root.items;
	}

	btnDisabledRef.value = false;

	return addMenuOptsListRef.value;

}

addMenuOptsListRef.value = await getAddMenuLayout();

</script>

<style scoped lang="scss">

</style>
