const admin = require('firebase-admin')
const {getFirestore} = require('firebase-admin/firestore')

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = getFirestore()

module.exports = {db}