import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1701311434114 implements MigrationInterface {
    name = 'Initial1701311434114';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`activity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` varchar(128) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`activity\``);
    }
}
