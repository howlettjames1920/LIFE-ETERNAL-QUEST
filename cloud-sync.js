/* Life Eternal Quest — optional Supabase multi-device sync layer.
   Configure SUPABASE_URL and SUPABASE_ANON_KEY below, then apply supabase.sql. */
const SUPABASE_URL = 'sb_publishable_qnMObu9_u2nq9kG7UejRIQ_5ObTGOMN;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYnd5anhudHh5eXhmZWZzamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTg0NzUsImV4cCI6MjEwOTAzNDQ3NX0.1Opq41Y2TtiOPW6JygBTsbiVP9Gy11UoWpVLYW7y7kg';
const QUEST_STORAGE_KEY = 'lifeEternalQuest.v1';

(async function cloudSync(){
  const ready = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoYnd5anhudHh5eXhmZWZzamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTg0NzUsImV4cCI6MjEwOTAzNDQ3NX0.1Opq41Y2TtiOPW6JygBTsbiVP9Gy11UoWpVLYW7y7kg_');
  const style = document.createElement('style');
  style.textContent = `#cloudGate{position:fixed;inset:0;z-index:9999;background:#17152fee;display:grid;place-items:center;padding:18px;font-family:system-ui}#cloudCard{width:min(440px,100%);background:#fff;border-radius:22px;padding:24px;color:#24213e;box-shadow:0 25px 80px #0005}#cloudCard h2{margin:0 0 5px;font-size:22px}#cloudCard p{color:#77758f;font-size:13px;line-height:1.5}#cloudCard input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #e4e0f0;border-radius:11px;margin:6px 0 10px;font:inherit}#cloudCard button{border:0;border-radius:11px;padding:12px 15px;background:#7655e8;color:white;font-weight:750;margin:5px 6px 0 0}#cloudCard button.alt{background:#f0ecff;color:#563ac7}#cloudStatus{position:fixed;right:12px;top:12px;z-index:1000;background:#fff;border:1px solid #e9e6f4;border-radius:99px;padding:7px 11px;font:700 11px system-ui;color:#6250a3;box-shadow:0 4px 15px #0001}#cloudStatus.offline{color:#9a641b}`;
  document.head.appendChild(style);
  const status=document.createElement('div');status.id='cloudStatus';status.textContent=ready?'☁ Connecting…':'☁ Cloud setup needed';document.body.appendChild(status);
  const gate=document.createElement('div');gate.id='cloudGate';gate.innerHTML=`<div id="cloudCard"><div style="font-size:28px">✦</div><h2>Life Eternal Quest</h2><p id="cloudIntro">Sign in with the same account on every phone to keep your fitness and spiritual tracker synchronized.</p><label>Email</label><input id="cloudEmail" type="email" autocomplete="email" placeholder="you@example.com"><label>Password</label><input id="cloudPassword" type="password" autocomplete="current-password" placeholder="At least 8 characters"><div id="cloudActions"><button id="cloudLogin">Sign in</button><button class="alt" id="cloudSignup">Create account</button></div><p id="cloudMessage" style="margin-top:14px"></p><p style="font-size:11px">Your records are private to your account. Use the same account on each device. Internet is required for live sync; offline edits sync when reconnected.</p></div>`;
  document.body.appendChild(gate);
  if(!ready){document.getElementById('cloudMessage').textContent='To activate syncing, create a free Supabase project, paste its Project URL and anon key into cloud-sync.js, and run the included supabase.sql. The app can still be previewed locally after setup.';return;}
  const lib=document.createElement('script');lib.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';document.head.appendChild(lib);
  await new Promise((resolve,reject)=>{lib.onload=resolve;lib.onerror=reject});
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  const msg=t=>document.getElementById('cloudMessage').textContent=t;
  let user=null, timer=null, applyingRemote=false, channel=null;
  const originalSet=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){originalSet(k,v);if(k===QUEST_STORAGE_KEY&&!applyingRemote&&user){clearTimeout(timer);timer=setTimeout(push,450)}};
  async function push(){if(!user)return;try{const payload=JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)||'{}');const {error}=await sb.from('quest_sync').upsert({user_id:user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;status.textContent='☁ Synced';status.classList.remove('offline')}catch(e){status.textContent='☁ Sync pending';status.classList.add('offline');console.error(e)}}
  async function connect(){const {data,error}=await sb.auth.getSession();if(error)throw error;user=data.session?.user||null;if(!user)return false;
    const {data:row,error:readErr}=await sb.from('quest_sync').select('payload').eq('user_id',user.id).maybeSingle();if(readErr)throw readErr;
    if(row?.payload){const incoming=JSON.stringify(row.payload);if(localStorage.getItem(QUEST_STORAGE_KEY)!==incoming){applyingRemote=true;originalSet(QUEST_STORAGE_KEY,incoming);applyingRemote=false;location.reload();return true;}}else{await push()}
    gate.remove();status.textContent='☁ Synced';
    channel=sb.channel('quest-sync-'+user.id).on('postgres_changes',{event:'*',schema:'public',table:'quest_sync',filter:'user_id=eq.'+user.id},payload=>{if(payload.new?.payload){applyingRemote=true;originalSet(QUEST_STORAGE_KEY,JSON.stringify(payload.new.payload));applyingRemote=false;status.textContent='☁ Updated';location.reload()}}).subscribe();
    window.addEventListener('online',push);window.addEventListener('beforeunload',()=>{clearTimeout(timer);push()});return true;
  }
  document.getElementById('cloudLogin').onclick=async()=>{try{msg('Signing in…');const {error}=await sb.auth.signInWithPassword({email:document.getElementById('cloudEmail').value,password:document.getElementById('cloudPassword').value});if(error)throw error;await connect()}catch(e){msg(e.message)}};
  document.getElementById('cloudSignup').onclick=async()=>{try{msg('Creating account…');const {data,error}=await sb.auth.signUp({email:document.getElementById('cloudEmail').value,password:document.getElementById('cloudPassword').value});if(error)throw error;if(data.session){await connect()}else{msg('Account created. Check your email to confirm, then return here and sign in.')}}catch(e){msg(e.message)}};
  try{const ok=await connect();if(ok&&gate.isConnected)gate.remove()}catch(e){msg(e.message);status.textContent='☁ Connection issue';status.classList.add('offline')}
})();
