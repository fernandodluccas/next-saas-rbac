import { AbilityBuilder } from "@casl/ability"
import { AppAbility } from "."
import { User } from "./models/user"
import { Role } from "./roles"

type PermissionsByRole = (User: User, builder: AbilityBuilder<AppAbility>) => void

export const permissions: Record<Role, PermissionsByRole> = {
    ADMIN(_, { can }) {
        can('manage', 'all')


    },
    MEMBER(user, { can }) {
        can('manage', 'Project')
        can(['update', 'delete'], 'Project', { ownerId: user.id })
    },
    BILLING() {
    }

}