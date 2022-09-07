<template>
	<FmCard
		class="d-flex flex-column"
		color="rgba(240, 90, 34, 0.1)"
		:title="invite.to_master_user_object.name"
	>
		<v-card-text v-if="invite.to_master_user_object.description">
			{{ invite.to_master_user_object.description }}
		</v-card-text>

		<v-card-text>
			You have been invited to “
			<b>{{ invite.to_master_user_object.name }}</b>
			” database by
			<b>{{ invite.from_user_object.username }}</b>
		</v-card-text>

		<template #controls>
			<FmBtn type="text" @click="changeStatus(2)">decline</FmBtn>

			<FmBtn @click="changeStatus(1)">Accept</FmBtn>
		</template>
	</FmCard>
</template>

<script setup>
const emit = defineEmits(["refresh"]);
const props = defineProps({
	invite: Object,
});

async function changeStatus( status) {
	let res = await useApi("invitesToDB.put", {
		body: { ...props.invite, status },
		params: { id: props.invite.id },
	});

	if (res.status) {
		emit("refresh");
	}
}
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
