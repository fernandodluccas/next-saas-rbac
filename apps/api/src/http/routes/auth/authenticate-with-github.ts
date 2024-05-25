import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors/bad-request-error";
import { env } from "@saas/env";

export async function authenticateWithGithub(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/sessions/github',
        {
            schema: {
                tags: ["auth"],
                summary: "Authenticate with github",
                body: z.object({
                    code: z.string(),
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
            const { code } = request.body;

            const githubOauthURL = new URL("http://github.com/login/oauth/access_token");

            githubOauthURL.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID
            );
            githubOauthURL.searchParams.set("client_secret", env.GITHUB_OAUTH_CLIENT_SECRET);
            githubOauthURL.searchParams.set("redirect_uri", env.GITHUB_OAUTH_REDIRECT_URL);
            githubOauthURL.searchParams.set("code", code);

            const getOauthTokenResponse = await fetch(githubOauthURL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                },
            });

            const githubAcessTokenData = await getOauthTokenResponse.json();

            const { access_token } = z.object({
                access_token: z.string(),
                scope: z.string(),
                token_type: z.literal("bearer"),
            }).parse(githubAcessTokenData);

            const getUserResponse = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const githubUserData = await getUserResponse.json();

            const { id, name, email, avatar_url } = z.object({
                id: z.number().int().transform(String),
                avatar_url: z.string().url(),
                name: z.string().nullable(),
                email: z.string().email().nullable(),
            }).parse(githubUserData);


            if (email === null) {
                throw new BadRequestError("Email is required");
            }

            let user = await prisma.user.findFirst({
                where: {
                    email: email,
                },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        avatarUrl: avatar_url,
                    },
                });
            }

            let account = await prisma.account.findUnique({
                where: {
                    provider_userId: {
                        provider: "GITHUB",
                        userId: user.id,
                    },
                }
            });

            if (!account) {
                account = await prisma.account.create({
                    data: {
                        provider: "GITHUB",
                        providerAccountId: id,
                        userId: user.id,
                    },
                });
            }

            const token = await reply.jwtSign({
                sub: user.id,
            }, {
                expiresIn: "7d",
            });

            return reply.status(201).send({
                token,
            });
        }
    );
}