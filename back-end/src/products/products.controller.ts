import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Payload } from 'src/interfaces/payload';
import { Public } from 'src/helper/public';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: Payload) {
    createProductDto.organization_id = req.payload.id;
    return this.productsService.create(createProductDto);
  }

  // Public marketplace catalog — customers browse every vendor's products here
  @Public()
  @Get('browse')
  browse(
    @Query('category_id') category_id?: string,
    @Query('is_auction') is_auction?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAllPublic({
      category_id: category_id ? +category_id : undefined,
      is_auction:
        is_auction === 'true' ? true : is_auction === 'false' ? false : undefined,
      search,
    });
  }

  @Public()
  @Get('browse/:id')
  browseOne(@Param('id') id: string) {
    return this.productsService.findOnePublic(+id);
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

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Payload) {
    return this.productsService.remove(+id, req.payload.id);
  }
}
