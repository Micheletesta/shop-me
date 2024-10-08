import fp from 'fastify-plugin'
import moment from 'moment'
import fs from 'fs'
import { join } from 'desm'
import util from 'util'
import { pipeline } from 'stream'
async function generalFacility(fastify, options, done) {

    function base64ArrayBuffer(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return Buffer.toString(binary, 'base64');
    }



    const getUtenteDaUsernameOMail = async (username) => {
        try {
            return await fastify.database.models.Utente.findOne({
                where: {
                    [fastify.database.Op.or]: [
                        { email: username },
                        { username: username }
                    ],
                    end_date: { [fastify.database.Op.is]: null }
                }
            })
        } catch (err) {
            throw new Error('Problemi in fase di chiamata al DB' + err)
        }
    }

    const isEmailLiberaPerRegistrazione = async (email) => {
        try {
            return await getUtenteDaUsernameOMail(email) === null
        } catch (err) {
            throw new Error('Problemi in fase di chiamata al DB' + err)
        }
    }

    const generateTempToken = () => {
        let token = ''
        for (let i = 0; i < 3; i++) {
            token += fastify.stringFacility.randomString(13) + '-'
        }
        token += fastify.stringFacility.randomString(13)
        return token
    }

    const checkValidToken = async (token) => {
        const expirationTime = fastify.config.resetPassword.tokenExpirationTime
        let tokenLoaded
        let expirationDate
        tokenLoaded = await fastify.database.models.SecToken.findOne({
            where: {
                token: token
            }
        })
        if (!tokenLoaded) {
            const erroreDaInviare = Error('Token non valido')
            erroreDaInviare.code = 'token_non_valido'
            throw erroreDaInviare
        }
        expirationDate = moment(tokenLoaded.startDate).add(expirationTime, 'minutes')
        if (moment().isAfter(expirationDate)) {
            const err = Error('Token scaduto')
            err.code = 'token_non_valido'
            throw err
        } else {
            return tokenLoaded
        }
    }

    const disableAllTecniciForLiteVersion = async (user) => {
        let tecniciLoaded
        try {
            tecniciLoaded = await fastify.database.models.Utente.findAll({
                where: {
                    [fastify.database.Op.and]: [
                        { aziendamap_id: user.aziendamap_id },
                        {
                            username: { [fastify.database.Op.not]: user.username }
                        }
                    ],
                }
            })
            if (tecniciLoaded.length > 0) {
                for await (const tecnico of tecniciLoaded) {
                    await tecnico.update({
                        status: 'DISABLED'
                    })
                }
            }
        } catch (error) {
            throw new Error('Problemi in fase di disabilitazione dei tecnici' + error)
        }
        return tecniciLoaded
    }

    const fromCodiceAziendaToVistaAzienda = async (codiceAzienda, field) => {
        let userIdWP
        let vistaAzienda
        try {
            userIdWP = await fastify.database.models.VistaAzienda.findOne({
                where: {
                    [fastify.database.Op.and]: [
                        { meta_key: 'codice_azienda' },
                        { meta_value: codiceAzienda }
                    ],
                }
            })
            if (userIdWP) {
                vistaAzienda = await fastify.database.models.VistaAzienda.findOne({
                    where: {
                        [fastify.database.Op.and]: [
                            { meta_key: field },
                            { user_id: userIdWP.user_id }
                        ],
                    }
                })
                return vistaAzienda
            }
            return null
        } catch (error) {
            throw new Error('Problemi in fase di recupero dei dati dalla tabella vista azienda: ' + error)
        }
    }

    const aggiornaFlagAbbonamentoType = async (aziendamapId, lite) => {
        let aziendaMapLoaded
        try {
            aziendaMapLoaded = await fastify.database.models.AziendaMap.findByPk(aziendamapId)
            await aziendaMapLoaded.update({
                abbonamento_type: lite ? 0 : 1
            })
        } catch (error) {
            throw new Error('Problemi in fase di aggiornamento del flag su DB: ' + error)
        }
    }

    const posticipaDataScadenzaAbbonamentoPerConfermaPianoOUpgrade = async (data, aziendamapId) => {
        let aziendaMapLoaded
        let deltaScadenze
        try {
            aziendaMapLoaded = await fastify.database.models.AziendaMap.findByPk(aziendamapId)
            deltaScadenze = moment(aziendaMapLoaded.scadenza_abbonamento_date).diff(moment(data), 'days')
            if (deltaScadenze < 0) {
                aziendaMapLoaded.update({
                    scadenza_abbonamento_date: data
                })
            }
        } catch (error) {
            throw new Error('Problemi in fase di aggiornamento della data scadenza abbonamento su DB: ' + error)
        }
    }

    const isPagamentoAsSpecified = async (aziendamapId, tipoPagamento) => {
        let aziendamapLoaded
        try {
            aziendamapLoaded = await fastify.database.models.AziendaMap.findByPk(aziendamapId, {
                include: [
                    {
                        association: fastify.database.models.AziendaMap.azienda
                    }
                ]
            })
            return aziendamapLoaded.azienda.metodoDiPagamento == tipoPagamento
        } catch (error) {
            throw new Error('Problemi in fase di check del metodo di pagamento: ' + error)
        }
    }

    const stringReplace = (field, sentence) => {
        var placeholders = sentence.match(/\{(.*?)\}/g)
        if (placeholders) {
            placeholders.forEach((placeholder) => {
                let phText = placeholder.substring(1, placeholder.length - 1)
                const splitTextPipe = phText.split('|')
                let functToFormat = null
                if (splitTextPipe.length === 2) {
                    phText = splitTextPipe[0]
                    functToFormat = splitTextPipe[1]
                }
                let splitTextDot = phText.split('.')
                if (field[phText] || splitTextDot.length === 2) {
                    let value = null
                    splitTextDot.length === 2 ? (value = field[splitTextDot[0]][splitTextDot[1]]) : (value = field[phText])
                    if (functToFormat) {
                        const functEval = eval('(x) => ' + functToFormat + '(x)')
                        value = functEval(value)
                    }
                    sentence = sentence.replace(placeholder, value)
                }
            })
            return sentence
        }
    }

    const getMailAmministrazioneFromAziendaMapId = async (aziendamapId) => {
        let aziendamapLoaded
        try {
            aziendamapLoaded = await fastify.database.models.AziendaMap.findByPk(aziendamapId, {
                include: [
                    {
                        association: fastify.database.models.AziendaMap.azienda
                    }
                ]
            })
            return aziendamapLoaded.azienda.mailAmministrazione ?
                aziendamapLoaded.azienda.mailAmministrazione :
                aziendamapLoaded.azienda.mailPrincipale
        } catch (error) {
            throw new Error('Problemi in fase di check del metodo di pagamento: ' + error)
        }
    }

    const recuperaItemPriceIdDaAziendaMapId = async (aziendamapId) => {
        let aziendaMapLoaded
        const defaultItemPriceId = fastify.config.chargeBee.itemPriceId.yearly
        try {
            aziendaMapLoaded = await fastify.database.models.AziendaMap.findByPk(aziendamapId)
            return aziendaMapLoaded.item_price_id ? aziendaMapLoaded.item_price_id : defaultItemPriceId
        } catch (error) {
            throw new Error('Problemi in fase di recupero dell\'item price id per questo cliente: ' + error)
        }
    }

    const logErrorWithMail = (text) => {
        const message = {
            from: fastify.config.mail.internalComunication.mailSender,
            to: fastify.config.mail.internalComunication.mailSender,
            subject: fastify.config.mail.internalComunication.subject + 'ERRORE CRITICO RAPPORTINI',
            text: 'Serivizio --> ' + text.endpoint + '\nError --> ' + text.error
        }
        fastify.mailSender.mailSenderFunction(message, null, null)
    }

    const cancellaLoghiVecchiSeEsistenti = (aziendamapId) => {
        let path = fastify.config.logo.path
        const loghiInFolder = fs.readdirSync(path)
        loghiInFolder.forEach(nomeLogo => {
            if (nomeLogo.split('.')[0] == aziendamapId) {
                fs.unlinkSync(fastify.config.logo.path + nomeLogo)
            }
        })
    }

    const fromUnixTimeToTimestamp = (unixTime) => {
        return moment(new Date(unixTime * 1000)).format('YYYY-MM-DD')
    }

    const checkAppartenenzaAziendaMap = async (aziendaMapId, userId) => {
        const userLoaded = await fastify.database.models.Utente.findOne({
            where: {
                id: userId,
                aziendamap_id: aziendaMapId
            }
        })
        return userLoaded
    }

    const isUser = async () => {
        let user2Loaded = await fastify.database.models.Utente.findOne({
            where: {
                id: fastify.requestContext.get('user').id,
                role: 'user'
            }
        })
        return user2Loaded ? true : false
    }

    const isAdmin = async () => {
        let adminLoaded = await fastify.database.models.Utente.findOne({
            where: {
                id: fastify.requestContext.get('user').id,
                role: 'admin'
            }
        })

        return adminLoaded ? true : false
    }

    const caricaDatiAziendaDaAziendaMap = async () => {
        try {
            return await fastify.database.models.Azienda.findOne({
                where: {
                    aziendamap_id: fastify.requestContext.get('user').aziendamap_id
                }
            })
        } catch (error) {
            throw new Error('Problemi durante il caricamento delle info azienda: ' + error)
        }
    }

    const generateRandomIds = async (arraySource, maxLength, field = null) => {
        let randomlyChosenIds = []
        for (let i = 0; i < maxLength; i++) {
            const maxItem = field ? arraySource[arraySource.length][field] : arraySource[arraySource.length]
            const minItem = field ? arraySource[0][field] : arraySource[0]
            randomlyChosenIds.push(Math.floor(Math.random() * (maxItem - minItem + 1)) + minItem);
        }
        return randomlyChosenIds;
    }

    const writeFileToFs = async (data, imgType, id) => {
        const filename = data.filename
        const fullPath = join(import.meta.url, fastify.config.fileStorage[imgType], filename)
        const pump = util.promisify(pipeline)
        await pump(data.file, fs.createWriteStream(fullPath))
        const dbPath = String(fastify.config.fileStorage[imgType] + "/" + filename).replace("..", ".")
        await fastify.database.models[imgType].update({ img: dbPath }, {
            where: {
                id: id
            }
        })
        return dbPath
    }

    fastify.decorate('generalFacility', {
        generateTempToken,
        checkValidToken,
        disableAllTecniciForLiteVersion,
        fromCodiceAziendaToVistaAzienda,
        aggiornaFlagAbbonamentoType,
        posticipaDataScadenzaAbbonamentoPerConfermaPianoOUpgrade,
        isPagamentoAsSpecified,
        stringReplace,
        getMailAmministrazioneFromAziendaMapId,
        recuperaItemPriceIdDaAziendaMapId,
        logErrorWithMail,
        cancellaLoghiVecchiSeEsistenti,
        fromUnixTimeToTimestamp,
        isEmailLiberaPerRegistrazione,
        getUtenteDaUsernameOMail,
        checkAppartenenzaAziendaMap,
        isAdmin,
        isUser,
        caricaDatiAziendaDaAziendaMap,
        base64ArrayBuffer,
        generateRandomIds,
        writeFileToFs
    })

    done()
}

export default fp(generalFacility)
