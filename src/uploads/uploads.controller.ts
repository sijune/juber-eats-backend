import { Controller, Injectable, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

const BUCKET_NAME = 'jubereats-uploads';

@Injectable()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: this.config.get('ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('SECRET_ACCESS_KEY'),
      },
    });
    try {
      // 버킷 생성
      //   const upload = await new AWS.S3()
      //     .createBucket({
      //       Bucket: BUCKET_NAME,
      //     })
      //     .promise();

      // 파일업로드
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      return null;
    }
  }
}
