import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecetaSnapshotToPedidoDetalle1794713600000 implements MigrationInterface {
  name = 'AddRecetaSnapshotToPedidoDetalle1794713600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedido_detalles" ADD "recetaSnapshot" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedido_detalles" DROP COLUMN "recetaSnapshot"`);
  }
}