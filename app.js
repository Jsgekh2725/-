const cfg = window.SCRIPT_VAULT_CONFIG || {};
const hasBackend = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
const db = hasBackend ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
const $ = (id)=>document.getElementById(id);
let localScripts = JSON.parse(localStorage.getItem('scriptVaultDemo') || '[]');
const statusEl=$('status'), textarea=$('scriptText'), nameInput=$('scriptName'), sendBtn=$('sendBtn');
let toastTimer;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function setStatus(text,cls=''){statusEl.className='status '+cls;statusEl.innerHTML='<i></i>'+text}
textarea.addEventListener('input',()=> $('chars').textContent=textarea.value.length.toLocaleString('ar-SA')+' حرف');
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function shortDate(v){try{return new Date(v).toLocaleString('ar-SA',{dateStyle:'medium',timeStyle:'short'})}catch{return ''}}
async function getScripts(){
 if(db){const {data,error}=await db.from('scripts').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[]}
 return localScripts;
}
function render(items){
 $('count').textContent=items.length;
 if(!items.length){$('scripts').innerHTML='<div class="empty"><div class="empty-icon">⌁</div><p>ما فيه سكربتات محفوظة حالياً</p><small>أرسل أول سكربت عشان يظهر هنا</small></div>';return}
 $('scripts').innerHTML=items.map(s=>`<article class="script-card"><div class="script-top"><div><div class="script-title">${escapeHtml(s.name||'سكربت بدون اسم')}</div><div class="script-date">${shortDate(s.created_at||s.createdAt)}</div></div><div class="actions"><button data-copy="${s.id}">نسخ السكربت</button><button class="delete" data-delete="${s.id}">حذف</button></div></div><pre class="preview">${escapeHtml(s.content)}</pre></article>`).join('');
 $('scripts').querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const item=items.find(x=>String(x.id)===b.dataset.copy);try{await navigator.clipboard.writeText(item.content);toast('تم نسخ السكربت')}catch{toast('تعذر النسخ، حاول مرة ثانية')}});
 $('scripts').querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('متأكد تبي تحذف السكربت؟'))return;try{if(db){const {error}=await db.from('scripts').delete().eq('id',b.dataset.delete);if(error)throw error}else{localScripts=localScripts.filter(x=>String(x.id)!==b.dataset.delete);localStorage.setItem('scriptVaultDemo',JSON.stringify(localScripts))}await refresh();toast('تم حذف السكربت')}catch(e){toast('تعذر الحذف: '+e.message)}});
}
async function refresh(){try{render(await getScripts());setStatus(hasBackend?'متصل — حفظ سحابي':'وضع تجريبي — حفظ على هذا الجهاز',hasBackend?'connected':'')}catch(e){setStatus('تعذر الاتصال','error');toast('تعذر تحميل السكربتات')}}
sendBtn.onclick=async()=>{const content=textarea.value.trim();if(!content){toast('اكتب أو الصق السكربت أولاً');textarea.focus();return}sendBtn.disabled=true;try{const record={name:nameInput.value.trim()||'سكربت بدون اسم',content};if(db){const {error}=await db.from('scripts').insert(record);if(error)throw error}else{localScripts.unshift({id:Date.now().toString(),...record,created_at:new Date().toISOString()});localStorage.setItem('scriptVaultDemo',JSON.stringify(localScripts))}textarea.value='';nameInput.value='';$('chars').textContent='0 حرف';await refresh();toast('تم إرسال السكربت وحفظه')}catch(e){toast('تعذر الإرسال: '+e.message)}finally{sendBtn.disabled=false}};
refresh();
