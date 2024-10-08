<template>
  <div class="header-cards">
    <a
      class="headerCard"
      v-for="card in cards"
      :id="'card' + card.cssIndex"
      :href="card.href"
      :key="card.cssIndex"
      :v-if="card.href"
    >
      <img :src="'../src/icons/' + card.img" class="headerCardImage" />
      <p class="headerCardText" :id="'cardText' + card.cssIndex">{{ card.text }}</p>
    </a>
  </div>
</template>

<style>
.header-cards {
  position: relative;
  /* bottom: 500px; */
}
</style>

<script>
import "../style/headerClass.css";

export default {
  props: {
    cards: {
      type: Array,
      required: true,
    },
  },
};
</script>
