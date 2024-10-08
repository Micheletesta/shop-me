import Sequelize from 'sequelize'

const Store = (sequelize) =>
    sequelize.define('STORE', {
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
        logo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        flyerUrl: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        paranoid: true,
        name: {
            singular: 'store',
            plural: 'store'
        }
    }
    )


export default Store