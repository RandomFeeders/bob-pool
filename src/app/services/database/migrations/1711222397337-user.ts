import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1711222397337 implements MigrationInterface {
    name = 'User1711222397337';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`discordId\` varchar(24) NOT NULL, \`locale\` varchar(5) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user\``);
    }
}
