import { renderListWithTemplate } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const pagePaths = {
  "880RR": "product_pages/marmot-ajax-3.html",
  "985RF": "product_pages/northface-talus-4.html",
  "985PR": "product_pages/northface-alpine-3.html",
  "344YJ": "product_pages/cedar-ridge-rimrock-2.html",
};

// Builds the HTML markup for a single product card.
function productCardTemplate(product, category) {
  const imageUrl = product.Images?.PrimaryMedium || product.Image || "";
  const brandName = product.Brand?.Name || "";
  const productPage = pagePaths[product.Id];
  const href = productPage
    ? `${productPage}?product=${product.Id}&category=${category}`
    : "#";

  return `
    <li class="product-card">
      <a href="${href}">
        <img src="${imageUrl}" alt="${product.NameWithoutBrand}">
        <h3 class="card__brand">${brandName}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">$${product.FinalPrice}</p>
      </a>
    </li>
    `;
}

export default class ProductList {
  // Stores the category, data source, and target container for the list.
  constructor(category, dataSource, listElement, searchQuery = "") {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.searchQuery = searchQuery;
    this.currentSort = "name-asc";
    this.products = [];
  }

  sortProducts(products, sortOption = this.currentSort) {
    const items = Array.isArray(products) ? [...products] : [];

    switch (sortOption) {
      case "name-desc":
        return items.sort((a, b) =>
          (b.NameWithoutBrand || "").localeCompare(a.NameWithoutBrand || ""),
        );
      case "price-asc":
        return items.sort(
          (a, b) => Number(a.FinalPrice || 0) - Number(b.FinalPrice || 0),
        );
      case "price-desc":
        return items.sort(
          (a, b) => Number(b.FinalPrice || 0) - Number(a.FinalPrice || 0),
        );
      case "name-asc":
      default:
        return items.sort((a, b) =>
          (a.NameWithoutBrand || "").localeCompare(b.NameWithoutBrand || ""),
        );
    }
  }

  bindSortControl() {
    const sortControl = document.querySelector("#product-sort");
    if (!sortControl) return;

    sortControl.value = this.currentSort;
    sortControl.onchange = (event) => {
      this.currentSort = event.target.value;
      this.renderList(this.products);
    };
  }

  // Fetches product data and renders the page title and product list.
  async init() {
    const list = this.searchQuery
      ? await this.dataSource.searchProducts(this.searchQuery)
      : await this.dataSource.getData(this.category);
    this.products = Array.isArray(list) ? list : [];
    this.bindSortControl();
    this.renderList(this.products);

    const title = document.querySelector(".products h2");
    if (title) {
      if (this.searchQuery) {
        title.textContent = `Search Results: ${this.searchQuery}`;
      } else {
        const formattedCategory = this.category
          ? this.category.charAt(0).toUpperCase() + this.category.slice(1)
          : "Products";
        title.textContent = `Top Products: ${formattedCategory}`;
      }
    }
  }

  // Renders the products returned by the API, while still linking known product pages when available.
  renderList(list = this.products) {
    const products = this.sortProducts(list, this.currentSort);
    renderListWithTemplate(
      (product) => productCardTemplate(product, this.category || "tents"),
      this.listElement,
      products,
      "afterbegin",
      true,
    );
  }
}