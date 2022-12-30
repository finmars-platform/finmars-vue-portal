<template>
	<div class="setup_wrap">
		<div class="step_1" v-if="step == 1">
			<h1 class="tac">Welcome</h1>
			<h2 class="tac">Setup your account </h2>
			<h3 class="tac">Step 1 / 2</h3>
			Please select your complexity level:
			<FmSelect
				v-model="store.member.interface_level"
				:items="levels"
			/>

			<div class="btns flex sb">
				<FmBtn type="action" @click="navigateTo('/profile')">Cancel</FmBtn>
				<FmBtn class="btn" @click="next()">Next</FmBtn>
			</div>
		</div>

		<div class="step_2" v-if="step == 2">
			<h1 class="tac">Welcome</h1>
			<h2 class="tac">Setup your account </h2>
			<h3 class="tac">Step 2 / 2</h3>

			<div class="tac m-b-24">Please select init configuration you would like to use</div>

			<div class="dib">
				<div class="config_wrap flex sb fww">
					<FmCard class="config_item"
						v-for="item in configs"
						:title="item.name"
						:class="{active: config == item.data}"
						@click="config = item.data"
					>
						<div class="fm_card_text">{{ item.description }}</div>

						<div class="version flex sb" v-if="item.data != 'blank'">
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

		<div class="progress" v-if="step == 3">
			<div class="flex aic posr">
				<div>
					<FmLoader size="53" border="1" />
					<div class="progress_percent">{{ progress }}%</div>
				</div>

				<div class="progress_inst">Installing...</div>
			</div>
			<div class="progress_desc">{{ progress_item }}</div>
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
				text: "Initial setup",
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
	res.results.unshift({name: 'Blank', description: 'Empty Ecosystem. Configure all forms, layouts and tables by myself', data: 'blank'})
	let configs = ref(res.results)

	let config = ref(null)
	let progress = ref(0)
	let progress_item = ref('')

	async function next() {
		await useApi('member.put', {
			body: store.member,
			params: {id: 0}
		})

		step.value = 2
	}

	async function finish() {
		if ( config.value == 'blank') {
			navigateTo('/home')
			return false
		}

		let importedData = {
			data: config.value,
			mode: 'overwrite'
		}

		step.value = 3

		importedData = await useApi('configurationJson.post', {
			body: importedData
		})

		let checkStatus = async () => {
			let res = await useApi('configurationJsonStatus.get', {
				params: {id: importedData.task_id}
			})

			if (res.status === 'P' || res.status === 'I') {
				progress.value = res.progress_object?.percent || progress.value
				progress_item.value = res.progress_object?.description

				setTimeout(checkStatus, 1000)

			} else if (res.status === 'D') {

				useRouter().push('/home')
			}
		}

		checkStatus()
	}
</script>

<style lang="scss" scoped>
	.config_wrap {
		text-align: left;
		width: 750px;
	}
	.config_item {
		height: 186px;
		width: 360px;
		margin-bottom: 30px;

		&.active {
			background: $primary-lighten-2;
		}
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
		padding-bottom: 30px;

		h1 {
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
			margin-bottom: 30px;
		}
	}
	.btns {
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
	.progress {
		margin-top: 150px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.posr {
		position: relative;
	}
	.progress_percent {
		position: absolute;
		left: 0;
		top: 16px;
		width: 50px;
		font-size: 16px;
		font-weight: 500;
		text-align: center;
	}
	.progress_inst {
		font-weight: 500;
		font-size: 20px;
		margin-left: 11px;
	}
	.progress_desc {
		margin-top: 40px;
		color: $text-lighten;
	}
</style>
