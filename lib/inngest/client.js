import { Inngest } from "inngest";

export const inngest = new Inngest({
    id: "SpendSmart",
    name: "SpendSmart",
    retryFunction: async (attempt) => ({
        delay: Math.pow(2, attempt) * 1000,
        maxAttempt: 2
    })
});
