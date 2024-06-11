import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceData1718138157269 implements MigrationInterface {
    name = 'VoiceData1718138157269';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`playlist\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `CREATE TABLE \`track\` (\`id\` int NOT NULL AUTO_INCREMENT, \`provider_id\` varchar(256) NOT NULL, \`title\` varchar(256) NOT NULL, \`type\` enum ('unknown', 'youtube', 'spotify') NOT NULL DEFAULT 'unknown', \`length\` int NOT NULL, \`url\` varchar(256) NOT NULL, \`artist\` varchar(64) NOT NULL, \`user_id\` int NOT NULL, \`playlist_id\` int NULL, \`voice_data_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `CREATE TABLE \`voice_data\` (\`id\` int NOT NULL AUTO_INCREMENT, \`discord_guild_id\` varchar(24) NOT NULL, \`loop\` enum ('none', 'one', 'all') NOT NULL DEFAULT 'none', \`volume\` int NOT NULL DEFAULT '100', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `ALTER TABLE \`playlist\` ADD CONSTRAINT \`FK_a95382384c5ba920429ba111211\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE \`track\` ADD CONSTRAINT \`FK_7a53190ce0ee143164ae26025d7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE \`track\` ADD CONSTRAINT \`FK_bf00ebbea374feda42a43934939\` FOREIGN KEY (\`playlist_id\`) REFERENCES \`playlist\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE \`track\` ADD CONSTRAINT \`FK_89b0bac9354314c2c6f47494b7c\` FOREIGN KEY (\`voice_data_id\`) REFERENCES \`voice_data\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`track\` DROP FOREIGN KEY \`FK_89b0bac9354314c2c6f47494b7c\``);
        await queryRunner.query(`ALTER TABLE \`track\` DROP FOREIGN KEY \`FK_bf00ebbea374feda42a43934939\``);
        await queryRunner.query(`ALTER TABLE \`track\` DROP FOREIGN KEY \`FK_7a53190ce0ee143164ae26025d7\``);
        await queryRunner.query(`ALTER TABLE \`playlist\` DROP FOREIGN KEY \`FK_a95382384c5ba920429ba111211\``);
        await queryRunner.query(`DROP TABLE \`voice_data\``);
        await queryRunner.query(`DROP TABLE \`track\``);
        await queryRunner.query(`DROP TABLE \`playlist\``);
    }
}

