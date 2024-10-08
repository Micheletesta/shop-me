<template>
  <div class="container">
    <iframe id="flyer-item" :src="flyerUrl"></iframe>

    <div class="list-container">
      <img src="../../icons/plus.png" id="plus-icon" @click="addItem()" />
      <label v-show="createdItems.length > 0" id="list-header-label">Prodotti</label>

      <label v-show="createdItems.length > 0" id="product-label">Nome prodotto</label>
      <label v-show="createdItems.length > 0" id="qty-label">Quantità</label>
      <label v-show="createdItems.length > 0" id="price-label">Prezzo</label>

      <li v-for="item in createdItems" :key="item" class="created-item">
        <input type="text" class="textbox item-name" />
        <input type="number" class="textbox item-qty" min="1" />
        <input type="number" class="textbox item-price" />
      </li>
      <img
        v-show="createdItems.length > 0"
        src="../../icons/cart.png"
        @click="addProductsToList()"
      />
    </div>
  </div>
</template>

<style>
#flyer-item {
  width: 340px;
  height: 500px;
}

.list-container {
  display: block;
}

img {
  width: 30px;
  display: block;
}

.textbox {
  width: 15%;
}

.item-name {
  width: 30%;
}

#list-header-label {
  display: block;
}

#product-label {
  display: inline-flex;
  margin-left: 22px;
  width: 32%;
}

#qty-label {
  width: 17%;
  display: inline-flex;
}
</style>

<script>
import axios from "axios";
export default {
  data() {
    return {
      createdItems: [],
      flyerUrl: "",
      itemsToAdd: [],
    };
  },
  methods: {
    addItem() {
      this.createdItems.push(this.createdItems.length);
    },
    addProductsToList() {
      for (
        let index = 0;
        index < document.getElementsByClassName("created-item").length;
        index++
      ) {
        let itemToAdd = {
          name: document.getElementsByClassName("item-name")[index].value,
          qty: document.getElementsByClassName("item-qty")[index].value,
          pz: document.getElementsByClassName("item-qty")[index].value,
          price: document.getElementsByClassName("item-price")[index].value,
          uom: "pezzi",
          shop: this.$route.query.store,
        };
        this.itemsToAdd.push(itemToAdd);
      }
      axios
        .post(
          import.meta.env.VITE_API_URL +
            ":3002/v2/api/shoppingListItems/shoppingListItems",
          this.itemsToAdd
        )
        .then();
    },
    getStore() {
      axios
        .get(
          import.meta.env.VITE_API_URL +
            ":3002/v2/api/stores/store/" +
            this.$route.query.store
        )
        .then((res) => {
          this.flyerUrl = res.data.item.flyerUrl;
        });
    },
  },
  mounted() {
    this.getStore();
  },
};
</script>
