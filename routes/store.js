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

    fastify.route({
        method: "GET",
        path: "/stores/store/:store/correctUrl",
        schema: {

        },
        handler: onGetCorrectUrl
    })

    async function onGetCorrectUrl(request, reply) {
        try {
            let store = request.params.store
            const href = await fastify.scrapingFacility.scrapedItemsFromWebsites(store)
            await fastify.sequelizeFacility.insertOrUpdate(fastify.database.models.Stores,
                {
                    code: store
                },
                {
                    flyerUrl: "https://www.doveconviene.it" + href[0]
                }
            )
        } catch (error) {
            fastify.log.error("Errore in fase di recupero url aggiornato");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Url aggiornato con successo")
    }
}