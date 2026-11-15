import { validate } from 'class-validator';
import { IsCuit } from './is-cuit.validator';

class TestDto {
  @IsCuit()
  cuit: string;
}

describe('IsCuit', () => {
  it('acepta un CUIT válido con prefijo 20 (20-12345678-6)', async () => {
    const dto = new TestDto();
    dto.cuit = '20123456786';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('acepta un CUIT válido con prefijo 27 (27-12345678-0)', async () => {
    const dto = new TestDto();
    dto.cuit = '27123456780';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rechaza un CUIT con dígito verificador incorrecto', async () => {
    const dto = new TestDto();
    dto.cuit = '20123456785';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  it('rechaza un CUIT con menos de 11 dígitos', async () => {
    const dto = new TestDto();
    dto.cuit = '2012345678';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  it('rechaza un CUIT con letras', async () => {
    const dto = new TestDto();
    dto.cuit = '2012345678a';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  it('acepta null/undefined para campos opcionales', async () => {
    const dto = new TestDto();
    (dto as any).cuit = undefined;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});