import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { hash } from "bcryptjs";

export async function resetPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/password/recover",
        {
            schema: {
                tags: ["Auth"],
                summary: "Request password recover",
                body: z.object({
                    code: z.string(),
                    password: z.string().min(6),
                }),
                response: {
                    204: z.null({}),
                },
            },
        },

        async (request, reply) => {
            const { code, password } = request.body;

            const tokenFormCode = await prisma.token.findUnique({
                where: {
                    id: code,
                },
            });

            if (!tokenFormCode) {
                throw new UnauthorizedError("Invalid code");
            }

            const passwordHash = await hash(password, 6);

            await prisma.user.update({
                where: {
                    id: tokenFormCode.userId,
                },
                data: {
                    passwordHash,
                },
            });



            return reply.send();
        }
    );
}