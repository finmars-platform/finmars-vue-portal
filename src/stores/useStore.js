export default defineStore({
	id: 'global',
	state: () => {
		return {
			user: {},
			masterUsers: [],
			realms: [],
			current: {}, // master user
			realm_code: null,
			space_code: null,
			member: {},
			memberLayout: {},

			ws: null,

			ecosystemDefaults: {},
			configCodes: [],
			defaultConfigCode: null,
			systemErrors: []
		};
	},
	actions: {
		registerSysError(error) {
			this.systemErrors.push({
				created: new Date().toISOString(),
				location: window.location.href,
				text: JSON.stringify(error)
			});
		},
		async init() {

			const pathname = window.location.pathname;

			if (pathname.includes('/space')) {
				const pathnamePartsList = pathname.split('/');
				const realm_code = pathnamePartsList.find((part) =>
					part.startsWith('realm')
				);
				const space_code = pathnamePartsList.find((part) =>
					part.startsWith('space')
				);

				this.realm_code = realm_code;
				this.space_code = space_code;
			} else {
				console.warn('useStore.init: no space_code in the pathname' + pathname);
				// Throw error when we move profile to separate repository
				// throw new Error("useStore.init: no space_code in the pathname" + pathname);
			}

			this.getUser();



			await Promise.all([this.getMasterUsers(), this.getRealms()]);

			if (this.current) {
				// hack for reports
				window.base_api_url = this.current.base_api_url; // needed for angularjs components
			}
		},
		async getMasterUsers() {

			let config = useRuntimeConfig().public;

			let res;
			if (config.EDITION_TYPE == 'enterprise') {

				res = await useApi('masterUser.get');
			} else {
				res = {
					results: [
						{
							"id": 1,
							"name": "Local",
							"description": "Local Space",
							"status": 1,
							"timezone": "UTC",
							"is_initialized": true,
							"base_api_url": "space00000",
							"realm": 1,
							"realm_object": {
								"id": 1,
								"name": "Local Realm",
								"realm_code": "realm00000",
								"update_channel": "rc",
								"is_update_allowed": true,
								"status": "operational"
							},
							"space_code": "space00000",
							"realm_code": "realm00000",
							"is_update_available": true,
							"is_admin": true,
							"is_owner": true
						}
					]
				}
			}

			if (res._$error) return;

			this.masterUsers = res.results;

			/*const activeMasterUser = this.masterUsers.find((item) =>
				location.href.includes(item.base_api_url)
			)*/
			const activeMasterUser = this.masterUsers.find(
				(item) => this.space_code === item.base_api_url
			);

			if (activeMasterUser) {
				this.current = activeMasterUser;

				const res = await useApi('configurationList.get');

				if (!res._$error) {
					this.configCodes = res.results;
				}

				this.defaultConfigCode =
					this.configCodes.find((conf) => conf.is_primary)
						?.configuration_code || this.configCodes?.[0]?.configuration_code;
			}

			window.onerror = this.registerSysError;
		},
		async getRealms() {

			let config = useRuntimeConfig().public;

			let res;
			if (config.EDITION_TYPE == 'enterprise') {
				res = await useApi('realm.get');

			} else {
				res = {
					results: [{name: "Realm Local", "realm_code": "realm00000"}]
				}
			}

			if (res.error) return;

			this.realms = res.results;

			window.onerror = this.registerSysError;
		},

		async getTheme(user) {
			if (!user.data.theme) {
				// if no theme selected, use default one
				return;
			}

			// User selected specific theme

			const themePath = user.data.theme.split('.').join('/');
			const itemPath = `.system/ui/themes/${themePath}/theme.css`;

			try {
				const blob = await useApi('explorerViewFile.get', {
					filters: { path: itemPath },
					notifyError: false
				});

				// seems useApi somehow Parse blob already
				var styleElement = document.createElement('style');
				styleElement.textContent = blob;

				document.head.appendChild(styleElement);

				// const reader = new FileReader();
				//
				// reader.addEventListener("loadend", function (e) {
				//
				// 	var styleElement = document.createElement('style');
				// 	styleElement.textContent = reader.result;
				//
				// 	document.head.appendChild(styleElement);
				//
				// });
				//
				// reader.readAsText(blob);
			} catch (error) {
				console.error(
					'[portalController loadTheme] Could not fetch theme',
					error
				);
			}
		},

		async getUser() {
			let res;

			let config = useRuntimeConfig().public;

			console.log('config', config);

			if (config.EDITION_TYPE == 'enterprise') {
				res = await useApi('me.get');
			} else if (config.EDITION_TYPE == 'community') {
				const memberProm = await useApi('member.get', { params: { id: 0 } });
				res = memberProm.user
			}

			if (res._$error) {
				throw res._$error;
			}

			this.user = res;

			if (window._paq) {
				// Extract realm_code and space_code from URL
				const getCodesFromUrl = () => {
					const urlPath = window.location.pathname;
					const pathParts = urlPath.split('/');
					return {
						realmCode: pathParts[1] || 'unknown_realm',
						spaceCode: pathParts[2] || 'unknown_space',
					};
				};

				// Update Matomo tracking information
				const codes = getCodesFromUrl();
				if (codes.realmCode) {
					window._paq.push(['setCustomDimension', 1, codes.realmCode]);
				}
				if (codes.spaceCode) {
					window._paq.push(['setCustomDimension', 2, codes.spaceCode]);
				}

				if (this.user.username) {
					window._paq.push(['setUserId', this.user.username]);
				}

				// Track the initial page view after setting dimensions and user ID
				window._paq.push(['trackPageView']);
			}

			if (!this.user.data) this.user.data = { dark_mode: false };

			if (typeof this.user.data.autosave_layouts !== 'boolean') {
				this.user.data.autosave_layouts = true;
			}

			document.body.classList.toggle('dark-mode', this.user.data.dark_mode);

			if (this.user.data.dark_mode) {
				document.body.classList.add('dark-theme');
				document.body.classList.remove('light-theme');
			} else {
				document.body.classList.add('light-theme');
				document.body.classList.remove('dark-theme');
			}

			await this.getTheme(this.user);
		},
		async getMe() {
			const memberProm = useApi('member.get', { params: { id: 0 } });
			const memberLayoutProm = useApi('memberLayout.get', {
				filters: { is_default: true }
			});

			const res = await Promise.all([memberProm, memberLayoutProm]);

			if (res[0]._$error || res[1]._$error) {
				console.error(
					'Error while fetching data of member:',
					res[0]._$error || res[1]._$error
				);
			} else {
				let member = res[0];

				if (!member.data) {
					member.data = {};
				}

				let memberLayout = res[1].results[0];

				if (!memberLayout.data) {
					memberLayout.data = {};
				}

				if (typeof memberLayout.data.autosave_layouts !== 'boolean') {
					memberLayout.data.autosave_layouts = true;
				}

				if (!memberLayout.data.favorites) {
					memberLayout.data.favorites = {};
				}

				if (!memberLayout.data.favorites.transaction_type) {
					memberLayout.data.favorites.transaction_type = [];
				}

				if (!memberLayout.data.favorites.attributes) {
					memberLayout.data.favorites.attributes = {};
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
		async updateUser(user = this.user) {
			const options = {
				params: { id: user.id },
				body: user
			};

			const res = await useApi('user.put', options);

			if (res.error) {
				console.error(res.error);
			} else {
				this.user = res;
			}
		},
		async updateMember(member = this.member) {
			const options = {
				params: { id: member.id },
				body: member
			};

			const res = await useApi('member.put', options);

			if (res._$error) {
				console.error(res._$error);
			} else {
				this.member = res;
			}
		},

		async updateMemberLayout(memberLayout = this.memberLayout) {
			const options = {
				params: { id: memberLayout.id },
				body: memberLayout
			};

			const res = await useApi('memberLayout.put', options);

			if (res._$error) {
				console.error(res._$error);
			} else {
				this.memberLayout = res;
			}
		},

		async fetchEcosystemDefaults() {
			const res = await useApi('ecosystemDefaults.get');

			if (!res._$error) {
				this.ecosystemDefaults = res.results[0];
			}
		},

		setupMemberData(isReport, entityType) {
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
			let entityTypesSettings =
				this.member.data.group_tables[viewerType].entity_viewers_settings;

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

			this.member.data.group_tables[viewerType].entity_viewers_settings[
				entityType
			] = settings;
		}
	},
	getters: {
		memberEntityViewerSettings(state) {
			return (isReport, entityType) => {
				const viewerType = isReport ? 'report_viewer' : 'entity_viewer';
				// let member = setUpMemberData(state.member, viewerType, entityType);

				return state.member.data.group_tables[viewerType]
					.entity_viewers_settings[entityType];
			};
		},
		favorites(state) {
			return state.memberLayout.data.favorites;
		},
		isUrlValid(state) {
			return state.realm_code && state.space_code;
		},
		darkModeActive(state) {
			return state.user.data?.dark_mode;
		}
	}
});
