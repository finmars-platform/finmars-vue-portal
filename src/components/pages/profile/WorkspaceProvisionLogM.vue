<template>
	<BaseModal no_padding title="Workspace Provising Log" @update:model-value="cancel()">
		<template v-if="!pending">

			<div>{{data}}</div>

		</template>
		<div class="flex aic jcc" v-else>
			<FmLoader />
		</div>
		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">close</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let emit = defineEmits(['update:modelValue'])
	const props = defineProps({
		db: Object
	});

	let data = ''

	async function getData() {

		data = await useApi("masterLog.get", {
			params: {baseApi: props.db.base_api_url}
		})

	}

	setInterval(() => {
		getData()
	}, 2 * 1000)

	function cancel() {
		emit('update:modelValue', false)
	}

</script>

<style lang="scss" scoped>
	.backup {
		padding: 7px 20px;
		color: $text-lighten;
		font-size: 14px;
		cursor: pointer;
		transition: background 0.3s;
		width: 1024px;

		&:hover {
			background: $main-darken;
		}
		&.active {
			background: $primary-lighten-2;
		}
	}
	.backup_title {
		margin-bottom: 5px;
		color: $text;
		font-size: 16px;
	}
	.backup_by {
		color: $text;
		text-transform: capitalize;
	}
	.backup_notes {
		margin-top: 5px;
	}
</style>
