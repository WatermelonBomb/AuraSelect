import * as React from "react"

interface ShampooIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function ShampooIcon({ size = 24, ...props }: ShampooIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h12l2 6-2 6H6l-2-6z" />
      <path d="M8 9h8" />
      <path d="M8 15h8" />
      <path d="M12 3v18" />
    </svg>
  )
} 