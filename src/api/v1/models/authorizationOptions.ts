export interface AuthorizationOptions {
    hasRole: Array<"officer" | "manager" | "user">;
    allowSameUser?: boolean;
}
