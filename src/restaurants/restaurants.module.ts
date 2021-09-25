import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsResolver, CategoriesResolver, DishesResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])], //Restaurant Repository를 사용하기 위한 import
  providers: [RestaurantsResolver, CategoriesResolver, DishesResolver, RestaurantsService],
})
export class RestaurantsModule {}
