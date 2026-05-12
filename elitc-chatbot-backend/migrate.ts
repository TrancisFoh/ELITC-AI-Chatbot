import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

// Load the key file you just renamed
const serviceAccount = require('./firebase-key.json');

const prisma = new PrismaClient();

// 1. Initialize the Firebase connection
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
    console.log('🚀 Starting data migration...');

    try {
        // 2. Migrate Users
        console.log('📦 Fetching Users from Firebase...');
        const usersSnapshot = await db.collection('users').get();
        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            await prisma.user.create({
                data: {
                    id: doc.id, // Keep the exact same ID from Firebase
                    email: data.email || `${doc.id}@placeholder.com`,
                    // Convert Firebase timestamp to standard Date
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                }
            });
        }
        console.log(`✅ Successfully migrated ${usersSnapshot.size} users.`);

        // 3. Migrate Chats
        console.log('💬 Fetching Chats from Firebase...');
        const chatsSnapshot = await db.collection('chats').get();
        for (const doc of chatsSnapshot.docs) {
            const data = doc.data();

            // Safety check: Only migrate a chat if the user exists in our new DB
            const userExists = await prisma.user.findUnique({ where: { id: data.userId } });
            if (userExists) {
                await prisma.chat.create({
                    data: {
                        id: doc.id,
                        title: data.title || 'Untitled Chat',
                        userId: data.userId,
                        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    }
                });
            }
        }
        console.log(`✅ Successfully migrated chats.`);

        // 4. Migrate Messages
        console.log('📝 Fetching Messages from Firebase...');
        const messagesSnapshot = await db.collection('messages').get();
        for (const doc of messagesSnapshot.docs) {
            const data = doc.data();

            // Safety check: Only migrate a message if its parent chat exists
            const chatExists = await prisma.chat.findUnique({ where: { id: data.chatId } });
            if (chatExists) {
                await prisma.message.create({
                    data: {
                        id: doc.id,
                        role: data.role || 'user',
                        content: data.content || '',
                        chatId: data.chatId,
                        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    }
                });
            }
        }
        console.log(`✅ Successfully migrated messages.`);

        console.log('🎉 MIGRATION 100% COMPLETE! Your LocalDB is fully populated.');

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        // Close the database connection when done
        await prisma.$disconnect();
    }
}

migrateData();