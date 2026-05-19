import { model, Schema } from "mongoose";
import Settings from "@/config/base.json";

interface PrefixSettingsI {
    guildId: string;
    prefix: string;
}

const schema = new Schema<PrefixSettingsI>({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, required: true, default: Settings.prefix }
});

export default model<PrefixSettingsI>('PrefixSettings', schema);