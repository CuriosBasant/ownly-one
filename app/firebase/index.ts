import { cert, getApp, getApps, initializeApp, ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import serviceAccount from "./ownly-one-service-account.json"
// import { shopConverter } from "./models/shop"
// import { userConverter } from "./models/user"

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as ServiceAccount) })
}

export const app = getApp()

/* Firestore exports */
export const firestore = getFirestore(app)
export { FieldValue, Timestamp } from "firebase-admin/firestore"

export const collections = {
  users: firestore.collection("users"), //.withConverter(userConverter),
  shop: firestore.collection("shop"), //.withConverter(shopConverter),
}
