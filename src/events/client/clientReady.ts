import type BotClient from "../../BotClient";
import { Events } from "discord.js";

export default class ReadyEvent {
    constructor(private client: BotClient) {
        client.once(Events.ClientReady, this.readyEvent.bind(this));
    }

    private async readyEvent() {
        console.log(`Logged in to`, this.client.user?.username)
        await this.client.distributedCluster.updateStatus(this.client.user!.id);
        setInterval(() => this.client.distributedCluster.updateStatus(this.client.user!.id), 5_000);
    }
}
