require("dotenv").config()
const { Client, Intents } = require("discord.js")

const config = require("./config.json")
const { Database } = require("./src/Database")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

// Contador de invocaciones
let contador = 0

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
    const serverId = message.guild.id
    let usuario = await db.buscarUsuario(uid, serverId)
    usuario.count++
    await db.actualizarUsuario(usuario, serverId)

    // Responder Mensaje
    const cantidad_respuestas = config.replies.length
    const respuesta = config.replies[(usuario.count - 1) % cantidad_respuestas]
    message.reply(respuesta)

    // Mostrar Top más weones
    if (contador % 10 == 0) {
        const top = await db.top(serverId, 5)

        if (top.length < 3) return

        // Obtener nombres de usuario
        const promisesUsuarios = []
        top.forEach(({ id }) => promisesUsuarios.push(client.users.fetch(id)))
        const usuariosDiscord = await Promise.all(promisesUsuarios)

        // 
        usuariosDiscord.forEach((usuarioDiscord, idx) => {
            top[idx].nombre = usuarioDiscord.username
        })

        let mensajeTop = ":100: TOP MÁS WEONES DEL SERVER :100:\n\n"
        top.forEach((usuario, idx) => {
            mensajeTop += `${idx + 1}.\t ${usuario.nombre} - ${usuario.count} veces\n`
        })

        mensajeTop += "\nSigue siendo wn para aparecer en este top :star_struck:"

        message.channel.send(mensajeTop)
    }

    contador += 1
})

