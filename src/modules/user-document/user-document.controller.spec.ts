import { Test, TestingModule } from '@nestjs/testing';
import { UserDocumentController } from './user-document.controller';
import { UserDocumentService } from './user-document.service';

describe('UserDocumentController', () => {
  let controller: UserDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDocumentController],
      providers: [UserDocumentService],
    }).compile();

    controller = module.get<UserDocumentController>(UserDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
