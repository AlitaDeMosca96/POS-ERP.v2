import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDatabaseIndexes1794712750124 implements MigrationInterface {
    name = 'AddDatabaseIndexes1794712750124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_5a3c397599fbf0c74f08a2863f" ON "usuarios" ("sucursalId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a2d2e96f16efe90522c42a1d62" ON "usuarios" ("empresaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e32437be246324cf6cfc9ec61d" ON "cajas" ("estado") `);
        await queryRunner.query(`CREATE INDEX "IDX_ccf5c96e0fa49df45faf5b895e" ON "cajas" ("empresaId", "sucursalId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a171d171b4167d362ae12a76f0" ON "pedidos" ("cajaId") `);
        await queryRunner.query(`CREATE INDEX "IDX_668fe658cebb5b8d3a7d7c7fb5" ON "pedidos" ("estado") `);
        await queryRunner.query(`CREATE INDEX "IDX_aaa493727d8b3723eee84b39e5" ON "pedidos" ("sucursalId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3fc3f1a23340fd0d6463b06cea" ON "pedidos" ("empresaId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3fc3f1a23340fd0d6463b06cea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aaa493727d8b3723eee84b39e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_668fe658cebb5b8d3a7d7c7fb5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a171d171b4167d362ae12a76f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ccf5c96e0fa49df45faf5b895e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e32437be246324cf6cfc9ec61d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2d2e96f16efe90522c42a1d62"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a3c397599fbf0c74f08a2863f"`);
    }

}
