import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToFinancialEntities1794713060182 implements MigrationInterface {
    name = 'AddSoftDeleteToFinancialEntities1794713060182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cajas" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "pagada" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "pagada"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "cajas" DROP COLUMN "deletedAt"`);
    }

}
