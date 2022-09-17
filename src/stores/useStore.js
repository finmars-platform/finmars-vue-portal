import { defineStore } from "pinia";

export default defineStore({
	id: "global",
	state: () => {
		return {
			user: {},
			ws: null,
			masterUsers: [],
			masterUser: {},
			member: {},
			current: {},
			systemErrors: [],
		};
	},
	actions: {
		registerSysError (error) {
			this.systemErrors.push({
				created: new Date().toISOString(),
				location: window.location.href,
				text: JSON.stringify(error)
			})
		},
		async init() {

			await this.ping();

			this.getUser();
			this.getMasterUsers();

			window.onerror = this.registerSysError;

		},
		async getUser() {
			let res = await useApi('me.get')
			this.user = res

			if (!this.user.data) this.user.data = {};

			if (typeof this.user.data.autosave_layouts !== 'boolean') {
				this.user.data.autosave_layouts = true;
			}

		},
		async getMasterUsers() {
			let res = await useApi("masterUser.get");

			if (res.error) return;

			this.masterUsers = res.results;

			const activeMasterUser = this.masterUsers.find(item => item.id === this.current.current_master_user_id );

			if (activeMasterUser) {
				this.masterUser = activeMasterUser;
				this.current.name = activeMasterUser.name;
			}

			// this.current.name = this.masterUsers.find(item => item.id == this.current.current_master_user_id )?.name
		},

		setupMemberData (isReport, entityType) {

			if (!this.member.data) this.member.data = {};
			if (!this.member.data.group_tables) this.member.data.group_tables = {};

			if (!this.member.data.group_tables.entity_viewer) {
				this.member.data.group_tables.entity_viewer = {
					entity_viewers_settings: {}
				};
			}

			if (!this.member.data.group_tables.report_viewer) {
				this.member.data.group_tables.report_viewer = {
					entity_viewers_settings: {}
				};
			}

			const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
			let entityTypesSettings = this.member.data.group_tables[viewerType].entity_viewers_settings;

			if (!entityTypesSettings[entityType]) {

				entityTypesSettings[entityType] = {
					marked_rows: {},
					row_type_filter: 'none'
				};

			}

			return this.member;

		},

		setMemberEntityViewerSettings(settings, isReport, entityType) {

			const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
			/* let member = setUpMemberData(this.member, viewerType, entityType);

			member.data.group_tables[viewerType].entity_viewers_settings[entityType] = settings; */

			this.member.data.group_tables[viewerType].entity_viewers_settings[entityType] = settings;

		},

		async getMe() {
			const res = await useApi('member.get', {params: {id: 0}});

			if (res.error) {
				console.log('res.error:', res.error)

			} else {
				this.member = res;
			}
		},
		async ping() {
			let res = await useApi("ping.get")

			if ( res.error && res.code == '401' ) {
				let token = await useApi('tokenRefresh.post', {body: {
					refresh_token: useCookie('refresh_token').value }
				})

				if ( !token.error ) {
					useCookie('access_token').value = token.access_token

					await new Promise((rej) => {
						setTimeout(rej, 300)
					})
					res = await useApi("ping.get")
				} else {

					window.location.href = '/login'
				}
			}

			this.current = res
		},
	},
	getters: {
		memberEntityViewerSettings(state) {
			return (isReport, entityType) => {

				const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
				// let member = setUpMemberData(state.member, viewerType, entityType);

				return state.member.data.group_tables[viewerType].entity_viewers_settings[entityType];

			};
		},
	},
});
