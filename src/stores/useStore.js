export default defineStore({
	id: 'global',
	state: () => {
		return {
			user: {},
			masterUsers: [],
			current: {},
			member: {},

			ws: null,

			ecosystemDefaults: {},
			configCodes: [],
			defaultConfigCode: null,
			systemErrors: [],
		}
	},
	actions: {
		registerSysError(error) {
			this.systemErrors.push({
				created: new Date().toISOString(),
				location: window.location.href,
				text: JSON.stringify(error),
			})
		},
		async init() {
			this.getUser()
			await this.getMasterUsers()

			if(this.current){
				// hack for repots
				window.base_api_url = this.current.base_api_url; // needed for angularjs components
			}

		},
		async getMasterUsers() {
			let res = await useApi('masterUser.get')

			if (res.error) return

			this.masterUsers = res.results

			const activeMasterUser = this.masterUsers.find((item) =>
				location.href.includes(item.base_api_url)
			)

			if ( activeMasterUser ) {
				this.current = activeMasterUser;

				const res = await useApi('configurationList.get');

				if (!res.error) {
					this.configCodes = res.results;
				}

				this.defaultConfigCode = this.configCodes.find( conf => conf.is_primary ).configuration_code;

			}

			window.onerror = this.registerSysError
		},
		async getUser() {
			let res = await useApi('me.get')

			if (res.error) {
				throw res.error;
			}

			this.user = res

			if (!this.user.data) this.user.data = {}

			if (typeof this.user.data.autosave_layouts !== 'boolean') {
				this.user.data.autosave_layouts = true
			}
		},
		async getMe() {
			const res = await useApi('member.get', { params: { id: 0 } })

			if (res.error) {
				console.log('res.error:', res.error)
			} else {
				if (!res.data) {
					res.data = {}
				}

				if (!res.data.favorites) {
					res.data.favorites = {}
				}

				if (!res.data.favorites.transaction_type) {
					res.data.favorites.transaction_type = []
				}

				if (!res.data.favorites.attributes) {
					res.data.favorites.attributes = {}
				}

				this.member = res
			}
		},
		async updateMember(member = this.member) {
			const options = {
				params: { id: member.id },
				body: member,
			}

			const res = await useApi('member.put', options)

			if (res.error) {
				console.error(res.error)
			} else {
				this.member = res
			}
		},

		async fetchEcosystemDefaults() {
			const res = await useApi('ecosystemDefaults.get')

			if (!res.error) {
				this.ecosystemDefaults = res.results[0]
			}
		},

		setupMemberData(isReport, entityType) {
			if (!this.member.data) this.member.data = {}
			if (!this.member.data.group_tables) this.member.data.group_tables = {}

			if (!this.member.data.group_tables.entity_viewer) {
				this.member.data.group_tables.entity_viewer = {
					entity_viewers_settings: {},
				}
			}

			if (!this.member.data.group_tables.report_viewer) {
				this.member.data.group_tables.report_viewer = {
					entity_viewers_settings: {},
				}
			}

			const viewerType = isReport ? 'report_viewer' : 'entity_viewer'
			let entityTypesSettings =
				this.member.data.group_tables[viewerType].entity_viewers_settings

			if (!entityTypesSettings[entityType]) {
				entityTypesSettings[entityType] = {
					marked_rows: {},
					row_type_filter: 'none',
				}
			}

			return this.member
		},

		setMemberEntityViewerSettings(settings, isReport, entityType) {
			const viewerType = isReport ? 'report_viewer' : 'entity_viewer'
			/* let member = setUpMemberData(this.member, viewerType, entityType);

			member.data.group_tables[viewerType].entity_viewers_settings[entityType] = settings; */

			this.member.data.group_tables[viewerType].entity_viewers_settings[
				entityType
			] = settings
		},
	},
	getters: {
		memberEntityViewerSettings(state) {
			return (isReport, entityType) => {
				const viewerType = isReport ? 'report_viewer' : 'entity_viewer'
				// let member = setUpMemberData(state.member, viewerType, entityType);

				return state.member.data.group_tables[viewerType]
					.entity_viewers_settings[entityType];

			}
		},
		favorites(state) {
			return state.member.data.favorites
		},
	},
})
