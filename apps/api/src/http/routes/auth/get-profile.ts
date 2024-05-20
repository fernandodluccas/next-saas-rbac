import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import z from "zod";
import { BadRequestError } from "../_errors/bad-request-eerror";

export async function getProfile(app: FastifyInstance) {
    app.get(
        '/profile',
        {
            schema: {
                tags: ["auth"],
                summary: "Get authenticated user profile",
                response: {
                    200: z.object({
                        id: z.string(),
                        email: z.string(),
                        name: z.string().optional(),
                        avatarUrl: z.string().optional(),
                    }),
                }
                ,
                401: {

                },
            },
        },

        async (request, reply) => {
            const { sub } = await request.jwtVerify<{ sub: string }>();

            const user = await prisma.user.findUnique({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                },
                where: {
                    id: sub,
                },
            });

            if (!user) {
                throw new BadRequestError("User not found");
            }

            return reply.send({ user });


        }

    );

}