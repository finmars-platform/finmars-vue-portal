<template>
	<div class="setup_wrap">
		<h1 class="tac">Welcome</h1>
		<h2 class="tac">Setup your account </h2>
		<h3 class="tac">Step {{ step }} / 2</h3>

		<div class="step_1" v-if="step == 1">
			Please select your complexity level:
			<FmSelect
				v-model="store.member.interface_level"
				:items="levels"
			/>

			<div class="btns flex sb">
				<FmBtn type="action">Cancel</FmBtn>
				<FmBtn class="btn" @click="next()">Next</FmBtn>
			</div>
		</div>

		<div class="step_2" v-if="step == 2">
			<div class="dib">
				<div class="config_wrap flex sb fww">
					<FmCard class="config_item"
						v-for="item in configs"
						:title="item.name"
						@click="config = item.data"
					>
						<div class="fm_card_text">{{ item.description }}</div>

						<div class="version flex sb">
							<div>Updated: {{item.data.head.date}}</div>
							<div>Version: {{ item.data.head.version.split(' ')[0] }}</div>
						</div>
					</FmCard>
				</div>

				<div class="btns flex sb">
					<FmBtn type="action" @click="step = 1">Back</FmBtn>
					<FmBtn class="btn" :disabled="!config" @click="finish()">Finish</FmBtn>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		isHideSidebar: true,
		bread: [
			{
				text: "Profile",
				to: "/profile",
				disabled: false,
			},
			{
				text: "Create New Database",
				disabled: true,
			},
		],
	})

	let store = useStore()

	let step = ref(1)
	let levels = [
		{id: 5, name: 'Front Office'},
		{id: 10, name: 'Middle Office'},
		{id: 15, name: 'Sophisticated User'},
		{id: 20, name: 'Advanced Sophisticated User'},
	]

	let res = await useApi("configurationList.get")
	let configs = ref(res.results)

	let config = ref(null)
	let counter = ref(null)
	let activeItemTotal = ref(null)

	async function next() {
		await useApi('member.put', {
			body: store.member,
			params: {id: 0}
		})

		step.value = 2
	}

	async function finish() {
		let importedData = {
			data: config.value,
			mode: 'overwrite'
		}

		let importData = async () => {
			let res = await useApi('configurationJson.post', {
				body: importedData
			})

			importedData = res;
			counter.value = res.processed_rows;
			activeItemTotal.value = res.total_rows;

			if (importedData.task_status === 'SUCCESS') {
				return true

			} else {

				await new Promise((resolve) => {
					setTimeout(async () => {
						await importData()
						resolve()
					}, 1000)
				})
			}
		}

		await importData()

		console.log(res)

		// step.value = 3
	}
</script>

<style lang="scss" scoped>
	.config_wrap {
		display: inline-block;
		text-align: left;
	}
	.config_item {
		height: 186px;
		width: 360px;
	}
	.version {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 20px;
		padding: 0 20px;
		color: $text-lighten;
	}
	.setup_wrap {

		h1 {
			margin-top: 20px;
			font-size: 24px;
			line-height: 28px;
			text-align: center;
			letter-spacing: 0.4px;
		}
		h2 {
			font-size: 20px;
			line-height: 23px;
			letter-spacing: 0.4px;
			margin-top: 22px;
		}
		h3 {
			font-size: 16px;
			line-height: 19px;
			letter-spacing: 0.4px;
			margin-top: 17px;
		}
	}
	.btns {
		margin-top: 35px;
	}
	.step_1 {
		width: 330px;
		margin: 0 auto;
		margin-top: 30px;
	}
	.step_2 {
		margin: 0 auto;
		margin-top: 30px;
		text-align: center;
	}
</style>
