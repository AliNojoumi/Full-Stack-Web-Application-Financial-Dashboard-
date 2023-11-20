import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {authConfig} from './auth.config'; // Make sure this import is correct
import {sql} from '@vercel/postgres';
import {z} from 'zod';
import type {User} from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// Function to get user from the database by email
async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User>`SELECT * FROM users WHERE email = ${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const {auth, signIn, signOut} = NextAuth({
    ...authConfig, // Make sure authConfig is correctly defined
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    // Parse credentials, assuming you have a function named parseCredentials
                    const parsedCredentials = parseCredentials(credentials);

                    if (parsedCredentials.success) {
                        const {email, password} = parsedCredentials.data;
                        const user = await getUser(email);

                        if (user) {
                            const passwordsMatch = await bcrypt.compare(password, user.password);

                            if (passwordsMatch) {
                                return Promise.resolve(user); // Return a Promise
                            }
                        }
                    }

                    console.log('Invalid credentials');
                    return Promise.resolve(null); // Return a Promise
                } catch (error) {
                    console.error('Error during authorization:', error);
                    return Promise.resolve(null); // Return a Promise
                }
            },
        }),
    ],
});

// Function to parse credentials, replace with your actual implementation
function parseCredentials(credentials: any) {
    // Implement your parsing logic here
    // Make sure to return an object with a 'success' boolean property and a 'data' property
    return {success: true, data: credentials};
}
