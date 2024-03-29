export async function isAdmin(username: any, password: any): Promise<boolean> {
    if (username && password) {
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            return true;
        }
    }

    return false;
}