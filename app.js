const $=s=>document.querySelector(s);
const chat=$('#chat'), msg=$('#message');
let tasks=JSON.parse(localStorage.getItem('jarvis_tasks')||'[]');
let notes=JSON.parse(localStorage.getItem('jarvis_notes')||'[]');
let settings=JSON.parse(localStorage.getItem('jarvis_settings')||'{}');
$('#endpoint').value=settings.endpoint||'';
$('#speechToggle').checked=settings.speak!==false;

function save(){localStorage.setItem('jarvis_tasks',JSON.stringify(tasks));localStorage.setItem('jarvis_notes',JSON.stringify(notes));}
function bubble(text,who){const el=document.createElement('div');el.className='bubble '+who;el.textContent=text;chat.appendChild(el);chat.scrollTop=chat.scrollHeight;}
function say(text){if(settings.speak!==false && 'speechSynthesis' in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text));}}
function render(){
 $('#taskCount').textContent=tasks.length?`${tasks.filter(t=>!t.done).length} remaining · ${tasks.length} total`:'No tasks yet';
 $('#taskList').replaceChildren();
 tasks.forEach((t,i)=>{const row=document.createElement('label');row.className='task-item'+(t.done?' done':'');const cb=document.createElement('input');cb.type='checkbox';cb.checked=t.done;cb.onchange=()=>{tasks[i].done=cb.checked;save();render()};const span=document.createElement('span');span.textContent=t.text;row.append(cb,span);$('#taskList').append(row)});
 $('#notePreview').textContent=notes.length?notes[notes.length-1]:'Save something to remember.';
 $('#noteList').replaceChildren();notes.slice(-3).reverse().forEach(n=>{const d=document.createElement('div');d.className='note-item';d.textContent=n;$('#noteList').append(d)});
}
function localReply(text){
 const s=text.toLowerCase().trim();
 if(s.startsWith('add a reminder')||s.startsWith('remind me')||s.startsWith('add task')||s.startsWith('remember to')){
   let task=text.replace(/^(add a reminder to|add a reminder|remind me to|remind me|add task|remember to)\s*/i,'').trim();
   if(task){tasks.push({text:task,done:false});save();render();return `Added to your task list: ${task}. You can check it off in Daily tools.`}
 }
 if(s.includes('show my tasks')||s.includes('my reminders')||s.includes('what do i need to do')) return tasks.length?`Here are your tasks:\n${tasks.map((t,i)=>`${i+1}. ${t.done?'✓':'○'} ${t.text}`).join('\n')}`:'You have no tasks saved yet.';
 if(s.startsWith('save a note')||s.startsWith('note:')){
   const note=text.replace(/^(save a note|note:)\s*/i,'').trim();if(note){notes.push(note);save();render();return 'Saved that note on this device.'}
 }
 if(s.includes('what time')||s.includes('current time')) return `The time on this device is ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}.`;
 if(s.includes('what date')||s.includes("today's date")) return `Today is ${new Date().toLocaleDateString([], {weekday:'long',month:'long',day:'numeric',year:'numeric'})}.`;
 if(s.includes('plan my day')) return 'Let’s make a simple plan: 1) Pick your top priority. 2) Add school or work commitments. 3) Set aside time for a break. 4) Choose one thing to finish before the day ends.';
 return null;
}
async function send(text){
 text=text.trim();if(!text)return; bubble(text,'user');msg.value='';$('#status').textContent='PROCESSING';
 try{
   if(settings.endpoint){
     const res=await fetch(settings.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
     if(!res.ok)throw new Error('AI server returned '+res.status);
     const data=await res.json();const answer=data.reply||data.output||'The AI server returned no reply.';
     bubble(answer,'assistant');say(answer);
   }else{
     const answer=localReply(text)||'I can manage simple tasks and notes locally. To enable full conversational AI, add your trusted AI server URL in Settings. For now, try “add task finish science homework” or “show my tasks.”';
     bubble(answer,'assistant');say(answer);
   }
 }catch(e){const answer='I could not reach your AI server. Check the server URL and your internet connection. Your local tasks and notes are still available.';bubble(answer,'assistant');}
 $('#status').textContent='SYSTEM READY';
}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();send(msg.value)});
document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>send(b.dataset.prompt));
$('#addTask').onclick=()=>{const t=prompt('What do you need to do?');if(t?.trim()){tasks.push({text:t.trim(),done:false});save();render()}};
$('#addNote').onclick=()=>{const n=prompt('Write a note to save on this phone:');if(n?.trim()){notes.push(n.trim());save();render()}};
$('#settingsBtn').onclick=()=>$('#settingsDialog').showModal();
$('#saveSettings').onclick=()=>{settings={endpoint:$('#endpoint').value.trim(),speak:$('#speechToggle').checked};localStorage.setItem('jarvis_settings',JSON.stringify(settings));$('#settingsDialog').close();bubble('Settings saved.','assistant')};
$('#micBtn').onclick=()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){$('#voiceHint').textContent='Voice recognition is not supported in this browser. Try Chrome on Android.';return}
 const rec=new SR();rec.lang='en-US';rec.interimResults=false;rec.onstart=()=>$('#status').textContent='LISTENING';rec.onresult=e=>{msg.value=e.results[0][0].transcript;send(msg.value)};rec.onerror=()=>{$('#status').textContent='SYSTEM READY';$('#voiceHint').textContent='Microphone input was unavailable. Check browser permissions.'};rec.onend=()=>$('#status').textContent='SYSTEM READY';rec.start();
};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
