import S from "fluent-json-schema"

export default async function Cards(fastify) {
    fastify.route({
        method: "POST",
        path: "/cards/card",
        schema: {
            body: S.raw(),
            response: {
                201: fastify.outcome.schemas.success
                    .prop('items', S.raw()
                    ),
                500: fastify.outcome.schemas.failed
            }
        },
        handler: onAddCard
    })
    async function onAddCard(request, reply) {
        try {
            console.log(request)
        } catch (error) {
            fastify.log.error("Errore in fase di aggiunta carta");
            fastify.log.error(error)
            reply.code(500)
            return fastify.outcome.failed("PROBLEMI")
        }
        reply.code(201)
        return fastify.outcome.success("Elementi aggiunti con successo", itemsAdded, "items")
    }
}