// Operator-only. Reuse the Firebase CLI login; credentials stay in memory.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {getGlobalDefaultAccount,getAccessToken}=require('firebase-tools/lib/auth');
const project='nuns-anicolao',account=getGlobalDefaultAccount();
if(!account)throw Error('Authenticate with: npx firebase login --interactive');
const {access_token:token}=await getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
const url=`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`;
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Goog-User-Project':project};
async function request(method='GET',body){const response=await fetch(url+(method==='PATCH'?'?updateMask=authorizedDomains':''),{method,headers,...(body?{body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok)throw Error(data.error?.message??`HTTP ${response.status}`);return data;}
const before=await request();if(!before.signIn?.anonymous?.enabled)throw Error('Deploy anonymous Auth first: npx firebase deploy --only auth --project nuns-anicolao');
const after=await request('PATCH',{authorizedDomains:[...new Set([...(before.authorizedDomains??[]),'localhost','nuns-anicolao.firebaseapp.com','anicolao.github.io'])]});
if(after.signIn?.anonymous?.enabled!==true)throw Error('Anonymous Auth verification failed.');
console.log(`Verified anonymous Auth for ${project}, using ${account.user.email}.`);
