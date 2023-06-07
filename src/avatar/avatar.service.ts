import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Avatar } from './schemas/avatar.schema';
import { Model } from 'mongoose';
import axios from 'axios';

import { createHash } from 'crypto';
import * as fs from 'fs';

@Injectable()
export class AvatarService {
  private readonly api = 'https://reqres.in/api';

  constructor(@InjectModel(Avatar.name) private avatarModel: Model<Avatar>) {}

  async findByUserId(userId: number): Promise<string> {
    const avatar = await this.avatarModel.findOne({ userId });

    if (avatar) {
      return avatar.base64;
    }

    try {
      const { data } = await axios.get(`${this.api}/users/${userId}`);
      const { avatar: urlImage } = data.data;

      const response = await axios.get(urlImage, {
        responseType: 'arraybuffer',
      });

      const bufferImage = Buffer.from(response.data, 'binary');
      const base64 = bufferImage.toString('base64');
      const hash = createHash('md5').update(bufferImage).digest('hex');

      await this.avatarModel.create({ userId, hash, base64 });

      await this.validateFolder();
      const fileName = `${userId}-${hash}.jpg`;
      await fs.promises.writeFile(`./images/${fileName}`, bufferImage);

      return base64;
    } catch (error) {
      throw new NotFoundException('Failed to get avatar');
    }
  }

  async remove(id: number): Promise<void> {
    const avatar = await this.avatarModel.findOneAndDelete({ userId: id });
    if (avatar) {
      try {
        await this.validateFolder();
        fs.promises.unlink(`./images/${id}-${avatar.hash}.jpg`);
      } catch (error) {
        throw new HttpException(
          'Failed to delete avatar',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async validateFolder(): Promise<void> {
    if (!fs.existsSync('./images')) {
      await fs.promises.mkdir('./images');
    }
  }
}
