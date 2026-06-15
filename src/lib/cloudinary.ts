import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'

export const cld = new Cloudinary({
  cloud: {
    cloudName: "dbz1gfsd0",
  },
  url: {
    secure: true,
  },
});

export function resolveImageUrl(raw: string | null | undefined, size = 80): string {
  if (!raw) return ''
 
  const uploadIdx = raw.indexOf('/upload/')
  if (uploadIdx === -1) return raw
 
  const afterUpload = raw.slice(uploadIdx + 8)
  const publicId = afterUpload.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '')
 
  try {
    return cld
      .image(publicId)
      .resize(fill().width(size).height(size).gravity(autoGravity()))
      .quality('auto')
      .format('auto')
      .toURL()
  } catch {
    return raw
  }
}