<template>
  <div class="container">
    <h3>Carrello</h3>
    <div id="shopping-list-items-container">
      <div v-for="store in Object.keys(shoppingListItems)">
        <h4>{{ store }}</h4>

        <table>
          <tr>
            <th class="cell-row article-header">
              <img src="../../icons/plus.png" class="add-icon" @click="addRow(store)" />
              Articolo
            </th>
            <th class="cell-row qty-header">Qta</th>
            <th class="cell-row uom-header">UdM</th>
            <th class="cell-row price-header">Prezzo</th>
            <th class="cell-row"></th>
            <th class="cell-row"></th>
          </tr>
          <tbody class="table-body">
            <!-- <h5>{{ item.name }}</h5> -->
            <tr class="item-row" v-for="item in shoppingListItems[store]">
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
              <td class="cell-row qty-cell">
                <input
                  type="text"
                  :id="'uom-' + item.id"
                  class="article-input"
                  :value="item.uom"
                />
              </td>
              <td class="cell-row price-cell">
                <input type="text" :id="'price-'+item.id" class="article-input"
                :value="item.price"
              </td>
              <td class="cell-row">
                <img
                  src="../../icons/editing.png"
                  class="edit-icon"
                  @click="editRow(item)"
                />
              </td>
              <td class="cell-row">
                <img
                  src="../../icons/remove.png"
                  class="remove-icon"
                  @click="deleteRow(item)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
.article-input {
  width: 78%;
}

.article-header {
  width: 40% !important;
}

.article-cell {
  width: 40% !important;
}

.qty-header {
  width: 20% !important;
}

.qty-cell {
  width: 20% !important;
}

.price-header {
  width: 20%;
}

.price-cell {
  width: 20%;
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

.cell-row {
  width: 30px;
}

.edit-icon,
.remove-icon,
.add-icon {
  width: 20px;
}
</style>

<script>
import axios from "axios";
export default {
  data() {
    return {
      shoppingListItems: [],
    };
  },
  methods: {
    getShoppingListItem() {
      axios
        .get(
          import.meta.env.VITE_API_URL +
            ":3002/v2/api/shoppingListItems/shoppingListItems"
        )
        .then((res) => {
          this.shoppingListItems = res.data.items;
        });
    },
    addRow(store) {
      this.shoppingListItems[store].push({
        shop: store,
      });
    },
    editRow(item) {
      item.name = document.getElementById("item-" + item.id).value;
      item.qty = document.getElementById("qty-" + item.id).value;
      item.uom = document.getElementById("uom-" + item.id).value;
      item.price = document.getElementById("price-" + item.id).value;

      axios
        .post(
          import.meta.env.VITE_API_URL +
            ":3002/v2/api/shoppingListItems/shoppingListItems",
          [item]
        )
        .then((res) => {
          console.log("elemento modificato con successo");
        });
    },
    deleteRow(item) {
      if (item.id) {
        axios
          .get(
            import.meta.env.VITE_API_URL +
              ":3002/v2/api/shoppingListItems/shoppingListItem/delete/" +
              item.id
          )
          .then((res) => {
            this.getShoppingListItem();
          });
      } else {
        // console.log(event);
        // console.log(event.srcElement);
        // console.log(item);
      }
    },
  },
  mounted() {
    this.getShoppingListItem();
  },
};
</script>
