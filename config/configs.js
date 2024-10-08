import fs from 'fs'
import { join } from 'desm'

const buildUrlQueryArrayFromObject = (obj, string = '', objResult = {}, livello = 0, isObject = true, name) => {
    const objKeys = isObject ? Object.keys(obj) : null
    const objLength = isObject ? objKeys.length : obj.length
    for (let i = 0; i < objLength; i++) {
        iterateKeysTobuildUrlQueryStringFromObject(obj, isObject ? objKeys : null, i, string, objResult, livello, isObject, name)
    }
}

const iterateKeysTobuildUrlQueryStringFromObject = (obj, objKeys, index, string = '', objResult, livello, isObject, name) => {
    const indexOrKey = isObject ? objKeys[index] : index
    const objOrArray = obj[indexOrKey]
    const stringWithSeparator = string ? (isObject ? '.' : '$') : ''
    if (typeof objOrArray === 'object' && objOrArray !== null) {
        return buildUrlQueryArrayFromObject(
            objOrArray,
            string += stringWithSeparator + indexOrKey,
            objResult,
            ++livello,
            !Array.isArray(objOrArray),
            name
        )
    } else {
        if (objOrArray === '$ENV') {
            const key = string + stringWithSeparator + indexOrKey
            obj[indexOrKey] = process.env[name.replace(/-/g, '_') + '_config_' + key.replace(/\./g, '_')]
        }
    }
}

const path = join(import.meta.url,
    'config' + (process.env.NODE_ENV ? '.' + process.env.NODE_ENV : '') + '.json')
let confFinale = {}

try {
    const { name } = JSON.parse(fs.readFileSync(join(import.meta.url, '../package.json')))
    const conf = JSON.parse(fs.readFileSync(path))
    const confBase = JSON.parse(fs.readFileSync(join(import.meta.url,
        'config.base.json')))
    Object.keys(conf).forEach((key) => {
        confFinale[key] = typeof conf[key] === 'object' ? { ...confBase[key], ...conf[key] } : conf[key]
    })
    confFinale = {
        ...confBase,
        ...confFinale
    }
    buildUrlQueryArrayFromObject(confFinale, '', {}, 0, true, name)
} catch (err) {
    console.log('Problemi caricamento configurazioni', err)
}


export default confFinale