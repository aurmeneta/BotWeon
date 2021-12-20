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
            )`)
    }

    async buscarUsuario(uid, server_id) {
        await this.createTable(server_id)

        let resultado = await this.db.get(`SELECT * FROM SID_${server_id} WHERE id = ${uid}`)

        if (resultado) return resultado
        else {
            await this.crearUsuario(uid, server_id)
            return await this.buscarUsuario(uid, server_id)
        }
    }

    async crearUsuario(uid, server_id) {
        await this.db.exec(`INSERT INTO SID_${server_id} (id)
                            VALUES (${uid});`)
    }

    async actualizarUsuario(usuario, server_id) {
        const { id, count } = usuario
        await this.db.exec(`UPDATE SID_${server_id}
                            SET count = ${count}
                            WHERE id = ${id}`)
    }


}

module.exports.Database = Database