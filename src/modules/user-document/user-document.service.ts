import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { UpdateUserDocumentDto } from './dto/update-user-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDocument } from './entities/user-document.entity';
import { FindManyOptions, IsNull, Not, Repository } from 'typeorm';
import { SignatureStatus, UserDocumentType } from '@shared/constants/enum';
import { MESSAGE } from '@shared/constants/constant';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserDocumentService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}
  async create(createUserDocumentDto: CreateUserDocumentDto) {
    const isExists = await this.userDocumentRepository.findOne({
      where: {
        user: { id: createUserDocumentDto.user },
        document: { id: createUserDocumentDto.document },
      },
    });

    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Recipient'));
    }

    const count = await this.userDocumentRepository.count({
      where: { document: { id: createUserDocumentDto.document } },
    });

    const result = await this.userDocumentRepository.save({
      user: { id: createUserDocumentDto.user },
      document: { id: createUserDocumentDto.document },
      role: createUserDocumentDto.role,
      sequence: count + 1,
      type: UserDocumentType.SIGNER,
    });

    return plainToInstance(UserDocument, result);
  }

  async findAll(
    limit: number,
    offset: number,
    document: string,
  ): Promise<[UserDocument[], number]> {
    const query = `
      WITH owner_data AS (
          SELECT user_id AS owner_id
          FROM user_document
          WHERE type = 'owner' AND document_id = $1 and deleted_at IS NULL
      ),
      contacts AS (
          SELECT c.recipient_id, c.recipient_name
          FROM contact c
          JOIN owner_data o ON c.owner_id = o.owner_id
          WHERE c.deleted_at IS NULL
      )
      SELECT 
          ud.id,
          ud.role,
          ud.sequence,
          u.id as user_id,
          CASE 
              WHEN ud.type = 'owner' THEN u.name
              WHEN ud.type = 'signer' THEN c.recipient_name
          END AS name,
          u.email
      FROM user_document ud
      JOIN "user" u ON ud.user_id = u.id
      LEFT JOIN contacts c ON ud.user_id = c.recipient_id
      WHERE ud.document_id = $1 AND ud.deleted_at IS NULL
      ORDER BY ud.sequence
      LIMIT $2 OFFSET $3;
    `;

    const [list, count] = await Promise.all([
      this.userDocumentRepository.query(query, [document, limit, offset]),
      this.userDocumentRepository.count({
        where: { document: { id: document } },
      }),
    ]);

    return [list, count];
  }

  async findAllDocuments(
    limit: number,
    offset: number,
    user: string,
  ): Promise<[Document[], number]> {
    const query = `
        WITH filtered_documents AS (
            SELECT DISTINCT d.id
            FROM document d
            JOIN user_document ud ON d.id = ud.document_id
            WHERE ud.user_id = $1
            AND (
                (ud.type = 'owner') 
                OR 
                (ud.type = 'signer' AND ud.status != 'draft')
            )
        )
        SELECT 
            d.id, 
            d.title, 
            d.base_url, 
            d.root, 
            d.folder, 
            d.name,
            d.status,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', ud.id,
                        'status', ud.status,
                        'role', ud.role,
                        'type', ud.type,
                        'sequence', ud.sequence,
                        'user', json_build_object(
                            'id', u.id,
                            'name', u.name,
                            'email', u.email
                        )
                    ) ORDER BY ud.sequence
                ) FILTER (WHERE ud.id IS NOT NULL), '[]'
            ) AS user_documents
        FROM document d
        JOIN user_document ud ON d.id = ud.document_id
        JOIN "user" u ON ud.user_id = u.id
        WHERE d.id IN (SELECT id FROM filtered_documents)
        GROUP BY d.id, d.title, d.base_url, d.root, d.folder, d.name
        ORDER BY d.created_at DESC
        LIMIT $2 OFFSET $3;
    `;

    const [list, count] = await Promise.all([
      this.userDocumentRepository.query(query, [user, limit, offset]),
      this.userDocumentRepository.count({
        where: [
          { user: { id: user }, type: UserDocumentType.OWNER },
          {
            user: { id: user },
            type: UserDocumentType.SIGNER,
            status: Not(SignatureStatus.DRAFT),
          },
        ],
      }),
    ]);

    return [list, count];
  }

  async document(id: string, user: string): Promise<Document> {
    const query = `
      SELECT 
        d.id, 
        d.title, 
        d.base_url, 
        d.root, 
        d.folder, 
        d.name,
        d.status,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', ud.id,
                    'status', ud.status,
                    'role', ud.role,
                    'type', ud.type,
                    'sequence', ud.sequence,
                    'user', json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'email', u.email
                    )
                ) ORDER BY ud.sequence
            ) FILTER (WHERE ud.id IS NOT NULL), '[]'
        ) AS user_documents
      FROM document d
      JOIN user_document ud ON d.id = ud.document_id
      JOIN "user" u ON ud.user_id = u.id
      WHERE d.id = $1
        AND ud.user_id = $2
        AND (
          ud.type = 'owner' 
          OR (ud.type = 'signer' AND ud.status != 'draft')
        )
      GROUP BY d.id, d.title, d.base_url, d.root, d.folder, d.name;
    `;

    const [result] = await this.userDocumentRepository.query(query, [id, user]);

    return result;
  }

  async update(id: string, updateUserDocumentDto: UpdateUserDocumentDto) {
    const result = await this.userDocumentRepository.update(
      { id: id },
      { role: updateUserDocumentDto.role },
    );
    return result;
  }

  async updateSequence(
    id: string,
    updateUserDocumentDto: UpdateUserDocumentDto,
  ) {
    const { sequence: newSequence } = updateUserDocumentDto;

    // Get the current record
    const currentRecord = await this.userDocumentRepository.findOne({
      where: { id },
      relations: ['document'], // Ensure document relation is included
    });

    if (!currentRecord) {
      throw new BadRequestException(MESSAGE.METHOD_NOT_ALLOWED);
    }

    const oldSequence = currentRecord.sequence;
    const documentId = currentRecord.document.id; // Assuming relation exists

    if (oldSequence === newSequence) {
      throw new BadRequestException('No changes needed');
    }

    // Adjust sequence values for other records
    if (oldSequence < newSequence) {
      // Moving down: Shift up affected items
      await this.userDocumentRepository
        .createQueryBuilder()
        .update(UserDocument)
        .set({ sequence: () => 'sequence - 1' }) // Decrease sequence by 1
        .where(
          'sequence > :oldSeq AND sequence <= :newSeq AND document_id = :docId',
          {
            oldSeq: oldSequence,
            newSeq: newSequence,
            docId: documentId,
          },
        )
        .execute();
    } else {
      // Moving up: Shift down affected items
      await this.userDocumentRepository
        .createQueryBuilder()
        .update(UserDocument)
        .set({ sequence: () => 'sequence + 1' }) // Increase sequence by 1
        .where(
          'sequence >= :newSeq AND sequence < :oldSeq AND document_id = :docId',
          {
            oldSeq: oldSequence,
            newSeq: newSequence,
            docId: documentId,
          },
        )
        .execute();
    }

    // Finally, update the selected record's sequence
    const result = await this.userDocumentRepository.update(
      { id },
      { sequence: newSequence },
    );

    return result;
  }

  async remove(id: string) {
    const result = await this.userDocumentRepository.softDelete({
      id: id,
      deleted_at: IsNull(),
    });

    return result;
  }
}
