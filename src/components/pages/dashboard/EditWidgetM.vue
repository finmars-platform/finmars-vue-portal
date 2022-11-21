<template>
	<BaseModal title="Edit widget">

		<BaseInput v-model="editable.date" label="Date" />

		<RvSettingsRow label="Portfolio id">
			<BaseInput v-model="editable.portfolio" />
		</RvSettingsRow>

		<RvSettingsRow label="Scope">
			<BaseInput v-model="editable.scope" />
		</RvSettingsRow>

		<RvSettingsRow label="Tab">
			<BaseInput v-model="editable.tab" />
		</RvSettingsRow>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text">Cancel</FmBtn>
				<FmBtn @click="save()">Save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})
	let dashStore = useStoreDashboard()

	let editable = dashStore.widgets.find(item => item.id == props.wid) || {}

</script>

<style lang="scss" scoped>

</style>
