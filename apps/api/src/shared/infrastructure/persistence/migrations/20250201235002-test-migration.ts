import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigration20250201235002 implements MigrationInterface {
    name = 'TestMigration20250201235002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "auth"."users_role_enum" AS ENUM('MENTEE', 'MENTOR', 'ADMIN')
        `);
        await queryRunner.query(`
            CREATE TYPE "auth"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth"."users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "phone_number" character varying(20) NOT NULL,
                "password_hash" character varying(100) NOT NULL,
                "role" "auth"."users_role_enum" NOT NULL DEFAULT 'MENTEE',
                "status" "auth"."users_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "login_fail_count" integer NOT NULL DEFAULT '0',
                "last_login_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "auth"."users"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."users_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "auth"."users_role_enum"
        `);
    }

}
