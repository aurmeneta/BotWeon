const sqlite3 = require("sqlite3")
const { open } = require("sqlite")

class Database {
    async connect() {
        this.db = await open({
            filename: process.env.DB_PATH,
            driver: sqlite3.Database
        })

    }

    async createTable(name) {
        await this.db.exec(
            `CREATE TABLE IF NOT EXISTS SID_${name} (
                id TEXT PRIMARY KEY,
                count INTEGER DEFAULT 0
            );`)
    }

    async buscarUsuario(uid, serverId) {
        await this.createTable(serverId)

        let resultado = await this.db.get(`SELECT * FROM SID_${serverId} WHERE id = ${uid};`)

        if (resultado) return resultado
        else {
            await this.crearUsuario(uid, serverId)
            return await this.buscarUsuario(uid, serverId)
        }
    }

    async crearUsuario(uid, serverId) {
        await this.db.exec(`INSERT INTO SID_${serverId} (id)
                            VALUES (${uid});`)
    }

    async actualizarUsuario(usuario, serverId) {
        const { id, count } = usuario
        await this.db.exec(`UPDATE SID_${serverId}
                            SET count = ${count}
                            WHERE id = ${id};`)
    }

    async top(serverId, cantidad) {
        const list = await this.db.all(`SELECT * from SID_${serverId}
                                        ORDER BY count DESC
                                        LIMIT ${cantidad};`)
        return list
    }


}

module.exports.Database = Database