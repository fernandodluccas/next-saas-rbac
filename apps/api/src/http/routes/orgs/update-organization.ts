import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { organizationSchema, userSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-users-permissions'

export async function updateOrganization(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .post(
            '/organizations/:slug',
            {
                schema: {
                    tags: ['Organizations'],
                    summary: 'Update an organization',
                    security: [{ bearerAuth: [] }],
                    body: z.object({
                        name: z.string(),
                        domain: z.string().nullish(),
                        shouldAttachUsersByDomain: z.boolean().optional(),
                    }),
                    params: z.object({
                        slug: z.string(),
                    }),
                    response: {
                        204: z.null(),
                    },
                },
            },
            async (request, reply) => {
                const { slug } = request.params
                const userId = await request.getCurrentUserId()

                const { membership, organization } = await request.getUserMembership(slug)

                const authUser = userSchema.parse({
                    id: userId,
                    role: membership.role,
                })

                const { name, domain, shouldAttachUsersByDomain } = request.body

                const authOrganization = organizationSchema.parse(organization)

                const { cannot } = getUserPermissions(userId, membership.role)

                if (cannot('update', authOrganization)) {
                    throw new UnauthorizedError('You are not allowed to update this organization')
                }


                if (domain) {
                    const organizationByDomain = await prisma.organization.findFirst({
                        where: {
                            domain,
                            id: {
                                not: organization.id,
                            },
                        },
                    })

                    if (organizationByDomain) {
                        throw new BadRequestError(
                            'Another organization with same domain already exists.',
                        )
                    }
                }

                await prisma.organization.update({
                    where: {
                        id: organization.id,
                    },
                    data: {
                        name,
                        domain,
                        shouldAttachUsersByDomain,
                    },
                })

                return reply.status(204).send()


            },
        )
}