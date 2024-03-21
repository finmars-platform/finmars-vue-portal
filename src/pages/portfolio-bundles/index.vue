<template>
	<div class="container">
		<table class="portfolio-table">
			<thead>
			<tr>
				<th>Name</th>
				<th>Unique Code</th>
				<th>Notes</th>

				<th></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="(item, index) in portfolioBundleList" :key="index">
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.notes }}</td>

				<td>
					<FmBtn
						type="text"
						class="g-toggle-filters-btn"
						@click="editPortfolioBundle(item)"
					>Edit
					</FmBtn>
					<FmBtn
						type="text"
						class="g-toggle-filters-btn"
						@click="deletePortfolioBundle(item)"
					>
						Delete
					</FmBtn>
				</td>
			</tr>
			</tbody>
		</table>
		<FmBtn
			type="primary"
			class="g-toggle-filters-btn"
			@click="createPortfolioBundle(item)"
		>
			Add New
		</FmBtn>
		<div v-if="isOpenEditPortfolioBundle">
			<ModalPortfolioBundleManager
				title="Portfolio Bundle Manager"
				v-model="isOpenEditPortfolioBundle"
				:name="activePortfolioBundleList.name"
				:user_code="activePortfolioBundleList.user_code"
				:notes="activePortfolioBundleList.notes"
				:сreation="сreation"
				:publicName="activePortfolioBundleList.public_name"
				:registers="activePortfolioBundleList.registers"
				:registersItems="portfolioRegister"
				:shortName="activePortfolioBundleList.short_name"
				:modelValue="true"
				@save="putEditPortfolioBundle"
				@create="getCreatePortfolioBundle"
			></ModalPortfolioBundleManager>
		</div>
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
	bread: [
		{
			text: 'Default settings',
			to: '/settings/default-settings',
		},
	],
})
const portfolioBundleList = ref([])
let activePortfolioBundleList = ref([])
let isOpenEditPortfolioBundle = ref(false)
let сreation = ref(false)
let portfolioRegister = ref()

defaultsGet()

async function defaultsGet() {
	let edRes = await useApi('portfolioBundleList.get')

	portfolioBundleList.value = edRes.error ? {} : edRes.results
}

async function deletePortfolioBundle(item) {

	let confirm = await useConfirm({
		title: 'Confirm action',
		text: `Do you want to delete "${item.name}" layout?`,
	})

	if (confirm) {
		deletePortfolioBundleItem(item)
	}
}

getPortfolioRegister()

async function getPortfolioRegister() {
	let edRes = await useApi('portfolioRegisterList.get')
	portfolioRegister.value = edRes.error ? {} : edRes.results
}

async function deletePortfolioBundleItem(item) {
	let res = await useApi('portfolioBundle.delete', {
		params: { id: item.id },
		body: item,
	})
	if (res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.detail,
		})
		throw new Error(res._$error)
	} else if (res.status === 'conflict') {
		useNotify({
			type: 'error',
			title: 'You can not delete attributed that already in use',
		})
		throw new Error(res._$error)
	}
	useNotify({ type: 'success', title: `data delete on the server` })
	defaultsGet()
}

function editPortfolioBundle(newNamesData) {
	// activePortfolioBundleList = " "
	activePortfolioBundleList = newNamesData
	console.log('activePortfolioBundleснаружиs', activePortfolioBundleList)
	сreation = false
	console.log('сreation', сreation)
	isOpenEditPortfolioBundle.value = true
}
function createPortfolioBundle(newNamesData) {
	activePortfolioBundleList = ' '
	console.log('activePortfolioBundleснаружиs2', activePortfolioBundleList)
	сreation = true
	console.log('сreation 2', сreation)

	isOpenEditPortfolioBundle.value = true
}
async function putEditPortfolioBundle(newNamesData) {
	// activePortfolioBundleList = []
	console.log('putEditPortfolioBundle newNamesData', newNamesData)
	let res = await useApi('portfolioBundle.put', {
		params: { id: activePortfolioBundleList.id },
		body: newNamesData,
	})
	if (res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.detail,
		})
		throw new Error(res._$error)
	} else if (res.status === 'conflict') {
		useNotify({
			type: 'error',
			title: 'You can not Edit CustomColumns that already in use',
		})
		throw new Error(res._$error)
	}
	useNotify({ type: 'success', title: `data Edit on the server` })
	defaultsGet()

	isOpenEditPortfolioBundle.value = false
}

async function getCreatePortfolioBundle(newNamesData) {
	activePortfolioBundleList = {}
	let res = await useApi('portfolioBundle.post', {
		body: newNamesData,
	})
	if (res._$error) {
		throw new Error(res._$error)
	} else if (res.status === 'conflict') {
		useNotify({
			type: 'error',
			title: 'You can not Edit CustomColumns that already in use',
		})
		throw new Error(res._$error)
	}
	useNotify({ type: 'success', title: `data Edit on the server` })
	defaultsGet()
	isOpenEditPortfolioBundle.value = false
}
</script>

<style lang="scss" scoped>
td,
th {
	width: 25%;
	padding: 0 5px;
	display: table-cell;
	text-align: left;
	vertical-align: middle;
	border-radius: 2px;
}
.container {
	padding: 30px;
}
.title {
	margin-bottom: 24px;
	font-weight: 700;
}
.portfolio-table {
	width: 100%;
	margin-bottom: 40px;
}
@media (max-width: 1200px) {
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 10px 5px;
	}
}
@media (max-width: 767px) {
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		gap: 10px 5px;
	}
}
</style>
