import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors/bad-request-error";

export async function authenticateWithPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/sessions/password',
        {
            schema: {
                tags: ["auth"],
                summary: "Authenticate with email and password",
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(6),
                }),
                response: {
                    201: z.object({
                        token: z.string(),
                    }),
                    400: z.object({
                        message: z.string(),
                    }),
                }
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;

            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (!user) {
                throw new BadRequestError("Invalid credentials");
            }

            if (user.passwordHash === null) {
                throw new BadRequestError("User does not have a password, use social login.");
            }

            const passwordMatch = await compare(password, user.passwordHash);

            if (!passwordMatch) {
                throw new BadRequestError("Invalid credentials");
            }

            const token = await reply.jwtSign({
                sub: user.id,
            }, {
                expiresIn: "7d",

            });


            return reply.status(201).send({
                token,
            });
        },
    )
}