export const generateId = (prefix: string) => {
    return `${prefix}_${Date.now()}-${Math.random().toString(36).substring(2,9)}`;
}