import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

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
                return reply.status(400).send({
                    message: "IInvalid credentials",
                });
            }

            if (user.passwordHash === null) {
                return reply.status(400).send({
                    message: "User has no password set",
                });
            }

            const passwordMatch = await compare(password, user.passwordHash);

            if (!passwordMatch) {
                return reply.status(400).send({
                    message: "Invalid credentials",
                });
            }

            const token = await reply.jwtSign({
                sub: user.id,
            }, {
                expiresIn: "7d",

            });


            return reply.send({
                token,
            });
        },
    )
}