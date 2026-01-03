import { defineQuery } from "next-sanity";

/**
 * Admin dashboard – products overview
 */
export const ADMIN_PRODUCTS_OVERVIEW = defineQuery(`*[
  _type == "product"
] | order(name asc) {
  _id,
  name,
  price,
  stock,
  "image": images[0].asset->url
}`);
