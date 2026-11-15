import { Request } from 'express';
import { Rol } from '../../usuarios/enums/rol.enum';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    rol: Rol;
    empresaId: string;
    sucursalId: string;
    isImpersonation?: boolean;
  };
}