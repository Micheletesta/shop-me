import S from "fluent-json-schema"

export default async function Store(fastify) {
    fastify.route({
        method: "POST",
        path: "/shoppingListItems/shoppingListItems",
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
        handler: onAddItemsToShoppingList
    })

    async function onAddItemsToShoppingList(request, reply) {
        let itemsAdded = []
        try {
            for (const element of request.body) {
                let itemAdded = await fastify.sequelizeFacility.insertOrUpdate(fastify.database.models.ShoppingListItems,
                    {
                        id: element.id ? element.id : 0
                    }, element, {})
                // let itemAdded = await fastify.database.models.Storage.create(element)
                itemsAdded.push(itemAdded)
            }
        } catch (error) {
            fastify.log.error("Errore in fase di aggiunta elementi a lista della spesa");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(201)
        return fastify.outcome.success("Elementi aggiunti correttamente", itemsAdded, "items")
    }

    fastify.route({
        method: "GET",
        path: "/shoppingListItems/shoppingListItems",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetItems
    })

    async function onGetItems(request, reply) {
        let itemsRetrieved = {}
        let itemsRetrievedNotGrouped
        try {
            itemsRetrievedNotGrouped = await fastify.database.models.ShoppingListItems.findAll();

            for (let item of itemsRetrievedNotGrouped) {
                if (!Object.keys(itemsRetrieved).includes(item.shop)) {
                    itemsRetrieved[item.shop] = []
                }
                itemsRetrieved[item.shop].push(item)
            }

        } catch (error) {
            fastify.log.error("Errore in fase di recupero articoli");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Lista articoli recuperati", itemsRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/shoppingListItems/shoppingListItems/:store",
        schema: {
            response: {
                200: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onGetItemsForStore
    })

    async function onGetItemsForStore(request, reply) {
        let itemsRetrieved
        try {
            itemsRetrieved = await fastify.database.models.ShoppingListItems.findAll({
                where: {
                    shop: request.params.store
                }
            });
        } catch (error) {
            fastify.log.error("Errore in fase di recupero articoli per negozio");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Lista articoli per negozio recuperati", itemsRetrieved, "items")
    }

    fastify.route({
        method: "GET",
        path: "/shoppingListItems/shoppingListItem/delete/:id",
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
            await fastify.database.models.ShoppingListItems.destroy({
                where: {
                    id: request.params.id
                }
            });
        } catch (error) {
            fastify.log.error("Errore in fase di eliminazione articolo");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(200)
        return fastify.outcome.success("Articolo rimosso con successo")
    }

}