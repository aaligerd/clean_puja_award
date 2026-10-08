import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'clean-puja-award-uploads';

/**
 * Sanitize committee name to a clean filesystem/S3 safe string
 */
export function sanitizeName(name) {
  if (!name) return 'unknown';
  // Keep Bengali & English alphanumeric characters, replace spaces/slashes with underscores
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 80);
}

/**
 * Generate S3 key following user path rule:
 * clean-pujo/{committee_name}/before or clean-pujo/{committee_name}/after
 */
export function generateS3Key({ committeeName, phase, originalFilename }) {
  const safeName = sanitizeName(committeeName);
  const subfolder = phase === 'DURING' ? 'before' : 'after';
  const fileExt = originalFilename ? originalFilename.split('.').pop().toLowerCase() : 'jpg';
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';

  return `clean-pujo/${safeName}/${subfolder}/${Date.now()}_${uniqueId}.${safeExt}`;
}

/**
 * Generate pre-signed URL for direct browser-to-S3 upload
 */
export async function getPresignedUploadUrl({ s3Key, contentType, expiresIn = 300 }) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, s3Key, bucket: BUCKET_NAME };
}

/**
 * Delete an object from S3
 */
export async function deleteS3Object(s3Key) {
  if (!s3Key) return;
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  return s3Client.send(command);
}

/**
 * Get display URL for an image (via CloudFront CDN or direct S3 public URL)
 */
export function getImageDisplayUrl(s3Key) {
  if (!s3Key) return '';
  if (process.env.AWS_CLOUDFRONT_DOMAIN) {
    const cdnBase = process.env.AWS_CLOUDFRONT_DOMAIN.replace(/\/$/, '');
    return `${cdnBase}/${s3Key}`;
  }
  const region = process.env.AWS_REGION || 'ap-south-1';
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;
}

export { s3Client, BUCKET_NAME };
