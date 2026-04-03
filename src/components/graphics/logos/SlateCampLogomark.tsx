import { cn } from '@/lib/utils'

interface LogomarkProps {
  className?: string
  size?: number | string
}

/**
 * SlateCamp Logomark Component
 * Extracted from SlateCampLogoMark.svg for flexible UI usage.
 */
export const SlateCampLogomark = ({ className, size = 24 }: LogomarkProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <path
        d="M579.57,411.57l52.19-52.19c6.74-6.74,6.74-17.66,0-24.4l-39.24-39.24c-6.74-6.74-17.66-6.74-24.4,0l-87.65,87.65c-13.09,13.09-35.46,3.82-35.46-14.69v-123.96c0-9.53-7.72-17.25-17.25-17.25h-55.5c-9.53,0-17.25,7.72-17.25,17.25v73.8c0,37.02-44.75,55.55-70.93,29.38l-52.19-52.19c-6.74-6.74-17.66-6.74-24.4,0l-39.24,39.24c-6.74,6.74-6.74,17.66,0,24.4l87.65,87.65c13.09,13.09,3.82,35.46-14.69,35.46h-123.96c-9.53,0-17.25,7.72-17.25,17.25v42.75c0,16.57,13.43,30,30,30h68.76c51.05,0,99.99-21.42,133.84-59.64,16.49-18.62,40.57-59.42,67.4-59.42,26.83,0,50.91,40.8,67.4,59.42,33.85,38.22,82.79,59.64,133.84,59.64h68.76c16.57,0,30-13.43,30-30v-42.75c0-9.53-7.72-17.25-17.25-17.25h-73.8c-37.02,0-55.55-44.75-29.38-70.93Z"
        fill="currentColor"
      />
    </svg>
  )
}
