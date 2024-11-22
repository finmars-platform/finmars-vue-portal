<template>
	<div class="p-24">

		<h1 class="text-4xl mb-8">Pricing Policies</h1>

		<div v-if="readyStatus">

			<table class="angularjs-table mb-6" style="min-width: 959px;">

				<thead>
					<tr>
						<th>
							Name
						</th>
						<th>
							Unique Code
						</th>
						<th>
							Notes
						</th>
						<th>
							Default Instrument Pricing Scheme
						</th>
						<th>
							Default Currency Pricing Scheme
						</th>
						<th style="width: 190px;"><!-- Column with button --></th>
					</tr>
				</thead>

				<tbody>

					<tr v-for="(item, index) in pricingPolicies">

						<td>
							{{ item.name }}
						</td>

						<td>
							{{ item.user_code }}
						</td>

						<td>
							{{ item.notes }}
						</td>

						<td>
							{{ item.default_instrument_pricing_scheme_object?.name }}
						</td>

						<td>
							{{ item.default_currency_pricing_scheme_object?.name }}
						</td>

						<td>

								<!-- @click="$router.push(  )" -->
							<nuxt-link
								:to="useGetNuxtLink(`/data/pricing-policy/${item.id}`, $route.params)"
								class="inline"
							>
								<fm-button
									type="secondary"
								>EDIT</fm-button>
							</nuxt-link>

							<fm-button
								v-if="notDashPricingPolicy(item.user_code)"
								type="secondary"
								@click="deletePricingPolicy(item, index)"
							>
								Delete
							</fm-button>
						</td>

					</tr>

				</tbody>

			</table>

			<div>
				<fm-button @click="() => additionIsOpen = true">Add New</fm-button>
			</div>

		</div>

		<div v-if="!readyStatus" class="loader-container flex flex-center">
			<fm-progress-circular :size="100" indeterminate />
		</div>

		<base-modal
			v-model="additionIsOpen"
			title="Create Pricing Policy"
			@close="pricingPolicyToAdd = {}"
		>
			<div class="flex-col p-4" style="width: 450px;">

				<div class="mb-1">
					<fm-text-field v-model="pricingPolicyToAdd.name" label="Name" outlined />
				</div>

				<div class="mb-4">
					<fm-input-user-code
						v-model="pricingPolicyToAdd.user_code"
						@configurationCodeChanged="(newVal) => pricingPolicyToAdd.configuration_code = newVal"
					/>
				</div>

				<div>
					<fm-input-area v-model="pricingPolicyToAdd.notes" label="Notes" :rows="4" />
				</div>

			</div>

			<template #controls="{ cancel }">
				<div class="flex justify-between items-center">
					<fm-button type="secondary" @click="cancel()">Cancel</fm-button>

					<div>
						<fm-progress-circular v-if="creatingPricingPolicy" :size="30" class="mr-4" />

						<fm-button @click="create" :disabled="creatingPricingPolicy">Save</fm-button>
					</div>
				</div>
			</template>
		</base-modal>

	</div>
</template>

<script setup>

definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Pricing Policies',
			disabled: true
		}
	],
});

// stores
// props, emits

//# region variables, refs, computed
import {useGetNuxtLink} from "~/composables/useMeta";

const readyStatus = ref(false);
const pricingPolicies = ref([]);

async function getList() {

	readyStatus.value = false;

	const res = await useApi("pricingPolicyList.get");

	if ( res._$error ) {
		throw new Error(res._$error);
	}

	readyStatus.value = true;

	return res.results;

}

//# region Pricing policy creation
const additionIsOpen = ref(false);
const pricingPolicyToAdd = ref({});
const creatingPricingPolicy = ref(false);

async function create() {

	creatingPricingPolicy.value = true;

	const opts = {
		body: pricingPolicyToAdd.value
	};

	const res = await useApi("pricingPolicy.post", opts);

	creatingPricingPolicy.value = false;

	if (!res._$error) {

		additionIsOpen.value = false;

		useNotify({
			type: 'success',
			title: `Pricing policy '${pricingPolicyToAdd.value.name}' was successfully created.`}
		);

		pricingPolicyToAdd.value = {};

		pricingPolicies.value = await getList();

	}

}

function notDashPricingPolicy(userCode) {

	if (!userCode) {
		return true;
	}

	const ucEnd = userCode.split(":").at(-1);

	return ucEnd !== "_";

}

async function deletePricingPolicy(pricingPolicy, index) {

	const opts = {
		params: {
			id: pricingPolicy.id
		}
	};

	const res = await useApi("pricingPolicy.delete", opts);

	if (!res?._$error) {

		pricingPolicies.value.splice(index, 1);

		useNotify({
			type: 'success',
			title: `Pricing policy '${pricingPolicy.name}' was successfully deleted.`}
		);

	}

}
//# endregion

//# endregion

//# region hooks
//# endregion

// watchers

pricingPolicies.value = await getList();

</script>

<style scoped lang="scss">

</style>
