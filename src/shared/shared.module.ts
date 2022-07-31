import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // jwt
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '1d',
      },
    }),
    // redis
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
    }),
    // config
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
  ],
  providers: [RedisService],
  exports: [JwtModule, CacheModule, RedisService],
})
export class SharedModule {}
