import S from "fluent-json-schema"

export default async function Storage(fastify) {
    fastify.route({
        method: "POST",
        path: "/storages/storage",
        schema: {
            body: S.array().items(
                S.object()
                    .prop()
            ),
            response: {
                201: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onAddItemToStorage
    })

    async function onAddItemToStorage(request, reply) {
        let itemsAdded = []
        try {
            for (const element of request.body) {
                let itemAdded = await fastify.sequelizeFacility.insertOrUpdate(fastify.database.models.Storage,
                    {
                        id: element.id ? element.id : 0
                    }, element, {})
                // let itemAdded = await fastify.database.models.Storage.create(element)
                itemsAdded.push(itemAdded)
            }
        } catch (error) {
            fastify.log.error("Errore in fase di aggiunta elementi alla dispensa");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(201)
        return fastify.outcome.success("Elementi aggiunti con successo", itemsAdded, "items")
    }

    fastify.route({
        method: "GET",
        path: "/storages/storages",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetItemsFromStorages
    })

    async function onGetItemsFromStorages(request, reply) {
        let itemsRetrieved
        try {
            itemsRetrieved = await fastify.database.models.Storage.findAll()
        } catch (error) {
            fastify.log.error("Errore in fase di recupero elementi dalla dispensa");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Elementi recuperati con successo", itemsRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/storages/storage/:location",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetItemsFromSelectedStorage
    })

    async function onGetItemsFromSelectedStorage(request, reply) {
        let itemsRetrieved
        try {
            itemsRetrieved = await fastify.database.models.Storage.findAll({
                where: {
                    location: request.params.location
                }
            })
        } catch (error) {
            fastify.log.error("Errore in fase di recupero elementi dalla dispensa selezionata");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Elementi recuperati con successo", itemsRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/storages/locations",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetStorages
    })

    async function onGetStorages(request, reply) {
        let itemsRetrieved
        try {
            itemsRetrieved = await fastify.database.models.Storage.findAll({
                order: [
                    ['location', 'ASC'],
                ],
                attributes: [
                    [fastify.database.sequelize.fn("DISTINCT", fastify.database.sequelize.col("location")), "location"]]
            })
        } catch (error) {
            fastify.log.error("Errore in fase di recupero elementi dalla dispensa");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Elementi recuperati con successo", itemsRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/storages/storage/delete/:id",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('item', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onDeleteItem
    })

    async function onDeleteItem(request, reply) {
        try {
            await fastify.database.models.Storage.destroy({
                where: {
                    id: request.params.id
                }
            })
        } catch (error) {
            fastify.log.error("Errore in fase di eliminazione elemento");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Elemento eliminato con successo")
    }

}