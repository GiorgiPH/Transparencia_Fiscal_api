import { Module, Global } from '@nestjs/common';
import { FileDownloadService } from './file-download.service';

@Global()
@Module({
  providers: [FileDownloadService],
  exports: [FileDownloadService],
})
export class FileDownloadModule {}
