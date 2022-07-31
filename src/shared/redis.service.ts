import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, Store } from 'cache-manager';
import { createClient } from 'redis';

interface RedisStore extends Store {
  name: 'redis';
  getClient: () => ReturnType<typeof createClient>;
  isCacheableValue: (value: any) => boolean;
}
interface RedisCache extends Cache {
  store: RedisStore;
}

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: RedisCache) {}

  getClient(): ReturnType<typeof createClient> {
    const store = this.cacheManager.store;
    return store.getClient();
  }
}
