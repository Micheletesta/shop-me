import Storage from "./storage.js"
import Store from "./store.js"
import ShoppingListItem from "./shoppingListItem.js"
const defineModels = (sequelize) => {

    let models = {}

    const storageModel = Storage(sequelize)
    const storeModel = Store(sequelize)
    const shoppingListItemModel = ShoppingListItem(sequelize)

    models['Storage'] = storageModel
    models['Stores'] = storeModel
    models['ShoppingListItems'] = shoppingListItemModel
    return models
}

export default defineModels