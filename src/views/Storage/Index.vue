<template>
  <div class="container">
    <h3>Dispensa</h3>

    <headerCards :cards="cards" @click="retrieveItemsForSelectedStorage()"></headerCards>
    <div id="items-container">
      <table>
        <tr>
          <th class="cell-row article-header">
            <img src="../../icons/plus.png" class="add-icon" @click="addRow()" />
            Articolo
          </th>
          <th class="cell-row qty-header">Quantità</th>
          <th class="cell-row uom-header">UdM</th>
          <th v-show="selectedStore == 'farmaci'" class="cell-row exp-header">
            Scadenza (gg-mm-aaaa)
          </th>
          <th class="cell-row">Salva</th>
          <th class="cell-row">Elimina</th>
        </tr>
        <tbody>
          <tr v-for="item in itemsForStorage">
            <td class="cell-row article-cell">
              <input
                type="text"
                :id="'item-' + item.id"
                class="article-input"
                :value="item.name"
              />
            </td>
            <td class="cell-row qty-cell">
              <input
                type="text"
                :id="'qty-' + item.id"
                class="article-input"
                :value="item.qty"
              />
            </td>
            <td class="cell-row uom-cell">
              <input
                type="text"
                :id="'uom-' + item.id"
                class="article-input"
                :value="item.uom"
              />
            </td>

            <td class="cell-row exp-cell">
              <input type="text" :id="'exp-'+item.id" class="article-input"
              :value="item.expiration"
            </td>

            <td class="cell-row">
              <img
                src="../../icons/editing.png"
                class="edit-icon"
                @click="editRow(item, itemsForStorage.indexOf(item))"
              />
            </td>
            <td class="cell-row">
              <img
                src="../../icons/remove.png"
                class="remove-icon"
                @click="deleteRow(item, itemsForStorage.indexOf(item))"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.article-input {
  width: 78%;
}

.article-header {
  width: 50%;
}

.article-cell {
  width: 50%;
}

.qty-header {
  width: 20%;
}

.qty-cell,
.uom-cell {
  width: 20%;
}

.price-header {
  width: 20%;
}

.price-cell {
  width: 20%;
}

.uom-cell {
  width: 5%;
}
.cell-row {
  text-align: center;
}

.table-body {
  width: 100%;
}

.item-row {
  width: 100%;
}

.edit-icon,
.remove-icon,
.add-icon {
  width: 20px;
}
</style>

<script>
import axios from "axios";
import headerCards from "../../components/headerCards.vue";

export default {
  components: { headerCards },
  data() {
    return {
      cards: [],
      storages: [],
      itemsForStorage: [],
      selectedStore: "",
    };
  },
  methods: {
    retrieveStorages() {
      axios
        .get(import.meta.env.VITE_API_URL + ":3002/v2/api/storages/locations")
        .then((res) => {
          this.storages = res.data.items;

          let cssIndex = 1;
          for (const element of this.storages) {
            let obj = {
              cssIndex: cssIndex,
              text: element.location,
              img: "storages/" + element.location + ".png",
              //  flyerUrl: element.flyerUrl,
            };
            this.cards.push(obj);
            cssIndex++;
            if (cssIndex == 5) cssIndex = 1;
          }
        });
    },
    retrieveItemsForSelectedStorage(store) {
      let storage;
      if (store) {
        storage = store;
      } else {
        let cardClicked = event.srcElement.closest("a");
        storage = cardClicked.querySelector("p").innerText;
        this.selectedStore = storage;
      }
      axios
        .get(import.meta.env.VITE_API_URL + ":3002/v2/api/storages/storage/" + storage)
        .then((res) => {
          this.itemsForStorage = res.data.items;
        });
    },
    addRow() {
      let itemIndex = 0;
      for (let itemForStorage of this.itemsForStorage) {
        if (!itemForStorage.name) {
          let item = {
            name: document.querySelectorAll(".article-cell input")[itemIndex].value,
            qty: document.querySelectorAll(".qty-cell input")[itemIndex].value,
            uom: document.querySelectorAll(".uom-cell input")[itemIndex].value,
            expiration: document.querySelectorAll(".exp-cell input")[itemIndex].value,
          };
          this.itemsForStorage[itemIndex] = item;
        }
        itemIndex++;
      }

      this.itemsForStorage.push({
        location: this.selectedStore,
      });
    },
    editRow(item, index) {
      // item.name = document.getElementById("item-" + item.id).value;
      // item.qty = document.getElementById("qty-" + item.id).value;
      // item.uom = document.getElementById("uom-" + item.id).value;

      item.name = document.querySelectorAll(".article-cell input")[index].value;
      item.qty = document.querySelectorAll(".qty-cell input")[index].value;
      item.uom = document.querySelectorAll(".uom-cell input")[index].value;
      (item.expiration = document.querySelectorAll(".exp-cell input")[index].value),
        (item.location = item.location ? item.location : this.selectedStore);
      axios
        .post(import.meta.env.VITE_API_URL + ":3002/v2/api/storages/storage", [item])
        .then((res) => {
          let itemIndex = 0;
          for (let itemForStorage of this.itemsForStorage) {
            if (!itemForStorage.name) {
              let item = {
                name: document.querySelectorAll(".article-cell input")[itemIndex].value,
                qty: document.querySelectorAll(".qty-cell input")[itemIndex].value,
                uom: document.querySelectorAll(".uom-cell input")[itemIndex].value,
                expiration: document.querySelectorAll(".exp-cell input")[itemIndex].value,
              };
              this.itemsForStorage[itemIndex] = item;
            }
            itemIndex++;
          }
          console.log("elemento modificato con successo");
        });
    },
    deleteRow(item, itemIndex) {
      if (item.id) {
        axios
          .get(
            import.meta.env.VITE_API_URL +
              ":3002/v2/api/storages/storage/delete/" +
              item.id
          )
          .then((res) => {
            this.retrieveItemsForSelectedStorage(this.selectedStore);
          });
      } else {
        this.itemsForStorage.splice(itemIndex, 1);
      }
    },
  },
  mounted() {
    this.retrieveStorages();
    //this.retrieveItemsForSelectedStorage();
  },
};
</script>
