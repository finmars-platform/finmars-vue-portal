const loginByForm = (
	username = Cypress.env('username'),
	password = Cypress.env('password')
) => {
	cy.get('.material-input-container input').eq(0).type(username)
	cy.get('.material-input-container input').eq(1).type(password)
	cy.get('#kc-form-buttons input[name="login"]').click()
}

const checkError = () => {
	cy.intercept('GET', '/authorizer/master-user/', cy.spy().as('load'))
	cy.get('@load', { timeout: 50000 } ).should('not.have.been.called')
	cy.get('#input-error').should('be.visible')
}


describe('Login page', () => {
	beforeEach(() => {
		cy.viewport(1400, 600)
		cy.visit(Cypress.env('loginUrl'))
		cy.wait(500)
	})

  it('Login by finmars', () => {
		loginByForm()

		cy.intercept('GET', '/authorizer/master-user/').as('load')
		cy.wait('@load', { timeout: 50000 })
	})

	it('Incorrect password by finmars', () => {
		loginByForm( Cypress.env('username'), 'asdfdsaf' )

		checkError()
	})

	it('Incorrect login by finmars', () => {
		loginByForm( 'sadfdsf', Cypress.env('password') )

		checkError()
	})

	it('Incorrect login and password by finmars', () => {
		loginByForm( 'sadfdsf', 'asdfdsaf' )

		checkError()
	})
})
