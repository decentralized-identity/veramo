import React from 'react'
import { Image } from 'rimble-ui'
import md5 from 'md5'

interface AvatarProps {
  did: string
  source?: string
  size?: number
  type?: 'square' | 'rounded' | 'circle'
  highlight?: boolean
}

const Component: React.FC<AvatarProps> = ({ did, type, size, source, highlight }) => {
  const avatarSize = size || 40
  const avatarType = type || 'rounded'
  const radius = {
    square: 0,
    rounded: 5,
    circle: avatarSize / 2,
  }

  const gravatarType = 'identicon'
  const GRAVATAR_URI = 'https://www.gravatar.com/avatar/'
  const uri = GRAVATAR_URI + md5(did) + '?s=' + avatarSize * 2 + '&d=' + gravatarType
  const src = source || uri

  const highlighted = highlight ? { border: 1, padding: 1 } : {}

  return (
    <Image
      {...highlighted}
      borderColor={'#4a4a4a'}
      alt={`Avatar image for ${did}`}
      borderRadius={radius[avatarType]}
      height={avatarSize}
      width={avatarSize}
      src={src}
    />
  )
}

export default Component
