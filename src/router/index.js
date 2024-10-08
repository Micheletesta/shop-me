import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '',
    component: () => import('../views/Index.vue'),
    name: "landing"
  },
  {
    path: '/',
    component: () => import('../views/Index.vue'),
    name: "landing"
  },
  {
    path: '/storage',
    component: () => import('../views/Storage/Index.vue')
  },
  {
    path: '/basket',
    component: () => import('../views/Basket/Index.vue')
  },
  {
    path: '/store',
    component: () => import('../views/Store/Index.vue')
  },
  {
    name: "productDetail",
    path: '/store/flyer',
    component: () => import('../views/Store/Flyer.vue')
  },
  {
    path: '/cards',
    component: () => import('../views/Cards/Index.vue')
  }


  // {
  //   path: '/recipes/index',
  //   component: () => import('../views/Recipes/Index.vue')
  // },
  // {
  //   name: "recipeDetail",
  //   path: '/recipes/recipe/:id',
  //   component: () => import('../views/Recipes/Recipe.vue')
  // },
  // {
  //   name: "addRecipe",
  //   path: "/recipes/recipe",
  //   component: () => import('../views/Recipes/AddRecipe.vue')
  // },
  // {
  //   name: "addProduct",
  //   path: "/products/product",
  //   component: () => import('../views/Products/addProduct.vue')
  // },
  // {
  //   name: "scheduledDrinks",
  //   path: "/scheduledDrinks/scheduledDrinks",
  //   component: () => import('../views/Scheduled/Index.vue')
  // },
  // {
  //   name: "searchedProduct",
  //   path: "/searchedProduct/searchedProduct",
  //   component: () => import("../views/Searched/SearchedProduct.vue")
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
