import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const app = fastify();



app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Next.js SaaS",
            description: "Fullstack SaaS app with multi-tentant & RBAC",
            version: "0.1.0",
        },
        servers: [
        ],

    },
    transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",


})

app.register(fastifyCors)


app.register(createAccount)

app.listen({ port: 3333 }).then(() => {
    console.log("HTTP Server running");
});


