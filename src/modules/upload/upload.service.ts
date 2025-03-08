import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { VALUE } from '@shared/constants/constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Document } from '@modules/document/entities/document.entity';
import { UserDocument } from '@modules/user-document/entities/user-document.entity';
import {
  DocumentStatus,
  SignatureStatus,
  UserDocumentType,
} from '@shared/constants/enum';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}

  private awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
    endpoint: process.env.AWS_ENDPOINT,
  };
  private s3Client = new S3Client({
    region: this.awsConfig.region,
    endpoint: this.awsConfig.endpoint,
    credentials: {
      accessKeyId: this.awsConfig.accessKeyId,
      secretAccessKey: this.awsConfig.secretAccessKey,
    },
  });

  async uploadFileFromDisk(
    filePath: string,
    mimeType: string,
    folder: string,
    title: string,
    user: string,
  ): Promise<Document> {
    const fileName = path.basename(filePath);

    const params: PutObjectCommandInput = {
      Bucket: this.awsConfig.bucketName,
      Key: `${VALUE.rootFolder}/${folder}/${fileName}`,
      Body: await fs.readFile(filePath),
      ContentType: mimeType,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const document = await this.documentRepository.save({
        base_url: process.env.CDN_ENDPOINT,
        root: `${VALUE.rootFolder}/`,
        folder: `${folder}/`,
        name: fileName,
        title: title,
        status: DocumentStatus.IN_PROCESS,
      });

      await this.userDocumentRepository.save({
        user: { id: user },
        document: { id: document.id },
        role: 'Role 1',
        sequence: 1,
        type: UserDocumentType.OWNER,
        status: SignatureStatus.PENDING,
      });

      return plainToInstance(Document, document);
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async uploadSignatureFromDisk(
    document: string,
    filePath: string,
    mimeType: string,
    folder: string,
    user: string,
  ): Promise<UserDocument> {
    const fileName = path.basename(filePath);

    const params: PutObjectCommandInput = {
      Bucket: this.awsConfig.bucketName,
      Key: `${VALUE.rootFolder}/${folder}/${fileName}`,
      Body: await fs.readFile(filePath),
      ContentType: mimeType,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      await this.userDocumentRepository.update(
        {
          document: { id: document },
          user: { id: user },
        },
        {
          base_url: process.env.CDN_ENDPOINT,
          root: `${VALUE.rootFolder}/`,
          folder: `${folder}/`,
          name: fileName,
          status: SignatureStatus.SIGNED,
        },
      );

      const result = await this.userDocumentRepository.findOne({
        where: {
          document: { id: document },
          user: { id: user },
        },
        relations: { document: true },
      });

      return plainToInstance(UserDocument, result);
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async mergeSignature(
    userDocument: UserDocument,
    mergedPdfBytes,
    newFileName: string,
  ) {
    // Upload the merged PDF back to S3
    const mergedPdfKey = `${userDocument.root}${userDocument.document.folder}${newFileName}`;
    const params: PutObjectCommandInput = {
      Bucket: this.awsConfig.bucketName,
      Key: mergedPdfKey,
      Body: Buffer.from(mergedPdfBytes),
      ContentType: 'application/pdf',
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      // delete the old signature file from S3
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: `${userDocument.root}${userDocument.folder}${userDocument.name}`,
        }),
      );
      // update new name to document
      await this.documentRepository.update(
        { id: userDocument.document.id },
        { name: newFileName },
      );
    } catch (error) {
      throw new Error(`Failed to upload merged PDF to S3: ${error.message}`);
    }
  }
}
