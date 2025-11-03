export interface AuthorizationOptions {
    hasRole: Array<"admin" | "manager" | "user" | "officer">;
    allowSameUser?: boolean;
}
