import { AbilityBuilder, CreateAbility, MongoAbility, createMongoAbility } from "@casl/ability"
import { User } from "./models/user"
import { permissions } from "./permissions"
import { ProjectSubject } from "./subjects/project"
import { UserSubject } from "./subjects/user"

type AppAbilities = UserSubject | ProjectSubject | ['manage', 'all']

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilitiesFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error('Role not found')
  }

  permissions[user.role](user, builder)

  const ability = builder.build()

  return ability
}