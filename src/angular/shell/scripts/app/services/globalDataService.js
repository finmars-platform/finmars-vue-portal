/** @module globalDataService */

export default function () {
	const store = useStore()

	let userHaveCurrentMasterUser = false

	let data = {
		masterUser: store.current,
		member: store.member,
		user: store.user,
	}

	let iframeMode = false // used when app inside iframe

	const doUserHasCurrentMasterUser = function () {
		return userHaveCurrentMasterUser
	}

	/**
	 * Set whether user has current master user.
	 *
	 * @memberOf module:globalDataService
	 * @param currentMasterUserIsSet {boolean}
	 */
	const setCurrentMasterUserStatus = function (currentMasterUserIsSet) {
		userHaveCurrentMasterUser = currentMasterUserIsSet
	}

	const setUser = function (user) {
		data.user = user
	}

	const getUser = () => {
		return data.user
	}

	const setMasterUser = function (masterUser) {
		data.masterUser = masterUser
	}

	const getMasterUser = () => {
		return data.masterUser
	}

	const setMember = function (member) {
		data.member = member
	}

	const getMember = () => {
		return data.member
	}

	const setUpMemberData = (member, viewerType, entityType) => {
		if (!member.data) member.data = {}
		if (!member.data.group_tables) member.data.group_tables = {}

		if (!member.data.group_tables.entity_viewer) {
			member.data.group_tables.entity_viewer = {
				entity_viewers_settings: {},
			}
		}

		if (!member.data.group_tables.report_viewer) {
			member.data.group_tables.report_viewer = {
				entity_viewers_settings: {},
			}
		}

		let entityTypesSettings =
			member.data.group_tables[viewerType].entity_viewers_settings

		if (!entityTypesSettings[entityType]) {
			entityTypesSettings[entityType] = {
				marked_rows: {},
				row_type_filter: 'none',
			}
		}

		return member
	}

	const getMemberEntityViewersSettings = (isReport, entityType) => {
		const viewerType = isReport ? 'report_viewer' : 'entity_viewer'
		let member = setUpMemberData(data.member, viewerType, entityType)

		return JSON.parse(
			JSON.stringify(
				member.data.group_tables[viewerType].entity_viewers_settings[entityType]
			)
		)
	}

	const setMemberEntityViewersSettings = function (
		settings,
		isReport,
		entityType
	) {
		const viewerType = isReport ? 'report_viewer' : 'entity_viewer'
		let member = setUpMemberData(data.member, viewerType, entityType)

		member.data.group_tables[viewerType].entity_viewers_settings[entityType] =
			settings
	}

	const isAutosaveLayoutOn = function () {
		const user = getUser()
		const member = getMember()

		if (!member) {
			throw 'Method should be called after getting member'
		}

		if (!member.data) member.data = {}

		const autosave77 =
			user.data.autosave_layouts && member.data.autosave_layouts

		if (!autosave77) {
		}

		return autosave77
	}

	const clearAllData = function () {
		userHaveCurrentMasterUser = false

		for (const prop in data) {
			data[prop] = null
		}
	}

	const setIframeMode = function (modeStatus) {
		iframeMode = modeStatus
	}

	const insideIframe = function () {
		return iframeMode
	}

	return {
		setCurrentMasterUserStatus: setCurrentMasterUserStatus,
		doUserHasCurrentMasterUser: doUserHasCurrentMasterUser,

		setUser: setUser,
		getUser: getUser,
		setMasterUser: setMasterUser,
		getMasterUser: getMasterUser,
		setMember: setMember,
		getMember: getMember,
		getMemberEntityViewersSettings: getMemberEntityViewersSettings,
		setMemberEntityViewersSettings: setMemberEntityViewersSettings,

		isAutosaveLayoutOn: isAutosaveLayoutOn,

		clearAllData: clearAllData,

		setIframeMode: setIframeMode,
		insideIframe: insideIframe,
	}
}
