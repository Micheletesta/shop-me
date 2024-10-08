import fp from 'fastify-plugin'
import Sequelize from 'sequelize'
import defineModels from '../models/index.js'
import { QueryTypes } from 'sequelize'

async function connessioneDB(fastify, opts) {

    const seq = new Sequelize(fastify.config.sequelize.schema, fastify.config.sequelize.username,
        fastify.config.sequelize.password, {
        host: fastify.config.sequelize.host,
        dialect: "postgres",
    });

    const models = defineModels(seq)

    const op = Sequelize.Op

    // EFFETTUO LA CONNESSIONE AD DB
    try {
        await seq.authenticate()
        if (fastify.config.sequelize.sync) {
            await seq.sync({ force: fastify.config.sequelize.syncForce })
        }
    } catch (err) {
        fastify.log.error('Problema connessione DB: ' + err)
    }

    if (!opts.testing) fastify.decorate('database', { sequelize: seq, models: models, Op: op, QueryTypes })
}


export default fp(connessioneDB)
