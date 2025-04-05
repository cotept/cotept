import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration20250405150127 implements MigrationInterface {
    name = 'Migration20250405150127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "USERS" (
                "user_id" varchar2(36) NOT NULL,
                "email" varchar2(100) NOT NULL,
                "password_hash" varchar2(255) NOT NULL,
                "salt" varchar2(100) NOT NULL,
                "role" varchar2(20) DEFAULT 'MENTEE' NOT NULL,
                "status" varchar2(20) DEFAULT 'ACTIVE' NOT NULL,
                "phone_number" varchar2(20),
                "phone_verified" number DEFAULT 0 NOT NULL,
                "ci_hash" varchar2(255),
                "di_hash" varchar2(255),
                "name" varchar2(100),
                "birth_date" varchar2(10),
                "gender" varchar2(1),
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "last_login_at" timestamp,
                CONSTRAINT "UQ_a1689164dbbcca860ce6d17b2e1" UNIQUE ("email"),
                CONSTRAINT "PK_551cbf43600418b23a3ea02d26a" PRIMARY KEY ("user_id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "USERS"
        `);
    }

}
