import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1718136072541 implements MigrationInterface {
    name = 'Initial1718136072541';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`discord_id\` varchar(24) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `CREATE TABLE \`activity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` varchar(128) NOT NULL, \`lang\` varchar(8) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('Não cometemos erros, apenas pequenos acidentes felizes.', 'pt-BR')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('Não há nada de errado em ter uma árvore como amiga.', 'pt-BR')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('Vamos enlouquecer juntos.', 'pt-BR')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('Meu Deus! Como eu amo cocaina!', 'pt-BR')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('We don\\'t make mistakes, just little happy accidents.', 'en-US')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('There\\'s nothing wrong with having a tree as a friend.', 'en-US')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('Let\\'s go crazy together.', 'en-US')`
        );
        await queryRunner.query(
            `INSERT INTO \`activity\` (\`value\`, \`lang\`) VALUES ('God! I love cocaine!', 'en-US')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`activity\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }
}

