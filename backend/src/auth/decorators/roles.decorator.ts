import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../usuarios/enums/rol.enum';

export const Roles = (...roles: Rol[]) => SetMetadata('roles', roles);