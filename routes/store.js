import S from "fluent-json-schema"

export default async function Store(fastify) {
    fastify.route({
        method: "GET",
        path: "/stores/stores",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetStores
    })

    async function onGetStores(request, reply) {
        let storesRetrieved
        try {
            storesRetrieved = await fastify.database.models.Stores.findAll();
        } catch (error) {
            fastify.log.error("Errore in fase di recupero negozi");
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Lista stores recuperati", storesRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/stores/store/:name",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('item', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetStoreByName
    })

    async function onGetStoreByName(request, reply) {
        let storeRetrieved
        try {
            storeRetrieved = await fastify.database.models.Stores.findOne({
                where: {
                    name: request.params.name
                }
            });
        } catch (error) {
            fastify.log.error("Errore in fase di recupero negozio");
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Lista stores recuperati", storeRetrieved, "item")
    }
}