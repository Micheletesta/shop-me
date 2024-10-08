import Sequelize from 'sequelize'

const ShoppingListItem = (sequelize) =>
    sequelize.define('SHOPPING_LIST_ITEMS', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        qty: {
            type: Sequelize.STRING,
            allowNull: true
        },
        uom: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        shop: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        }
    }, {
        freezeTableName: true,
        paranoid: true,
        name: {
            singular: 'shopping_list_items',
            plural: 'shopping_list_items'
        }
    }
    )


export default ShoppingListItem