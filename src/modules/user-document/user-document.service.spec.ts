import { Test, TestingModule } from '@nestjs/testing';
import { UserDocumentService } from './user-document.service';

describe('UserDocumentService', () => {
  let service: UserDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDocumentService],
    }).compile();

    service = module.get<UserDocumentService>(UserDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
