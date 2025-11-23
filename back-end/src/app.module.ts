import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { AuthModule } from './auth/auth.module';
import { BidsModule } from './bids/bids.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    UsersModule,
    CategoriesModule,
    CloudinaryModule,
    ProductsModule,
    SalesModule,
    AuthModule,
    BidsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
