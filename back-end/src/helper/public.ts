import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'is_public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
