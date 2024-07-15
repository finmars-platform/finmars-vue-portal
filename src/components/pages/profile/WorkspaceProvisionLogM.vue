<template>
	<BaseModal no_padding title="Realm Provising Log" @update:model-value="cancel()">
		<div class="provision-log">
			<li v-for="(line, index) in lines" :key="index">
				{{ line }}
			</li>
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
let props = defineProps({realmCode: String, realmId: Number})

const lines = ref(['Waiting to server response...'])

async function getData() {

	let logText = await useApi("realmProvisionLog.get", {
		params: {id: props.realmId},
		filters: {app_code: 'backend'},
	})
	lines.value = logText.split(/\r?\n/);

}

const interval = setInterval(() => {
	getData()
}, 2 * 1000)

getData()

function cancel() {
	clearInterval(interval)
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
