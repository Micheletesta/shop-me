import Sequelize from 'sequelize'

const Storage = (sequelize) =>
    sequelize.define('STORAGE', {
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
        location: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiration: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        paranoid: true,
        name: {
            singular: 'storage',
            plural: 'storage'
        }
    }
    )


export default Storage