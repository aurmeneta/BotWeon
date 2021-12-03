const sqlite3 = require("sqlite3")
const { open } = require("sqlite")

class Database {
    constructor() {
        this.dbPath = process.env.DB_PATH
        this.tableName = process.env.TABLE_NAME
    }

    async connect() {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        })
        await this.createTable()
    }

    async createTable() {
        await this.db.exec(
            `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id TEXT PRIMARY KEY,
                count INTEGER DEFAULT 0
            )`)
    }

    async buscarUsuario(id) {
        let resultado = await this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ${id}`)

        if (resultado) return resultado
        else {
            await this.crearUsuario(id)
            return await this.buscarUsuario(id)
        }
    }

    async crearUsuario(id) {
        await this.db.exec(`INSERT INTO ${this.tableName} (id)
                            VALUES (${id});`)
    }

    async actualizarUsuario(usuario) {
        const { id, count } = usuario
        await this.db.exec(`UPDATE ${this.tableName}
                            SET count = ${count}
                            WHERE id = ${id}`)
    }


}

module.exports.Database = Database