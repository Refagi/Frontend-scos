import { Cloudinary } from "@cloudinary/url-gen";

export const cld = new Cloudinary({
  cloud: {
    cloudName: "dbz1gfsd0",
  },
  url: {
    secure: true,
  },
});

export { resolveImageUrl } from '@/lib/resolveImageUrl';
