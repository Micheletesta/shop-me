<template>
  <headerCards :cards="cards"></headerCards>

  <RouterView></RouterView>
</template>

<script>
import headerCards from "./components/headerCards.vue";
import { RouterView } from "vue-router";

export default {
  components: { RouterView, headerCards },
  data() {
    return {
      cards: [],
    };
  },
  mounted() {
    this.cards = [
      { cssIndex: 1, text: "Dispensa", img: "storage.png", href: "/storage" },
      {
        cssIndex: 2,
        text: "Carrello",
        img: "shopping-basket.png",
        href: "/basket",
      },
      { cssIndex: 3, text: "Negozi", img: "store.png", href: "/store" },
    ];
  },
};
</script>

<style scoped>
#main-content {
  overflow-y: scroll;
  box-sizing: border-box;
}
</style>

<style>
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
