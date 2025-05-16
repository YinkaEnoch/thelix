import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfig {
  constructor() {}

  get httpPort(): number {
    return parseInt(process.env.PORT ?? '3000', 10);
  }

  get databaseURI(): string {
    return process.env.DATABASE_URI ?? '';
  }
}
