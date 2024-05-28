<template>
	<FmCard
		controls
		class="invite-card d-flex flex-column"
		:title="
			invite.to_master_user_object.name.length > 20
			? invite.to_master_user_object.name.slice(0, 20) + '...'
			: invite.to_master_user_object.name
		"
	>
		<div class="fm_card_content" v-if="invite.to_master_user_object.description">
			{{ invite.to_master_user_object.description }}
		</div>

		<div class="fm_card_content">
			You have been invited to “
			<b>{{ invite.to_master_user_object.name }}</b>
			” database by
			<b>{{ invite.from_user_object.username }}</b>
		</div>

		<template #controls>
			<div class="flex sb p-16">
				<FmBtn type="text" @click="changeStatus(2)">decline</FmBtn>

				<FmBtn @click="changeStatus(1)">Accept</FmBtn>
			</div>
		</template>
	</FmCard>
</template>

<script setup>
const emit = defineEmits(["refresh"]);
const props = defineProps({
	invite: Object,
});
let store = useStore()

async function changeStatus(status) {
	let res = await useApi("invitesToDB.put", {
		body: {...props.invite, status},
		params: {id: props.invite.id},
	});

	if (res.status) {
		let res = await useApi("masterSet.patch", {
			body: {},
			params: {id: props.invite.to_master_user},
		});
		if (res.success) {
			await store.getMasterUsers()
			emit('refresh')

			if (status != 2) {
				let mu = store.masterUsers.find(item => item.id == props.invite.to_master_user)

				location.href = `https://${location.host}/${mu.realm_code}/${mu.space_code}/v/setup`
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.invite-card {
    .actions {

    }
}
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
