import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface ToolCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  tag: string
}

export const ToolCard = ({ icon, title, description, href, tag }: ToolCardProps) => {
  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center justify-center size-10 rounded-md bg-primary/8 text-primary flex-shrink-0'>
            {icon}
          </div>
          <span className='text-[11px] font-medium text-primary bg-primary/8 rounded-sm px-2 py-0.5 leading-tight mt-0.5'>
            {tag}
          </span>
        </div>
        <CardTitle className='text-[15px] mt-2'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1' />
      <CardFooter className='border-t-0 bg-transparent pt-0'>
        <Link
          href={href}
          className='inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/80 transition-colors duration-150'
        >
          Try it free →
        </Link>
      </CardFooter>
    </Card>
  )
}
