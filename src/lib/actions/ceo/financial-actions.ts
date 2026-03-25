'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { createClient } from '@/lib/supabase/server'

const financialEntrySchema = z.object({
  entry_date: z.string().date(),
  entry_type: z.enum(['revenue', 'expense', 'investment']),
  category: z.string().min(1),
  amount_php: z.coerce.number().positive().max(100_000_000),
  description: z.string().max(500).optional(),
  is_recurring: z.coerce.boolean().default(false),
})

export const addFinancialEntry = async (
  formData: FormData,
): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    const { user } = await assertCeoRole()

    const parsed = financialEntrySchema.safeParse({
      entry_date: formData.get('entry_date'),
      entry_type: formData.get('entry_type'),
      category: formData.get('category'),
      amount_php: formData.get('amount_php'),
      description: formData.get('description') || undefined,
      is_recurring: formData.get('is_recurring') === 'true' || formData.get('is_recurring') === 'on',
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ceo_financial_entries')
      .insert({ ...parsed.data, created_by: user.id })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/financials')
    revalidatePath('/ceo')
    return { success: true, id: data?.id as string }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export const updateFinancialEntry = async (
  formData: FormData,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    const id = formData.get('id') as string
    if (!id) return { success: false, error: 'Missing id' }

    const parsed = financialEntrySchema.safeParse({
      entry_date: formData.get('entry_date'),
      entry_type: formData.get('entry_type'),
      category: formData.get('category'),
      amount_php: formData.get('amount_php'),
      description: formData.get('description') || undefined,
      is_recurring: formData.get('is_recurring') === 'true' || formData.get('is_recurring') === 'on',
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_financial_entries')
      .update(parsed.data)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/financials')
    revalidatePath('/ceo')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export const deleteFinancialEntry = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    if (!id) return { success: false, error: 'Missing id' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_financial_entries')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/financials')
    revalidatePath('/ceo')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

const cashBalanceSchema = z.object({
  balance_date: z.string().date(),
  amount_php: z.coerce.number().positive(),
  notes: z.string().max(500).optional(),
})

export const addCashBalance = async (
  formData: FormData,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await assertCeoRole()

    const parsed = cashBalanceSchema.safeParse({
      balance_date: formData.get('balance_date'),
      amount_php: formData.get('amount_php'),
      notes: formData.get('notes') || undefined,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('ceo_cash_balance_entries')
      .upsert(parsed.data, { onConflict: 'balance_date' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/ceo/financials')
    revalidatePath('/ceo')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
