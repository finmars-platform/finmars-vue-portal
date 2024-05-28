<template>
	<BaseModal no_padding title="About" @update:model-value="cancel()">
		<div class="content p-16 width-70-vw">

			<div>Name: {{realm.name}}</div>
			<div>Realm Code: {{realm.realm_code}}</div>

			<div class="display-flex">
				<FmCard class="p-16 m-16">

					<h3 class="m-b-16">Current Versions</h3>

					<div v-for="item in realm.current_versions" :key="item.id">
						{{item.app}} - {{item.version}}
					</div>

				</FmCard>

				<FmCard class="p-16 m-16">

					<h3 class="m-b-16" >Next Versions</h3>

					<div v-for="item in realm.next_versions" :key="item.id">
						{{item.app}} - {{item.version}}
					</div>

				</FmCard>

			</div>

			<FmBtn v-if="realm.is_update_available"  class="m-l-16" @click="initUpdateDatabase(), close()">

				Update
			</FmBtn>

		</div>
		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">close</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

let emit = defineEmits(['update:modelValue', 'refresh'])
let props = defineProps({realm: Object})

async function initUpdateDatabase() {

	await useApi('realmInitUpdate.put', {params: {id: props.realm.id}})

	emit('update:modelValue', false)
	emit("refresh");

}

function cancel() {
	emit('update:modelValue', false)
}

</script>

<style lang="scss" scoped>
.provision-log {
	padding: 4px;
	color: #fff;
	background: #000;
	font-size: 14px;
	width: 1024px;
	font-family: monospace;
	white-space: pre;
	overflow: auto;
}

</style>
