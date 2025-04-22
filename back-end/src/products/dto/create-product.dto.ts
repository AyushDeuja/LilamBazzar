export class CreateProductDto {
  product_name: string;
  product_img: string;

  product_price: number;
  description: string;
  stock: number;
  category_id: number;
  organization_id: number;
}
