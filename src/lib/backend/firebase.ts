import {initializeApp,getApps} from 'firebase/app';
import {getAuth,signInAnonymously,connectAuthEmulator,signOut} from 'firebase/auth';
import {getDatabase,connectDatabaseEmulator} from 'firebase/database';
import config from '../firebase-config.json';
let connection:ReturnType<typeof connect>|undefined;
async function connect(){
 const emulator=import.meta.env.VITE_USE_FIREBASE_EMULATORS==='true';
 const app=getApps()[0]??initializeApp(emulator?{...config,projectId:'demo-nuns',apiKey:'demo-nuns-key',databaseURL:'https://demo-nuns-default-rtdb.firebaseio.com',authDomain:'demo-nuns.firebaseapp.com'}:config);
 const auth=getAuth(app),db=getDatabase(app);
 if(emulator){connectAuthEmulator(auth,'http://127.0.0.1:9297',{disableWarnings:true});connectDatabaseEmulator(db,'127.0.0.1',9197);}
 await auth.authStateReady();
 if(emulator&&auth.currentUser)try{await auth.currentUser.getIdToken(true);}catch{await signOut(auth);}
 if(!auth.currentUser)await signInAnonymously(auth);
 return{auth,db,uid:auth.currentUser!.uid};
}
export function firebase(){return connection??=(connect().catch(e=>{connection=undefined;throw e;}));}
