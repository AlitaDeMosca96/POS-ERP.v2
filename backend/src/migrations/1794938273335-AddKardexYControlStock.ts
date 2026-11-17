import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKardexYControlStock1794938273335 implements MigrationInterface {
    name = 'AddKardexYControlStock1794938273335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movimientos_stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "empresaId" uuid NOT NULL, "insumoId" uuid, "productoId" uuid, "tipo" character varying(50) NOT NULL, "cantidad" numeric(14,2) NOT NULL, "stockResultante" numeric(14,2) NOT NULL, "motivo" character varying(255) NOT NULL, "usuarioId" uuid, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_11359dd02b7e2b4f69b30e5ee2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "insumos" ADD "controlaStock" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "productos" ADD "controlaStock" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" ALTER COLUMN "empresaId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_0c04c9573df74990cf905c856c7" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_e709e14b648cd8c051cf5eb1d41" FOREIGN KEY ("insumoId") REFERENCES "insumos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_11c2c1d3360677c31067c4f76f4" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" ADD CONSTRAINT "FK_e73275e4c080c443a7f2020c206" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_e73275e4c080c443a7f2020c206"`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_11c2c1d3360677c31067c4f76f4"`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_e709e14b648cd8c051cf5eb1d41"`);
        await queryRunner.query(`ALTER TABLE "movimientos_stock" DROP CONSTRAINT "FK_0c04c9573df74990cf905c856c7"`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" ALTER COLUMN "empresaId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "controlaStock"`);
        await queryRunner.query(`ALTER TABLE "insumos" DROP COLUMN "controlaStock"`);
        await queryRunner.query(`DROP TABLE "movimientos_stock"`);
    }

}
