import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtraFields1713199203514 implements MigrationInterface {
    name = 'ExtraFields1713199203514';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`voice_data\` ADD \`loop\` enum ('none', 'one', 'all') NOT NULL DEFAULT 'none'`
        );
        await queryRunner.query(`ALTER TABLE \`voice_data\` ADD \`volume\` int NOT NULL DEFAULT '100'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`voice_data\` DROP COLUMN \`volume\``);
        await queryRunner.query(`ALTER TABLE \`voice_data\` DROP COLUMN \`loop\``);
    }
}
