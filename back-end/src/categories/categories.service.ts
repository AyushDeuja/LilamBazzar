import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaClient } from 'generated/prisma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadedUrl = await this.cloudinary.uploadFile(file, 'categories');
      createCategoryDto.category_img = uploadedUrl;
    }
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
