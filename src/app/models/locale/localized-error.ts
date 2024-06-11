export class LocalizedError extends Error {
    public constructor();
    public constructor(message?: string);
    public constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }
}
