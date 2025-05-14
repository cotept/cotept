import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration20250514231013 implements MigrationInterface {
    name = 'Migration20250514231013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "mail_audits" (
                "id" varchar2(36),
                "mail_id" varchar2(255),
                "template" varchar2(255) NOT NULL,
                "recipients" clob NOT NULL,
                "status" varchar2(255) DEFAULT 'PENDING' NOT NULL,
                "sent_at" timestamp,
                "error" varchar2(255),
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "context" clob NOT NULL,
                "locale" varchar2(255) DEFAULT 'ko' NOT NULL,
                CONSTRAINT "PK_f2383fdc44696c8b3f07c309691" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "mail_audits"
        `);
    }

}
