import mongoose, { Schema, model, models } from 'mongoose';

const MONGODB_URI = "mongodb+srv://Techie:Techie@cluster0.5asxa.mongodb.net/aiclassroom";

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

const LinkSchema = new Schema({
    id: { type: String, required: true, unique: true },
    link: { type: String, required: true },
});

export const LinkModel = models.Link || model('Link', LinkSchema);