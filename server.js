import fastify from './app.js'
import ngrok from "@ngrok/ngrok"
import ip from "ip"
await fastify.ready()
const addr = ip.address()
const port = process.env.PORT ? process.env.PORT : fastify.config.server.port
fastify.listen(port, addr ? addr : '0.0.0.0')

//fastify.listen(port, fastify.config.server.listenAddr ? fastify.config.server.listenAddr : '0.0.0.0')

// Establish connectivity

//const listener = await ngrok.forward({ addr: port, authtoken: fastify.config.ngrok.authtoken });

// const session = await new ngrok.SessionBuilder().authtoken(fastify.config.ngrok.authtoken).connect();
// const listener = await session.httpEndpoint().listen();
// listener.forward(`http://127.0.0.1:5173`);
// fastify.log.info(`Ingress established at: ${listener.url()}`);
