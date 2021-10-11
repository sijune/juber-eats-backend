import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UploadsController],
  imports: [ConfigService],
})
export class UploadsModule {}
