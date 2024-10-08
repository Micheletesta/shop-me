<template>
  <div class="container">
    <h3>Negozi</h3>
    <headerCards :cards="cards"></headerCards>
  </div>
</template>

<script>
import headerCards from "../../components/headerCards.vue";
import axios from "axios";
export default {
  data() {
    return {
      cards: [],
    };
  },
  components: {
    headerCards,
  },
  methods: {
    getCardsOfStores() {
      axios
        .get(import.meta.env.VITE_API_URL + ":3002/v2/api/stores/stores")
        .then((res) => {
          let cssIndex = 1;
          for (const element of res.data.items) {
            // let index = res.data.items.findIndex((el) => el.id == element.id);
            // let cssIndex = (index + 1) % 4 ||> 0 ? (index + 1) % 4 : 1;
            let obj = {
              cssIndex: cssIndex,
              text: element.name,
              img: "stores/" + element.logo,
              //  flyerUrl: element.flyerUrl,
            };
            this.cards.push(obj);
            cssIndex++;
            if (cssIndex == 5) cssIndex = 1;
          }
        });
    },
    addRedirectListenerToCards() {
      for (let el of document.getElementsByClassName("headerCard")) {
        el.addEventListener("click", () => {
          let storeName = el.querySelector("p").innerText;
          window.location.href += "/flyer?store=" + storeName;
        });
      }
    },
  },
  mounted() {
    this.getCardsOfStores();
    setTimeout(() => {
      this.addRedirectListenerToCards();
    }, 200);
  },
};
</script>
