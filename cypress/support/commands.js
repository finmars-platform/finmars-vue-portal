
Cypress.Commands.add('getByData', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args)
})

// Login
Cypress.Commands.add('setToken', (
	username = 'dev_apriakhin',
	password = '02nxmv8ow4lb0tfm'
) => {
	cy.session([username, password], () => {
		cy.request({
			method: 'POST',
			url: "https://dev.finmars.com/authorizer/token-auth/",
			headers: {
				'Content-type': 'application/json'
			},
			body: {
				username,
				password,
			}
		}).then(({ body }) => {
      cy.setCookie("access_token", body.access_token);
			cy.setActiveMasterUser()
		})
	})
})

Cypress.Commands.add('setActiveMasterUser', (
	master_user_uuid = 'a9957bed-580c-41be-b57b-956cd22884d0'
) => {
	cy.getCookie('access_token')
		.should('exist')
		.then((cookie) => {
			cy.request({
				method: 'PATCH',
				url: "https://dev.finmars.com/authorizer/master-user/"+master_user_uuid+"/set-current/",
				headers: {
					'Authorization': 'Token ' + cookie.value,
					'Content-type': 'application/json'
				}
			})
		})
})
