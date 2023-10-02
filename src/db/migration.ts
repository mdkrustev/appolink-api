import db from "./db";

db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT NULL,
        email TEXT NULL,
        phone TEXT NULL,
        password TEXT NULL
    )
`);

/*
const columnName = 'password';
const columnType = 'TEXT'; // Choose the appropriate data type for your new column

db.serialize(() => {
    db.run(`ALTER TABLE users ADD COLUMN ${columnName} ${columnType}`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Added ${columnName} column to your_table_name`);
        }
    });
});

 */
