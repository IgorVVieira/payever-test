import { Test, TestingModule } from '@nestjs/testing';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';

describe('AvatarController', () => {
  let controller: AvatarController;
  let avatarService: AvatarService;

  beforeEach(async () => {
    const avatarServiceMock: Partial<AvatarService> = {
      findByUserId: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [
        {
          provide: AvatarService,
          useValue: avatarServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AvatarController>(AvatarController);
    avatarService = module.get<AvatarService>(AvatarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find the avatar by user ID and return it', async () => {
      const userId = '1';
      const avatarBase64 = 'base64-encoded-avatar';

      (avatarService.findByUserId as jest.Mock).mockResolvedValue(avatarBase64);

      const result = await controller.findByUserId(userId);

      expect(avatarService.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(avatarBase64);
    });
  });

  describe('remove', () => {
    it('should remove the avatar by user ID and return no content', async () => {
      const userId = '1';

      const removeSpy = jest.spyOn(avatarService, 'remove').mockResolvedValue();

      const result = await controller.remove(userId);

      expect(avatarService.remove).toHaveBeenCalledWith(1);
      expect(removeSpy).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
