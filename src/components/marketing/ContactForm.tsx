'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { SubmitButton } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { sendContactMessage } from '@/lib/actions/contact'

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Partnership',
  'Other',
] as const

const initialState = { success: false, error: undefined }

const ContactForm = () => {
  const [state, action] = useActionState(sendContactMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <div className="max-w-screen-md mx-auto">
      {state.success && (
        <Alert variant="success" className="mb-6">
          <AlertTitle>Message sent!</AlertTitle>
          <AlertDescription>
            Thanks for reaching out. We'll get back to you as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form ref={formRef} action={action} noValidate>
        <div className="space-y-4">
          <FormField label="Name" htmlFor="contact-name" required>
            <Input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </FormField>

          <FormField label="Email" htmlFor="contact-email" required>
            <Input
              id="contact-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Subject" htmlFor="contact-subject" required>
            <select
              id="contact-subject"
              name="subject"
              required
              defaultValue=""
              className="w-full h-9 rounded-sm border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            >
              <option value="" disabled>Select a subject</option>
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Message" htmlFor="contact-message" required>
            <Textarea
              id="contact-message"
              name="message"
              placeholder="How can we help you?"
              required
              rows={5}
            />
          </FormField>

          <div className="pt-2">
            <SubmitButton pendingLabel="Sending..." fullWidth>
              Send Message
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}

export { ContactForm }
