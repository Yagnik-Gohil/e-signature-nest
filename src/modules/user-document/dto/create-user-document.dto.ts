import { ISignatureBox } from '@shared/constants/types';

export class CreateUserDocumentDto {
  user: string;
  document: string;
  role: string;
}
export class CreateSignatureBoxDto {
  user_document: {
    id: string;
    signature_box: ISignatureBox;
  }[];
}
