import config from '../src/lib/firebase-config.json' with {type:'json'};
let token;
async function identity(method,body){const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${config.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error?.message??`Auth HTTP ${response.status}`);return data;}
try{
 const user=await identity('signUp',{returnSecureToken:true});token=user.idToken;
 const root=await fetch(config.databaseURL+'/.json');if(root.status!==401)throw Error('Unauthenticated database reads must be denied.');
 const rooms=await fetch(config.databaseURL+'/rooms.json?auth='+encodeURIComponent(token));if(rooms.status!==401)throw Error('Room collection browsing must be denied.');
 const room=await fetch(config.databaseURL+'/rooms/CHECKA/events.json?auth='+encodeURIComponent(token));if(!room.ok)throw Error('Authenticated room reads failed.');
 console.log('Live anonymous sign-in and Realtime Database access boundaries verified.');
}finally{if(token)await identity('delete',{idToken:token});}
