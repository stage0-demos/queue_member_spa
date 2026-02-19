// Cypress E2E support file
// This is loaded before every test file

// Add custom commands
Cypress.Commands.add('login', (roles?: string[]) => {
  cy.visit('/login')
  cy.get('[data-automation-id="login-submit-button"]', { timeout: 5000 }).should('be.visible')
  if (roles && roles.length > 0) {
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear()
    cy.get('[data-automation-id="login-roles-input"]').find('input').type(roles.join(','))
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear().type(roles.join(','))
  }
  cy.get('[data-automation-id="login-submit-button"]').click()
  cy.url().should('not.include', '/login')
  cy.url({ timeout: 10000 }).should('not.include', '/login')
  cy.wait(300)
})

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(roles?: string[]): Chainable<void>
    }
  }
}

export {}
