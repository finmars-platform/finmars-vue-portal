export default defineStore({
	id: 'global',
	state: () => {
		return {
			user: {},
			masterUsers: [],
			current: {}, // master user
			member: {},
			memberLayout: {},

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
			const memberProm = useApi('member.get', { params: { id: 0 } })
			const memberLayoutProm = useApi(
				'memberLayout.get',
				{
					filters: { is_default: true },
				}
			)

			const res = await Promise.all([memberProm, memberLayoutProm]);

			if ( res[0].error || res[1].error ) {
				console.error('Error while fetching data of member:', res[0].error || res[1].error );

			} else {

				let member = res[0];

				if (!member.data) {
					member.data = {}
				}

				let memberLayout = res[1].results[0];

				if (!memberLayout.data) {
					memberLayout.data = {}
				}

				if (typeof memberLayout.data.autosave_layouts !== 'boolean') {
					memberLayout.data.autosave_layouts = true;
				}

				if (!memberLayout.data.favorites) {
            		memberLayout.data.favorites = {}
				}

				if (!memberLayout.data.favorites.transaction_type) {
            		memberLayout.data.favorites.transaction_type = []
				}

				if (!memberLayout.data.favorites.attributes) {
            		memberLayout.data.favorites.attributes = {}
				}

				/*if (!res.data.favorites) {
					res.data.favorites = {}
				}

				if (!res.data.favorites.transaction_type) {
					res.data.favorites.transaction_type = []
				}

				if (!res.data.favorites.attributes) {
					res.data.favorites.attributes = {}
				}*/

				this.member = member;
				this.memberLayout = memberLayout;
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

		async updateMemberLayout(memberLayout = this.memberLayout) {

			const options = {
					params: { id: memberLayout.id },
					body: memberLayout,
			}

			const res = await useApi('memberLayout.put', options)

			if (res.error) {
					console.error(res.error)
			} else {
					this.memberLayout = res
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
			return state.memberLayout.data.favorites
		},
	},
})
