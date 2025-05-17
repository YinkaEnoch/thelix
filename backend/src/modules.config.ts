import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    global: true,
    signOptions: { expiresIn: '1d' },
    secret: configService.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
});
