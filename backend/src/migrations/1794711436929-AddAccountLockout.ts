import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountLockout1794711436929 implements MigrationInterface {
    name = 'AddAccountLockout1794711436929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "intentosFallidos" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "bloqueadoHasta" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "bloqueadoHasta"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "intentosFallidos"`);
    }

}
