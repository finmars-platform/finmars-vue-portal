<template>
	<BaseModal no_padding title="Rollback Workspace from Backup" @update:model-value="cancel()">
		<template v-if="!pending">
			<div
				class="backup"
				v-for="item in data.results"
				:class="{active: body.master_user_backup_id == item.id}"
				:key="item.id"
				@click="body.master_user_backup_id = item.id"
			>
				<div class="backup_title">{{ item.name > 45 ? item.name.slice(0, 45) + '...' : item.name }}</div>
				<div class="flex aic sb">
					<div>{{ fromatDate(item.created_at) }}</div>
					<div v-if="item.created_by">Performed by: <span class="backup_by">{{ item.created_by }}</span></div>
				</div>
				<div class="backup_notes">{{ item.notes }}</div>
			</div>
		</template>
		<div class="flex aic jcc" v-else>
			<FmLoader />
		</div>
		<template #controls>
			<FmCheckbox
				class="p-b-8"
				v-model="body.create_backup_before_rollback"
				label="Create backup before rollback"
			/>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">cancel</FmBtn>

				<FmBtn :disabled="!body.master_user_backup_id || processing" :processing="processing" @click="rollback()">start</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import dayjs from 'dayjs'

	let emit = defineEmits(['update:modelValue'])
	let props = defineProps({workspaceId: String})

	let { data, refresh, pending } = useLazyAsyncData("masterBackups", () =>
		useApi("masterBackups.get", {
			filters: {
				master_user: props.workspaceId
			}
		})
	)

	let processing = ref(false)
	let body = reactive({
		master_user_backup_id: null,
		create_backup_before_rollback: true
	})

	async function rollback() {
		processing.value = true

		let res = await useApi("masterRollback.put", {
			params: { id: props.workspaceId },
			body
		})
		if ( !res.error ) {
			useNotify({
				type: 'success',
				title: 'Success',
			})
		} else {
			useNotify({
				type: 'error',
				title: 'No success',
			})
		}

		cancel()
	}

	function cancel() {
		emit('update:modelValue', false)
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY HH:mm')
	}
</script>

<style lang="scss" scoped>
	.backup {
		padding: 7px 20px;
		color: var(--card-secondary-text-color);
		font-size: 14px;
		cursor: pointer;
		transition: background 0.3s;
		width: 400px;

		&:hover {
			background: var(--table-header-background-color);
		}
		&.active {
			background: $primary-lighten-2;
		}
	}
	.backup_title {
		margin-bottom: 5px;
		color: var(--secondary-color);
		font-size: 16px;
	}
	.backup_by {
		color: var(--secondary-color);
		text-transform: capitalize;
	}
	.backup_notes {
		margin-top: 5px;
	}
</style>
