import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function requestPasswordRecover(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/password/recover",
        {
            schema: {
                tags: ["Auth"],
                summary: "Request password recover",
                body: z.object({
                    email: z.string().email(),
                }),
                response: {
                    201: z.object({}),
                },
            },
        },

        async (request, reply) => {
            const { email } = request.body;

            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (!user) {
                return reply.status(201)
            }

            const { id: code } = await prisma.token.create({
                data: {
                    type: "PASSWORD_RECOVER",
                    userId: user.id,
                },
            });



            return reply.send({});
        }
    );
}