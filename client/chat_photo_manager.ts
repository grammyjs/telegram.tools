import {client} from './client.ts';

export class ChatPhotoManager {
    static #chatPhotos = new Map<number, string>();
    
    static async getChatPhoto(chatId: number) {
        const chatPhoto = this.#chatPhotos.get(chatId);
        if (chatPhoto) {
            return chatPhoto;
        }
        try {
        const chat = await client().getChat(chatId);
        } catch {
            // Possibly no access
            return null
        }
    }
}
