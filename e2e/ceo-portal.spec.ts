import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

const TEST_TARGET_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

test.describe('ceo control plane and audit logging', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run CEO portal coverage.',
  )

  test('can access CEO surfaces and exercise admin-role audit flow', async ({
    page,
  }) => {
    test.setTimeout(180000)

    await gotoAllowRedirectAbort(page, '/ceo/financials')
    await expect(page).toHaveURL(/\/ceo\/financials$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText('Financials', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Cash on Hand', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Monthly P&L', {
      timeout: 15000,
    })

    await gotoAllowRedirectAbort(page, '/ceo/team')
    await expect(page).toHaveURL(/\/ceo\/team$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText('Team', {
      timeout: 15000,
    })

    await gotoAllowRedirectAbort(page, '/ceo/team/admin-roles')
    await expect(page).toHaveURL(/\/ceo\/team\/admin-roles$/, {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Admin Roles', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('CEO', {
      timeout: 15000,
    })
    await expect(page.getByTestId('ceo-admin-role-manager')).toHaveAttribute(
      'data-hydrated',
      'true',
      { timeout: 30000 },
    )

    await page.locator('input#userId').fill(TEST_TARGET_USER_ID)
    await page.getByRole('combobox', { name: 'Role' }).selectOption('developer')

    const assignRoleButton = page.getByRole('button', { name: 'Assign Role' })
    await expect(assignRoleButton).toBeEnabled({ timeout: 15000 })
    await assignRoleButton.click()

    await expect(
      page.locator('table tbody tr').filter({ hasText: 'Developer' }),
    ).toBeVisible({ timeout: 15000 })

    const revokeButton = page
      .locator('table tbody tr')
      .filter({ hasText: TEST_TARGET_USER_ID.slice(0, 8) })
      .filter({ hasText: 'Developer' })
      .getByRole('button', { name: 'Revoke' })

    await revokeButton.click()
    await expect(
      page.locator('table tbody tr').filter({ hasText: 'Developer' }),
    ).toHaveCount(0, { timeout: 15000 })

    await gotoAllowRedirectAbort(page, '/ceo/team/permission-audit')
    await expect(page).toHaveURL(/\/ceo\/team\/permission-audit$/, {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Role Change History', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Assigned', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Revoked', {
      timeout: 15000,
    })

    await gotoAllowRedirectAbort(page, '/admin/activity')
    await expect(page).toHaveURL(/\/admin\/activity$/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText('Activity Feed', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText(/User Role/i, {
      timeout: 15000,
    })
  })
})
