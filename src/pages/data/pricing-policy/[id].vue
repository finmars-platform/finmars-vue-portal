<template>
	<div class="h-full p-8 flex flex-col">
		<h1 class="text-4xl mb-8 grow-0 shrink-0">Edit Pricing Policy</h1>

		<div v-if="readyStatus" class="flex flex-col justify-between grow-0 shrink-1 basis-full">

			<div v-if="pricingPolicy === 'not_found'">
				<h1 class="text-4xl text-center">Pricing Policy was not found.</h1>
			</div>

			<div v-else style="max-width: 900px;">

				<div>
					<fm-text-field v-model="pricingPolicy.name" label="Name" outlined />
				</div>

				<div class="mb-4">
					<fm-input-user-code
						v-model="pricingPolicy.user_code"
						@configurationCodeChanged="(newVal) => pricingPolicy.configuration_code = newVal"
					/>
				</div>

				<div>
					<fm-input-area v-model="pricingPolicy.notes" label="Notes" :rows="4" />
				</div>
			</div>

			<div class="flex justify-between mt-8">
				<div>
					<fm-button
						type="secondary"
						@click="$router.back()"
					>
						BACK
					</fm-button>

					<nuxt-link :to="useGetNuxtLink('/data/pricing-policy', $route.params)" class="inline">
						<fm-button
							type="secondary"
						>
							SEE ALL PRICING POLICIES
						</fm-button>
					</nuxt-link>

					<fm-button
						v-if="pricingPolicy !== 'not_found'"
						type="secondary"
						@click="deletePp"
					>
						DELETE
					</fm-button>
				</div>


				<fm-button v-if="pricingPolicy !== 'not_found'" @click="save">SAVE</fm-button>
			</div>

		</div>

		<div v-else class="loader-container flex flex-center h-full">
			<fm-progress-circular :size="100" indeterminate />
		</div>

	</div>

</template>

<script setup>

definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Pricing Policies',
			disabled: true,
		},
		{
			text: 'Edit Pricing Policy',
			disabled: true
		}
	],
});

// stores
// props, emits

//# region variables, refs, computed
const route = useRoute();
const router = useRouter();

const pricingPolicy = ref(null);

const readyStatus = ref(false);

function save() {

	const opts = {
		params: {
			id: pricingPolicy.value.id
		},
		body: pricingPolicy.value
	}

	const res = useApi("pricingPolicy.put", opts);

	if (!res._$error) {

		useNotify({
			type: 'success',
			title: `Pricing policy '${pricingPolicy.value.name}' was successfully saved.`}
		);

	}

}

async function deletePp() {

	const opts = {
		params: {
			id: pricingPolicy.value.id
		}
	};

	const res = await useApi("pricingPolicy.delete", opts);

	if (!res?._$error) {

		useNotify({
			type: 'success',
			title: `Pricing policy was successfully deleted.`}
		);

		router.push( useGetNuxtLink('/data/pricing-policy', route.params) )

	}

}

async function loadPricingPolicy () {

	const res = await useApi(
		"pricingPolicy.get",
		{
			params: {id: route.params.id}
		}
	)

	if (res._$error) {

		if (res._$error.error.status_code === 404) {

			pricingPolicy.value = "not_found";

			readyStatus.value = true;

		}

	}
	else {

		pricingPolicy.value = res;

		readyStatus.value = true;

	}

}
//# endregion

//# region hooks
//# endregion

// watchers

loadPricingPolicy();

</script>

<style scoped lang="scss">

</style>
