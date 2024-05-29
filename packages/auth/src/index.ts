import { AbilityBuilder, CreateAbility, MongoAbility, createMongoAbility } from "@casl/ability"
import { User } from "./models/user"
import { permissions } from "./permissions"
import { projectSubject } from "./subjects/project"
import { userSubject } from "./subjects/user"
import { z } from 'zod'
import { organizationSubject } from "./subjects/organization"
import { billingSubject } from "./subjects/billing"
import { inviteSubject } from "./subjects/invite"


export * from './models/user'
export * from './models/organization'
export * from './models/project'
export * from './roles'

const appAbilitiesSchema = z.union([
  userSubject,
  projectSubject,
  organizationSubject,
  billingSubject,
  inviteSubject,
  z.tuple([z.literal('manage'), z.literal('all')])
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilitiesFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error('Role not found')
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  return ability
}