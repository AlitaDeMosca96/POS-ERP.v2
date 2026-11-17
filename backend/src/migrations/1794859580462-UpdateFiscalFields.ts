import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFiscalFields1794859580462 implements MigrationInterface {
    name = 'UpdateFiscalFields1794859580462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "cuitFactura"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "razonSocialFactura"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "numeroComprobante"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "caeSimulado"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "tipoFactura"`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" ADD "subtotal" numeric(14,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" ADD "alicuotaIva" numeric(14,2) NOT NULL DEFAULT '21'`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" ADD "ivaTotal" numeric(14,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "subtotal" numeric(14,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "ivaTotal" numeric(14,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "ivaTotal"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN "subtotal"`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" DROP COLUMN "ivaTotal"`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" DROP COLUMN "alicuotaIva"`);
        await queryRunner.query(`ALTER TABLE "pedido_detalles" DROP COLUMN "subtotal"`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "tipoFactura" character varying NOT NULL DEFAULT 'FACTURA_B'`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "caeSimulado" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "numeroComprobante" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "razonSocialFactura" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD "cuitFactura" character varying`);
    }

}
