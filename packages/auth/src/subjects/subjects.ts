import { z } from "zod";

export const inveiteSubject = z.tuple([
    z.union([
        z.literal('create'),
        z.literal('get'),
        z.literal('create'),
        z.literal('delete'),
    ]),
    z.literal('Invite')
])
