import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

export const MinioConfig: S3ClientConfig = {
  region: 'us-east-1',
  endpoint: 'http://minio:9000/trinity',
  credentials: {
    accessKeyId: 'admin',
    secretAccessKey: 'password',
  },
  forcePathStyle: true,
};

export const MinioClient = new S3Client(MinioConfig);
