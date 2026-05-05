import { redirect } from 'next/navigation'

export const metadata = { title: 'Design Quiz' }

const DesignQuizPage = () => {
  redirect('/dashboard/quiz?mode=design')
}

export default DesignQuizPage
