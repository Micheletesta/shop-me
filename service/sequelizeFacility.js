import fp from 'fastify-plugin'
import { QueryTypes } from 'sequelize'
import moment from 'moment'

async function sequelize(fastify) {

    const createINQuery = async (key, values) => {
        return fastify.database.sequelize.where(fastify.database.sequelize.col(key),
            'IN', [[values[key]]])
    }

    const createBETWEENQuery = async (key, values) => {
        return fastify.database.sequelize.where(fastify.database.sequelize.col(key),
            'BETWEEN', [values[key].split(',')[0], values[key].split(',')[1]])
    }

    const createORDERQuery = async (key, values) => {
        return [key.split('Order')[0], values[key]]
    }

    const getAllFilteredPaged = async (filter, model, page) => {
        let limit = 30
        let offset = limit * page
        return fastify.database.models[model].findAndCountAll({
            where: {
                ...filter
            },
            limit: limit,
            offset: offset
        })
    }

    const insertOrUpdate = async (model, condition, values, parameters = {}) => {
        // if (!JSON.stringify(condition).includes("\"id\":"))
        //     return model.create(values, parameters)
        return model.findOne({ where: condition }).then((obj) => {
            if (obj) {
                return obj.update(values, parameters)
            }
            return model.create(values, parameters)
        })
    }

    const SAFE_insertOrUpdate = async (model, condition, values, parameters = {}) => {
        const objToIns = {
            ...values,
            aziendamap_id: fastify.requestContext.get('user').aziendamap_id,
        }
        return model.findOne({ where: condition }).then((obj) => {
            if (obj) {
                return obj.update(objToIns, parameters)
            }
            return model.create(objToIns, parameters)
        })
    }

    const SAFE_load = async (model, id, association, attributes, transaction = null) => {
        let objSelect = {
            where: {
                id: id,
                aziendamap_id: fastify.requestContext.get('user').aziendamap_id,
            },
            include: association,
        }
        if (transaction) {
            objSelect.transaction = transaction
        }
        if (attributes && attributes.length > 0) {
            objSelect.attributes = attributes
        }
        return await model.findOne(objSelect)
    }


    const castDateForWhere = (key, value) => {
        return fastify.database.sequelize.where(
            fastify.database.sequelize.fn(
                'date',
                fastify.database.sequelize.col(key)
            ),
            '=',
            value
        )
    }

    const formatDateLikeTimestamp = (fieldName) => {
        const result = [
            fastify.database.sequelize.fn(
                'date_format',
                fastify.database.sequelize.col(fieldName),
                '%Y-%m-%d %H:%i:%s'
            ),
            fieldName,
        ]
        return result
    }

    const generaFiltroLikeUpper = (key, value) => {
        return fastify.database.sequelize.where(
            fastify.database.sequelize.fn(
                'UPPER',
                fastify.database.sequelize.col(key)
            ),
            'LIKE',
            '%' + String(value).toUpperCase() + '%'
        )
    }

    const generaFiltro = (filter) => {
        if (filter) {
            let refinedFilter = {}
            for (const [key, value] of Object.entries(filter)) {
                if (value || value === 0 || value === false) {
                    if (key.toUpperCase().includes('ID')) {
                        refinedFilter[key] = value
                    } else if (key.toUpperCase().includes('DATA') || key.toUpperCase().includes('DATE')) {
                        if (typeof value === 'object') {
                            if (value.startDate && value.endDate) {
                                refinedFilter[key] = generaFiltroFromDateToDate(key, value.startDate, value.endDate)
                            }
                        } else {
                            refinedFilter[key] = generaFiltroFromDateToDate(key, value, value)
                        }
                    } else {
                        refinedFilter[key] = generaFiltroLikeUpper(key, value)
                    }
                } else {
                    refinedFilter[key] = { [fastify.database.Op.is]: value }
                }
            }
            return Object.keys(refinedFilter).length > 0 ? refinedFilter : null
        }
        return null
    }

    const generaFiltroFromDateToDate = (key, startDate, endDate) => {
        return fastify.database.sequelize.where(
            fastify.database.sequelize.fn(
                'DATE',
                fastify.database.sequelize.col(key)
            ),
            {
                [fastify.database.Op.between]: [
                    fastify.database.sequelize.fn(
                        'DATE',
                        moment(startDate).format('YYYY-MM-DD')
                    ),
                    fastify.database.sequelize.fn(
                        'DATE',
                        moment(endDate).format('YYYY-MM-DD')
                    )
                ]
            }
        )
    }

    const calcoloContrattoInScadenza = async () => {
        let giorniAnticipoAlert = await fastify.options.caricaOptionConDefaultDaCategoryESubcategory('gestione_contratti', 'giorni_anticipo_avviso')
        return [
            fastify.database.sequelize.literal(
                `(DATE(NOW()) BETWEEN DATE_SUB(DATE(dataFine), INTERVAL ${giorniAnticipoAlert} DAY) AND DATE(dataFine))`
            ),
            'inScadenza'
        ]
    }


    const splitAndBuildObjForFilter = (queryObj) => {
        let objFormatted = {}
        for (const [key, value] of Object.entries(queryObj)) {
            splitAndInsertInTheRightObj(key, value, objFormatted)
        }
        return objFormatted
    }

    const splitAndInsertInTheRightObj = (key, value, objFormatted) => {
        let splittedKey = key.split(/\.(.*)/s)
        if (splittedKey.length > 1) {
            if (!objFormatted[splittedKey[0]]) objFormatted[splittedKey[0]] = {}
            splitAndInsertInTheRightObj(splittedKey[1], value, objFormatted[splittedKey[0]])
        } else {
            objFormatted[key] = value
            return
        }
    }

    const selectSuggestedRecipes = 'SELECT o."productType", COUNT(o."productType")' +
        ' FROM  "FAVOURITES" as F, "RECIPES" as R, "STEPS" as S, "OPERATIONS" as O ' +
        ' WHERE F."idRecipe" = R."id" AND R."id" = S."recipesId" AND S."operationsId" = O."id" ' +
        ' AND F."person"=\'{PERSON}\' AND O."productType"<>\'Ghiaccio\'' +
        ' GROUP BY O."productType"' +
        ' ORDER BY count DESC'


    fastify.decorate('sequelizeFacility', {
        createBETWEENQuery,
        createINQuery,
        createORDERQuery,
        insertOrUpdate,
        SAFE_insertOrUpdate,
        SAFE_load,
        castDateForWhere,
        formatDateLikeTimestamp,
        generaFiltroLikeUpper,
        generaFiltro,
        generaFiltroFromDateToDate,
        calcoloContrattoInScadenza,
        splitAndBuildObjForFilter,
        getAllFilteredPaged,
        selectSuggestedRecipes
    })
}

export default fp(sequelize)
