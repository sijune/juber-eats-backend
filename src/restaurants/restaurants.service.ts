import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //entity가 와야한다.
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
  createRestaurant(
    @Args()
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    //create or save
    const newRestaurant = this.restaurants.create(createRestaurantDto); //create: DB가 아니라 인스턴스 생성(메모리에만 생성)
    return this.restaurants.save(newRestaurant); //실제 DB저장
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    this.restaurants.update(id, { ...data }); //id가 있는지 체크를 안함
  }
}
