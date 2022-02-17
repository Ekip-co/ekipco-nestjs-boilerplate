import { Inject } from '@nestjs/common';

export const MESSAGE_SERVICE = 'MESSAGE_SERVICE';

export function InjectMessage() {
  return Inject(MESSAGE_SERVICE);
}
