import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import fastifyJwt from "@fastify/jwt";
import { getProfile } from "./routes/auth/get-profile";
import { errorHandler } from "./error-handler";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";

const app = fastify();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Next.js SaaS",
            description: "Fullstack SaaS app with multi-tentant & RBAC",
            version: "1.0.0",
        },
        servers: [],
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.register(fastifyJwt, {
    secret: "super"
})

app.register(fastifyCors);

app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);
app.register(requestPasswordRecover);

app.listen({ port: 3333 }).then(() => {
    console.log("HTTP Server running");
});
