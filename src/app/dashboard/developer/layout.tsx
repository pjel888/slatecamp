import { redirect } from 'next/navigation'

export default function OldDeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  redirect('/developer')
}
