"use server"

interface ContactFormState {
  success: boolean
  error?: string
}

export const sendContactMessage = async (_prev: ContactFormState, formData: FormData): Promise<ContactFormState> => {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
      return { success: false, error: 'All fields are required.' }
    }

    // TODO: integrate email provider (Resend)

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
