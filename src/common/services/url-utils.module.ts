import { Module, Global } from '@nestjs/common';
import { UrlUtilsService } from './url-utils.service';

@Global()
@Module({
  providers: [UrlUtilsService],
  exports: [UrlUtilsService],
})
export class UrlUtilsModule {}