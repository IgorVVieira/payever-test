import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';

@Controller('api')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('/user/:id/avatar')
  async findByUserId(@Param('id') id: string) {
    return await this.avatarService.findByUserId(+id);
  }

  @Delete('/user/:id/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.avatarService.remove(+id);
  }
}
