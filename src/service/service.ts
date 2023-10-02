import db from '../db/db';
import * as bcrypt from 'bcrypt';

const util = require('util');


const getColumnNames = (tableName: string): string[] => {
    const query = `PRAGMA table_info(${tableName});`;
    const result: any[] = db.prepare(query).all();
    return result.map(row => row.name);
}


const getValidate = (table: string, obj: { [key: string]: any }, validate: object) => {
    const errors: any = {};
    Object.keys(validate).forEach((vKey: string) => {
        (errors[vKey] as Array<string>) = [];
        const v: Array<string> = (validate as any)[vKey];
        v.forEach(rule => {
            switch (rule) {
                case 'required':
                    if (!(obj as any)[vKey])
                        errors[vKey].push(`Required`);
                    break;
                case 'email':
                    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
                    if (!emailRegex.test((obj as any)[vKey]))
                        errors[vKey].push('Invalid Email')
                    break;
                case 'unique':

                    const chek = db.prepare(`SELECT COUNT(*) as count
                                             FROM ${table}
                                             WHERE ${vKey} = ?`)
                    const chekExists: any = chek.get((obj as any)[vKey])
                    if (chekExists && chekExists.count) {
                        console.log('te')
                        errors[vKey].push(`Already exits`);
                    }
                    break;
                case 'confirm':
                    const searchKey: string = vKey.replace('c_', '');
                    if (obj[searchKey] !== obj[vKey]) {
                        errors[vKey].push(`Invalid confirm`);
                    }
                    break;
            }
        })
        if (errors[vKey].length == 0)
            delete errors[vKey]
    })
    if (Object.keys(errors).length > 0) {
        return errors;
    }
    return null;
}


export const orm = {
    create: (table: string, obj: { [key: string]: any }, validate?: object, hashField?: { [key: string]: Encode }): object => {
        const availableColumn = getColumnNames(table);
        const errors: object | null = validate ? getValidate(table, obj, validate) : null
        const res: any = {};
        if (!errors) {
            const keys: any = [], params: any = []
            Object.keys(obj).forEach(key => {
                if (availableColumn.includes(key)) {
                    keys.push(key)
                    params.push('?')
                } else {
                    delete (obj as any)[key];
                }
            })
            try {
                const insert = db.prepare(`INSERT INTO ${table} (${keys.join(', ')})
                                           VALUES (${params.join(',')})`)
                const info = insert.run(...Object.values(obj))
                res['id'] = info.lastInsertRowid
                const encodedData = async () => {
                    if (hashField) {
                        const updateField: any = {}
                        for (const k of Object.keys(hashField)) {
                            updateField[k] = await (hashField[k] as any)(obj[k])
                        }
                        const update = db.prepare(`UPDATE ${table}
                                                   SET ${Object.keys(updateField).map(column => `${column} = ?`).join(', ')}
                                                   WHERE ${'id'} = ?`)
                        const values = [...Object.values(updateField), res['id']];
                        update.run(...values);
                    }
                }
                encodedData().then(r => {
                });
            } catch (e) {
            }
        } else
            res['errors'] = errors;
        return res;
    },

    update: () => {
        //const insertStatement = db.prepare('UPDATE users set password = ? WHERE id = ?');
        //insertStatement.run('ml4kw', 1);
    },
    select: (table: string, obj?: any, specific?: string) => {
        if (!specific) specific = '*'
        let WHERE = '';
        if (Object.keys(obj).length > 0) {
            WHERE = 'WHERE ' + Object.keys(obj).map(e => {
                return `${e} = ?`
            }).join(', ')
        }
        console.log(WHERE);
        const select = db.prepare(`SELECT ${specific}
                                   FROM ${table} ${WHERE}`);

        return {
            all: () => select.all(...Object.values(obj)),
            one: () => select.get(...Object.values(obj))
        };
    }
};

class Encode {
    passwordHash(saltRounds?: any): any {
        return async (plainTextPassword: any) => {
            const salt = await bcrypt.genSalt(saltRounds);
            return bcrypt.hash(plainTextPassword, salt);
        }
    }

    async comparePassword(plainTextPassword: string, hashedPasswordFromDatabase: string) {

        const compareAsync = util.promisify(bcrypt.compare);
        return await compareAsync(plainTextPassword, hashedPasswordFromDatabase);

    }
}

export const encode = new Encode();
