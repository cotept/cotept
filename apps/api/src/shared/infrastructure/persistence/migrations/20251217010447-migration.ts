import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration20251217010447 implements MigrationInterface {
    name = 'Migration20251217010447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "BAEKJOON_PROFILE"
            MODIFY "is_mentor_eligible" number(1) DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "BAEKJOON_PROFILE"
            MODIFY "is_mentor_eligible" number(1, 0) DEFAULT 0
        `);
    }

}
