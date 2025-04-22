import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [UsersModule, CategoriesModule, CloudinaryModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
