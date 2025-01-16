<template>
	<BaseModal :title="title" class="w-3/5">
		<div v-if="currentItem.user_code" class="mb-2">
			<span>User Code: {{ currentItem.user_code }}</span>
		</div>
		<div class="flex flex-col gap-2 pb-2">
			<FmTextField
				v-model="currentItem.name"
				:rules="[rules.required]"
				label="Name"
			/>
			<FmTextField v-model="currentItem.short_name" label="Short Name" />
			<FmTextField v-model="currentItem.first_name" label="First Name" />
			<FmTextField v-model="currentItem.last_name" label="Last Name" />
			<FmTextField
				v-model="currentItem.user_code"
				:rules="[rules.required]"
				label="User Code"
			/>
			<FmTextField
				v-model="currentItem.email"
				:rules="[rules.email]"
				label="Email"
			/>
			<FmTextField
				v-model="currentItem.telephone"
				:rules="[rules.telephone]"
				label="Phone"
			/>
			<div class="flex flex-col mb-2">
				<span class="mb-1">Notes</span>
				<textarea
					id="notes"
					name="notes"
					rows="6"
					cols="50"
					v-model="currentItem.notes"
				/>
			</div>
			<FmSearch
				:items="portfoliosOptions"
				v-model="currentItem.portfolios"
				placeholder="Portfolios"
				multiple
				chips
				closable-chips
				clearable
			/>
			<div class="flex flex-col w-full gap-2 mt-2">
				<span class="text-lg"> Client Secret </span>
				<div v-if="!clientSecrets.length">
					<div
						v-if="modalType !== 'create'"
						class="flex w-full justify-center items-center min-h-9"
					>
						<span>No data available!</span>
					</div>
				</div>
				<div v-else class="max-h-48 overflow-y-auto">
					<table>
						<thead>
							<tr>
								<th id="header_id">ID</th>
								<th>Path to Secret</th>
								<th>User Code</th>
								<th>Provider</th>
								<th>Portfolio</th>
								<th>Notes</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(secret, index) of clientSecrets" :key="secret.id">
								<td>
									<i>
										<span class="opacity-90">{{ secret.id || '-' }}</span>
									</i>
								</td>
								<td>
									<input
										v-model="secret.path_to_secret"
										type="text"
										class="w-full"
									/>
								</td>
								<td>
									<input
										v-model="secret.user_code"
										type="text"
										class="w-full"
									/>
								</td>
								<td>
									<input v-model="secret.provider" type="text" class="w-full" />
								</td>
								<td>
									<input
										v-model="secret.portfolio"
										type="text"
										class="w-full"
									/>
								</td>
								<td>
									<textarea
										id="notes"
										name="notes"
										rows="1"
										cols="35"
										class="w-full"
										v-model="secret.notes"
									/>
								</td>
								<td style="max-width: 32px">
									<FmIcon
										class="cursor-pointer"
										icon="mdi-delete"
										:size="18"
										@click="removeSecret(secret, index)"
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<FmButton
					type="tertiary"
					append-icon="mdi-plus"
					@click="addNewSecret"
					class="mt-2"
					rounded
				>
					Add new secret
				</FmButton>
			</div>
		</div>
		<template #controls>
			<div class="flex aic sb">
				<FmButton type="secondary" @click="closeModal"> Cancel </FmButton>
				<FmButton
					type="primary"
					@click="confirmModal"
					:disabled="validateForm"
					rounded
				>
					{{ modalType === 'create' ? 'Create' : 'Save' }}
				</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { FmButton, FmTextField, FmSearch, FmIcon } from '@finmars/ui';

	const props = defineProps({
		item: {
			type: Object,
			required: true
		},
		title: { type: String, default: 'Create Client Entity' },
		modalType: {
			type: String,
			default: 'create'
		},
		portfoliosOptions: {
			type: Array,
			default() {
				return [];
			}
		}
	});

	const emit = defineEmits(['edit', 'create', 'close']);
	const clientSecrets = ref([]);
	const currentItem = ref({});

	const rules = {
		required: (value) => (value ? '' : 'Field is required'),
		telephone: (value) => {
			const regex = /^\+?\d{5,15}$/;
			if (!value) {
				return 'Field is required';
			} else if (!regex.test(value)) {
				return 'Invalid phone number.It must be 5 to 15 digits long';
			} else return '';
		},
		email: (value) => {
			const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!value) {
				return 'Field is required';
			} else if (!regex.test(value)) {
				return 'Invalid email type';
			} else return '';
		}
	};

	const confirmModal = () => {
		currentItem.value.client_secrets_object = clientSecrets.value;
		emit(`${props.modalType}`, currentItem.value);
	};

	const closeModal = () => {
		emit('close');
	};

	const validateForm = computed(() => {
		const emailError = rules.email(currentItem.value.email);
		const phoneError = rules.telephone(currentItem.value.telephone);
		const isCurrentItemInvalid =
			!currentItem.value.name ||
			!currentItem.value.user_code ||
			!!emailError ||
			!!phoneError;

		const isClientSecretsInvalid = clientSecrets.value.some(
			(secret) =>
				!secret.path_to_secret ||
				!secret.user_code ||
				!secret.provider ||
				!secret.portfolio
		);
		return isCurrentItemInvalid || isClientSecretsInvalid;
	});

	const addNewSecret = () => {
		clientSecrets.value.push({
			path_to_secret: '',
			user_code: '',
			provider: '',
			portfolio: '',
			notes: ''
		});
	};

	const removeSecret = (secret, index) => {
		clientSecrets.value = clientSecrets.value.filter(
			(itemSecret, itemIndex) => {
				if (itemSecret.id) {
					return itemSecret.id !== secret.id;
				} else {
					return itemIndex !== index;
				}
			}
		);
	};

	function init() {
		currentItem.value = props?.item;
		clientSecrets.value = props?.item.client_secrets_object;
	}

	init();
</script>

<style scoped lang="scss">
	textarea {
		border-radius: var(--spacing-4);
		border: 1px solid var(--table-border-color);
		padding: 2px;
	}
	input {
		border: 1px solid var(--table-border-color);
		padding: 2px;
	}
	table {
		height: 100%;
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		th,
		td {
			border: 1px solid var(--table-border-color);
			padding: 6px;
			text-align: left;
		}
		th:not(#header_id) {
			font-size: 14px;
			background-color: var(--activeState-backgroundColor);
		}
		td {
			font-size: 12px;
		}
		tr {
			border: 1px solid var(--table-border-color);
		}
	}
</style>
