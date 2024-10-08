import S from 'fluent-json-schema'
import fp from 'fastify-plugin'

async function outcome(fastify, options) {

    const success = (msg, obj, objKey) => {
        const res = {
            success: true,
            message: msg ? msg : null
        }
        res[objKey != null ? objKey : 'item'] = obj ? obj : null
        return res
    }

    const failed = (msg, obj) => {
        return {
            success: false,
            message: msg ? msg : null,
            item: obj ? obj : null,
        }
    }

    const failedV2 = (error, obj) => {
        return {
            success: false,
            error: error ? error : null,
            item: obj ? obj : null,
        }
    }

    const successV2 = (obj, objKey, alert) => {
        const res = {
            success: true,
            alert: alert ? alert : [],
        }
        res[objKey != null ? objKey : 'item'] = obj ? obj : null
        return res
    }

    const notFound = (reply, obj) => {
        reply.code(404)
        return {
            success: true,
            message: 'Record non trovato',
            item: obj ? obj : null,
        }
    }

    const DEFAULT_OBJECTS = {
        annunciFoto: S.object()
            .prop('id', S.integer())
            .prop('base64', S.raw())
            .prop('annuncioId', S.integer()),
        annuncio: S.object()
            .prop('id', S.integer())
            .prop('title', S.string())
            .prop('price', S.number())
            .prop('state', S.string())
            .prop('descrizione', S.anyOf([S.raw(), S.null()]))
            .prop('isHidden', S.boolean())
            .prop('power', S.anyOf([S.integer(), S.null()]))
            .prop('km', S.anyOf([S.integer(), S.null()]))
            .prop('year', S.anyOf([S.integer(), S.null()]))
            //.prop('type',S.anyOf([S.string(), S.null()]))
            .prop('usersId', S.anyOf([S.integer(), S.null()]))
            .prop('veicoloId', S.anyOf([S.integer(), S.null()]))
            .prop('subscription', S.anyOf([S.string(), S.null()])),
        asta: S.object()
            .prop('id', S.integer())
            .prop('title', S.string())
            .prop('price', S.number())
            .prop('descrizione', S.anyOf([S.raw(), S.null()]))
            .prop('isHidden', S.boolean())
            .prop('power', S.anyOf([S.integer(), S.null()]))
            .prop('km', S.anyOf([S.integer(), S.null()]))
            .prop('year', S.anyOf([S.integer(), S.null()]))
            .prop('startAt', S.raw())
            .prop('endAt', S.raw())
            .prop('startingBid', S.anyOf([S.number(), S.null()]))
            .prop('buyNow', S.anyOf([S.number(), S.null()]))
            .prop('owner_id', S.anyOf([S.integer(), S.null()]))
            .prop('vehicle_id', S.anyOf([S.integer(), S.null()]))
            .prop('subscription', S.anyOf([S.string(), S.null()])),
        asteFoto: S.object()
            .prop('id', S.integer())
            .prop('base64', S.raw())
            .prop('astaId', S.integer()),
        bid: S.object()
            .prop('bidValue', S.number())
            .prop('usersId', S.integer())
            .prop('astaId', S.integer()),
        options: S.object()
            .prop('id', S.integer())
            .prop('name', S.anyOf([S.string(), S.null()]))
            .prop('value', S.anyOf([S.string(), S.null()])),
        optional: S.object()
            .prop('id', S.integer())
            .prop('name', S.anyOf([S.string(), S.null()])),
        raffle: S.object()
            .prop('id', S.integer())
            .prop('title', S.string())
            .prop('ticketValue', S.number())
            .prop('descrizione', S.anyOf([S.raw(), S.null()]))
            .prop('isHidden', S.boolean())
            .prop('power', S.anyOf([S.integer(), S.null()]))
            .prop('km', S.anyOf([S.integer(), S.null()]))
            .prop('year', S.anyOf([S.integer(), S.null()]))
            .prop('startAt', S.raw())
            .prop('endAt', S.raw())
            .prop('owner_id', S.anyOf([S.integer(), S.null()]))
            .prop('vehicle_id', S.anyOf([S.integer(), S.null()]))
            .prop('subscription', S.anyOf([S.string(), S.null()])),
        rafflesFoto: S.object()
            .prop('id', S.integer())
            .prop('base64', S.raw())
            .prop('raffleId', S.integer()),
        tickets: S.object()
            .prop('raffleId', S.integer())
            .prop('usersId', S.integer()),
        research: S.object()
            .prop('id', S.integer())
            .prop('isSaved', S.boolean())
            .prop('name', S.anyOf([S.string(), S.null()]))
            .prop('kmFrom', S.anyOf([S.integer(), S.null()]))
            .prop('kmTo', S.anyOf([S.integer(), S.null()]))
            .prop('powerFrom', S.anyOf([S.integer(), S.null()]))
            .prop('powerTo', S.anyOf([S.integer(), S.null()]))
            .prop('yearFrom', S.anyOf([S.integer(), S.null()]))
            .prop('yearTo', S.anyOf([S.integer(), S.null()]))
            .prop('fuel', S.anyOf([S.string(), S.null()]))
            .prop('state', S.anyOf([S.string(), S.null()]))
            .prop('range', S.anyOf([S.integer(), S.null()]))
            .prop('usersId', S.anyOf([S.integer(), S.null()])),
        research_optional: S.object()
            .prop('researchId', S.integer())
            .prop('optionalId', S.integer()),
        research_vehicle: S.object()
            .prop('researchId', S.integer())
            .prop('veicoloId', S.integer()),
        sold: S.object()
            .prop('id', S.integer())
            .prop('type', S.anyOf([S.string(), S.null()]))
            .prop('price', S.anyOf([S.number(), S.null()]))
            .prop('boughtId', S.integer())
            .prop('buyer_id', S.anyOf([S.integer(), S.null()]))
            .prop('subscription', S.anyOf([S.string(), S.null()])),
        user_annuncio: S.object()
            .prop('favourite', S.boolean())
            .prop('notes', S.anyOf([S.string(), S.null()]))
            .prop('usersId', S.integer())
            .prop('annuncioId', S.anyOf([S.integer(), S.null()])),
        user_options: S.object()
            .prop('usersId', S.integer())
            .prop('optionsId', S.anyOf([S.integer(), S.null()])),
        user: S.object()
            .prop('id', S.integer())
            .prop('email', S.string())
            .prop('password', S.string())
            .prop('name', S.string())
            .prop('surname', S.string())
            .prop('type', S.string())
            .prop('indirizzo', S.anyOf([S.string(), S.null()]))
            .prop('citta', S.anyOf([S.string(), S.null()]))
            .prop('provincia', S.anyOf([S.string(), S.null()]))
            .prop('cap', S.anyOf([S.string(), S.null()]))
            .prop('phoneNumber', S.anyOf([S.string(), S.null()]))
            .prop('authorization', S.anyOf([S.string(), S.null()]))
            .prop('longitude', S.anyOf([S.string(), S.null()]))
            .prop('latitude', S.anyOf([S.string(), S.null()]))
            .prop('profilePicture', S.raw())
            .prop('ragione_sociale', S.anyOf([S.string(), S.null()]))
            .prop('piva', S.anyOf([S.string(), S.null()]))
            .prop('codice_fiscale', S.anyOf([S.string(), S.null()])),
        veicolo: S.object()
            .prop('id', S.integer())
            .prop('brand', S.anyOf([S.string(), S.null()]))
            .prop('name', S.anyOf([S.string(), S.null()]))
            .prop('country', S.anyOf([S.string(), S.null()]))
            .prop('category', S.anyOf([S.string(), S.null()]))
            .prop('fuel', S.anyOf([S.string(), S.null()]))
            .prop('kmL', S.anyOf([S.number(), S.null()]))
            .prop('gears', S.integer())
            .prop('gearbox', S.anyOf([S.number(), S.null()]))
            .prop('emissions', S.anyOf([S.integer(), S.null()]))
            .prop('weight', S.anyOf([S.integer(), S.null()]))
            .prop('yearFrom', S.anyOf([S.integer(), S.null()]))
            .prop('yearTo', S.anyOf([S.integer(), S.null()])),
        userEssentials: S.object()
            .prop('id', S.integer())
            .prop('email', S.string())
            .prop('authorization', S.anyOf([S.string(), S.null()]))
            .prop('indirizzo', S.string())
            .prop('citta', S.string()),
        ///
        recipe: S.object()
            .prop("id", S.integer())
            .prop("name", S.string())
            .prop("img", S.raw()),
        recipeDetail: S.object()
            .prop("id", S.integer())
            .prop("name", S.string())
            .prop("img", S.raw())
            .prop("recipeId", S.array().items(S.object()
                .prop("id", S.integer())
                .prop("qty", S.integer())
                .prop("uom", S.string())
                .prop("productType", S.string())))
    }

    const queryAttributes = {
        veicolo: ['id', 'brand', 'name'],
        annuncio: ['id', 'title', 'price', 'km', 'power'],
        optionals: ['id', 'name']
    }

    const schemas = {
        success: S.object().prop('success', S.boolean()).prop('message', S.string()),
        successV2: S.object().prop('success', S.boolean()).prop('alert', S.array().items(S.string())),
        failed: S.object().prop('success', S.boolean()).prop('message', S.string()),
        failedV2: S.object().prop('success', S.boolean()).prop('error', S.string()),
        notFound: S.object().prop('success', S.boolean()).prop('message', S.string()),
        DEFAULT_OBJECTS,
        queryAttributes
    }

    fastify.decorate('outcome', {
        success,
        successV2,
        failed,
        failedV2,
        notFound,
        schemas: schemas
    })

}

export default fp(outcome)
