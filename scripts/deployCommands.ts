import { InteractionCommandProps } from "@/types/commands";
import consola from "consola";
import { REST, RESTGetCurrentApplicationResult, Routes } from "discord.js";
import { config } from "dotenv"
import { readdirSync } from "fs";
import path from "path";

if(!process.argv[2]) {
    consola.error("Environment file not passed. Exiting");
    process.exit(0);
}
config({path: process.argv[2]});

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

const interactionFolder = path.join(process.cwd(), "src", "interaction");
(async () => {
    const applicationCommands : InteractionCommandProps["data"][] = [];
    for(const type of readdirSync(interactionFolder)) {
        for(const category of readdirSync(path.join(interactionFolder, type))) {
            for(const file of readdirSync(path.join(interactionFolder, type, category))) {
                const filePath = path.join(interactionFolder, type, category, file);
                const commandModule = await (await import(filePath)).default as InteractionCommandProps;
                if(!commandModule.data) {
                    consola.warn(`No command structure found for ${file}. Skipping...`);
                    continue;
                }
                applicationCommands.push(commandModule.data)
            }
        }
    }
    const [botDetails] = await Promise.all([
        rest.get(Routes.currentApplication()) as unknown as RESTGetCurrentApplicationResult,
        rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: applicationCommands
        }),
    ])
    consola.success(`Interaction commands are updated for ${botDetails.name}`)
})()