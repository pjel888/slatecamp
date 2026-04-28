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

  test('can access financials dashboard', async ({ page }) => {
    test.setTimeout(45000)
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
  })

  test('can access team overview', async ({ page }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/ceo/team')
    await expect(page).toHaveURL(/\/ceo\/team$/, { timeout: 15000 })

    await expect(page.locator('body')).toContainText('Team', {
      timeout: 15000,
    })
  })

  test('admin role manager loads and shows current admin users', async ({
    page,
  }) => {
    test.setTimeout(45000)
    await gotoAllowRedirectAbort(page, '/ceo/team/admin-roles')
    await expect(page).toHaveURL(/\/ceo\/team\/admin-roles$/, {
      timeout: 15000,
    })

    await expect(page.locator('body')).toContainText('Admin Roles', {
      timeout: 15000,
    })
    // In demo mode user_roles is seeded with the CEO role for the demo user
    await expect(page.locator('body')).toContainText('CEO', {
      timeout: 15000,
    })
  })

  test('can assign and revoke a role, with audit trail', async ({ page }) => {
    test.setTimeout(90000)

    // 1. Navigate to admin-roles
    await gotoAllowRedirectAbort(page, '/ceo/team/admin-roles')
    await expect(page).toHaveURL(/\/ceo\/team\/admin-roles$/, {
      timeout: 15000,
    })

    // 2. Assign a role to the test target user
    await page.locator('input#userId').fill(TEST_TARGET_USER_ID)

    // Open role select dropdown and choose "Developer"
    await page.locator('[data-radix-popper-content-wrapper] + button, button:has-text("Select role")').first().click().catch(() => {
      // Radix Select trigger may not have a stable selector; try clicking the trigger by proximity
      return page.getByRole('combobox').click()
    })
    await page.getByText('Developer', { exact: false }).click()

    await page.getByRole('button', { name: 'Assign Role' }).click()

    // Wait for the assignment to complete and the new row to appear
    await expect(
      page.locator('table tbody tr').filter({ hasText: 'Developer' }),
    ).toBeVisible({ timeout: 15000 })

    // 3. Revoke the role
    const revokeButton = page
      .locator('table tbody tr')
      .filter({ hasText: TEST_TARGET_USER_ID.slice(0, 8) })
      .filter({ hasText: 'Developer' })
      .getByRole('button', { name: 'Revoke' })

    await revokeButton.click()

    // Wait for the row to disappear
    await expect(
      page.locator('table tbody tr').filter({ hasText: 'Developer' }),
    ).toHaveCount(0, { timeout: 15000 })

    // 4. Verify audit trail in permission-audit
    await gotoAllowRedirectAbort(page, '/ceo/team/permission-audit')
    await expect(page).toHaveURL(/\/ceo\/team\/permission-audit$/, {
      timeout: 15000,
    })

    await expect(page.locator('body')).toContainText('Role Change History', {
      timeout: 15000,
    })

    // The assignment and revocation should both appear in the audit log
    await expect(page.locator('body')).toContainText('Assigned', {
      timeout: 15000,
    })
    await expect(page.locator('body')).toContainText('Revoked', {
      timeout: 15000,
    })

    // 5. Verify cross-portal audit visibility in admin activity feed
    await gotoAllowRedirectAbort(page, '/admin/activity')
    await expect(page).toHaveURL(/\/admin\/activity$/, { timeout: 15000 })

    await expect(page.locator('body')).toContainText('Activity Feed', {
      timeout: 15000,
    })

    // CEO actions are logged to audit_logs; activity feed queries audit_logs
    // and should show the most recent entries
    await expect(page.locator('body')).toContainText('user roles', {
      timeout: 15000,
    })
  })
})
