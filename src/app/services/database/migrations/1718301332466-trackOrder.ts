import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrackOrder1718301332466 implements MigrationInterface {
    name = 'TrackOrder1718301332466';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`track\` ADD \`order\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`track\` DROP COLUMN \`order\``);
    }
}
