<template>
	<div class="mb-4">

		<div v-if="processing" class="my-8">
			<div class="loader-container flex flex-center mb-2">
				<FmProgressCircular :size="100" indeterminate />
			</div>

			<div class="text-center text-bold">Applying Configuration</div>

		</div>

		<p class="text-center mb-2">Configurations</p>

		<div class="mx-auto w-full max-w-4xl">

			<div v-for="item in setupConfigurationsList" class="setup-configuration-item p-6 border border-solid border-[--outline-variant]">

				<div>

					<div class="font-bold pt-2 pb-2">{{item.name}}</div>

					<div v-if="item.description" class="max-h-20 overflow-y-auto">
						{{item.description}}
					</div>

					<div class="flex justify-end config-footer">

						<FmButton
							type="secondary"
							:disabled="processing"
							@click="installConfiguration(item.id)"
						>
							Install
						</FmButton>

					</div>


				</div>

			</div>

		</div>

	</div>

</template>

<script setup>

import {
	FmProgressCircular,
	FmButton,
} from "@finmars/ui";

//# region variables, refs, computed
const processing = ref(false);

const setupConfigurationsList = ref([]);
//# endregion

async function installConfiguration (configurationId) {

	processing.value = true;

	const opts = {
		params: {
			id: configurationId,
		}
	}

	const res = await useApi("installNewMemberSetupConfig.put", opts);

	if (!res._$error) {

		useNotify({type: "info", title: "Configuration is going to be installed."});

		processing.value = false;

	}

}


async function fetchSetupConfigurations() {

	const res = await useApi("newMemberSetupConfig.get");

	if (!res._$error) {
		setupConfigurationsList.value = res.results;
	}

}

fetchSetupConfigurations();

</script>

<style scoped lang="scss">

</style>
