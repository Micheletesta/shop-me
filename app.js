import { join } from 'desm'
import AutoLoad from '@fastify/autoload'
import Sensible from '@fastify/sensible'
import Cors from '@fastify/cors'
import Multipart from '@fastify/multipart'
import proxy from '@fastify/http-proxy'
import { fastifyRequestContext } from '@fastify/request-context'
import Fastify from 'fastify'
import config from './config/configs.js'


const opts = {
    isBatch: !!process.env.BATCH,

}
const fastify = Fastify({
    logger: {
        level: config.logger.level,
        redact: {
            paths: config.logger.redactPaths,
            censor: '******'
        },
        serializers: {
            res: function (reply) {
                return {
                    statusCode: reply.statusCode,
                    context: reply.rapportiniContext,
                }
            },
            req(req) {
                return {
                    method: req.method,
                    url: req.url,
                    path: req.path,
                    parameters: req.parameters,
                    body: req.body,
                    headers: req.headers,
                }
            },
        },
        file: config.logger.writeToFile ? config.logger.path : opts.isBatch ? config.logger.path : ''
    },
    disableRequestLogging: true,
    pluginTimeout: 10000,
    // https: {
    //     key: fs.readFileSync(join(import.meta.url, "config\\key.pem")),
    //     cert: fs.readFileSync(join(import.meta.url, "config\\cert.pem"))
    // }
})

fastify.register(Cors, {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
})

fastify.decorate('config', config)

fastify.register(fastifyRequestContext)

fastify.register(Sensible)

fastify.register(Multipart)

fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'service'),
    options: Object.assign({}, opts)
})

fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'routes'),
    options: Object.assign({ prefix: 'v2/api' }, opts)
})



fastify.addHook('preHandler', function (req, reply, done) {
    req.requestContext.set('reqId', req ? req.id : '')
    req.log.info(
        {
            method: req.method,
            url: req.url,
            path: req.path,
            parameters: req.parameters,
            body: req.body,
            headers: req.headers,
        }
        , 'REQUEST ::')
    done()
})

fastify.addHook('preSerialization', (request, reply, payload, done) => {
    if (payload) {
        const payloadToLog = (JSON.stringify(payload).substring(0, fastify.config.logger.responseMaxLength))
        request.log.info({ context: reply.dreamCarContext }, 'RESPONSE :: { body: ' + payloadToLog + ' } ')
    }
    done()
})

fastify.addHook('onSend', (request, reply, payload, done) => {
    if (payload && payload.readable) {
        request.log.info({ context: reply.rapportiniContext }, 'RESPONSE :: { Readable stream... } ')
    }
    done()
})


await fastify.ready()
export default fastify