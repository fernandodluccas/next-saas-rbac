import { defineAbilitiesFor } from "@saas/auth";

const ability = defineAbilitiesFor({ role: 'ADMIN' })

const userCanInviteSomeone = ability.can('invite', 'User')
const userCanDeleteUser = ability.can('delete', 'User')

console.log(userCanInviteSomeone) // true
console.log(userCanDeleteUser) // false
