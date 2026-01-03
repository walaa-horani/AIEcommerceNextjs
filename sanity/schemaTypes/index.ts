import { type SchemaTypeDefinition } from 'sanity'
import { customerType } from './customerType'
import { orderType } from './orderType'
import { categoryType } from './categoryType'
import { productType } from './productType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    customerType,
    orderType,
    productType,
    categoryType,
  ],
}
