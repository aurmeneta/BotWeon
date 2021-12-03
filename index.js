require("dotenv").config()
const { Client, Intents } = require("discord.js")

const config = require("./config.json")
const { Database } = require("./src/Database")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

// Conectar a la db y empezar el cliente
const db = new Database();
(async () => {
    await db.connect()
    client.login(process.env.BOT_TOKEN)
})()



client.once("ready", () => console.log("ready"))


client.on("messageCreate", async (message) => {
    if (message.author.bot) return

    // Revisar que sea un canal escuchado
    const channelIds = process.env.CHANNEL_IDS.split(",")
    if (!channelIds.some(id => message.channelId === id)) return

    // Revisar que tenga alguno de los prefijos configurados
    if (!config.prefixes.some(prefix => message.content.startsWith(prefix))) return

    // Actualizar count del usuario
    const { id: uid } = message.author
    const usuario = await db.buscarUsuario(uid)
    usuario.count++
    await db.actualizarUsuario(usuario)
    console.log(usuario)
})

