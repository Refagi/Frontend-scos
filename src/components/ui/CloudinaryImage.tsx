
import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { resolveImageUrl } from '@/lib/cloudinary'

interface CloudinaryImageProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
  fallbackIcon?: React.ReactNode
}

export default function CloudinaryImage({
  src,
  alt,
  size = 48,
  className = '',
  fallbackIcon,
}: CloudinaryImageProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div
        className={`w-[${size}px] h-[${size}px] rounded-xl bg-surface-100 dark:bg-navy-700 
                    flex items-center justify-center flex-shrink-0 ${className}`}
      >
        {fallbackIcon ?? <UtensilsCrossed className="w-5 h-5 text-surface-400" />}
      </div>
    )
  }

  const imageUrl = resolveImageUrl(src)

  return (
    <img
      src={imageUrl}
      alt={alt}
      onError={() => setErrored(true)}
      className={`w-[${size}px] h-[${size}px] rounded-xl object-cover 
                  bg-surface-100 dark:bg-navy-700 flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}