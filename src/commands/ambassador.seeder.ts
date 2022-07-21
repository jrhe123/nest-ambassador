import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/user/user.service';
//
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

// standalone app
(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  //
  const userService = app.get(UserService);
  //
  const password = await bcrypt.hash('123456', 12);
  //
  for (let i = 0; i < 30; i++) {
    await userService.save({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      is_ambassador: true,
    });
  }
  //
  process.exit();
})();
