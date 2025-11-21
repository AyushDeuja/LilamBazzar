import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Payload } from 'src/interfaces/payload';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: Payload) {
    createProductDto.organization_id = req.payload.id;
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Req() req: Payload) {
    return this.productsService.findAll(req.payload.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Payload) {
    return this.productsService.findOne(+id, req.payload.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Payload,
  ) {
    updateProductDto.organization_id = req.payload.id;
    return this.productsService.update(+id, updateProductDto);
  }

  //temporaryy fix until jwt guards are added
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Payload) {
    return this.productsService.remove(+id, req.payload.id);
  }
}
