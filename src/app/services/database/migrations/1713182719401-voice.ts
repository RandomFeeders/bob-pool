import { MigrationInterface, QueryRunner } from 'typeorm';

export class Voice1713182719401 implements MigrationInterface {
    name = 'Voice1713182719401';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`playlist\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `CREATE TABLE \`voice_data\` (\`id\` int NOT NULL AUTO_INCREMENT, \`discord_guild_id\` varchar(24) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(`ALTER TABLE \`user\` RENAME COLUMN \`discordId\` TO \`discord_id\`;`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`locale\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`name\` varchar(128) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`title\` varchar(256) NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE \`playlist\` ADD \`type\` enum ('unknown', 'youtube', 'spotify') NOT NULL DEFAULT 'unknown'`
        );
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`length\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`url\` varchar(256) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`artist\` varchar(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`playlist_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`voice_data_id\` int NULL`);
        await queryRunner.query(
            `ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_a95382384c5ba920429ba111211\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_1dd12c5a1ee7a0e0638a40712e2\` FOREIGN KEY (\`playlist_id\`) REFERENCES \`playlist\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_bd498bec7421e70b5546ff8d17c\` FOREIGN KEY (\`voice_data_id\`) REFERENCES \`voice_data\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_bd498bec7421e70b5546ff8d17c\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_1dd12c5a1ee7a0e0638a40712e2\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_a95382384c5ba920429ba111211\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`voice_data_id\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`playlist_id\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`artist\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`url\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`length\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` ADD \`name\` varchar(128) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`locale\` varchar(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` RENAME COLUMN \`discord_id\` TO \`discordId\`;`);
        await queryRunner.query(`DROP TABLE \`voice_data\``);
        await queryRunner.query(`DROP TABLE \`playlist\``);
    }
}
