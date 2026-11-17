import { MigrationInterface, QueryRunner } from "typeorm";

export class FixReservasYAuditoria1794856695224 implements MigrationInterface {
    name = 'FixReservasYAuditoria1794856695224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_f5a0559320f5dec880533a41d2e"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_d4d544979009adb460c6c97c52e"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_5259635b737320d3ab684f76700"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "empresa_id"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "mesa_id"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "cliente_id"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "fechaHora"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "fechaHora" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" DROP COLUMN "fecha"`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" ADD "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_e468a0bb9f270c14e6b13c1cd40" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_45a8919c894e727f70b34678ef9" FOREIGN KEY ("mesaId") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_8ee0c58de71f30301e1b6994695" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_8ee0c58de71f30301e1b6994695"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_45a8919c894e727f70b34678ef9"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_e468a0bb9f270c14e6b13c1cd40"`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" DROP COLUMN "fecha"`);
        await queryRunner.query(`ALTER TABLE "auditorias_sistema" ADD "fecha" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "fechaHora"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "fechaHora" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "cliente_id" uuid`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "mesa_id" uuid`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "empresa_id" uuid`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_5259635b737320d3ab684f76700" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_d4d544979009adb460c6c97c52e" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_f5a0559320f5dec880533a41d2e" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
