/* Small hand-curated learning notes for already approved game answers.
   Missing words never receive invented meanings. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WordLearning=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const notes=[
{word:'ريحان',category:'نبات',meaning:'نبات عطري تُستخدم أوراقه في الطعام والعطور.',example:'زرعنا الريحان في حديقة المنزل.',choices:['نبات عطري','نوع من الطيور','أداة للقياس','مدينة'],correct:0},
{word:'أقحوان',category:'نبات',meaning:'نبات مزهر تُعرف أزهاره بألوان متعددة.',example:'تفتحت أزهار الأقحوان في الربيع.',choices:['نبات مزهر','نوع من الأسماك','آلة موسيقية','معدن'],correct:0},
{word:'صبار',category:'نبات',meaning:'نبات يستطيع كثير من أنواعه تحمل الجفاف.',example:'ينمو الصبار في البيئات قليلة المطر.',choices:['نبات يتحمل الجفاف','طائر مهاجر','حجر كريم','نوع من الملابس'],correct:0},
{word:'سنجاب',category:'حيوان',meaning:'حيوان ثديي صغير ذو ذيل كثيف، يتسلق الأشجار.',example:'قفز السنجاب بين الأغصان.',choices:['حيوان ثديي صغير','شجرة مثمرة','أداة زراعية','دولة'],correct:0},
{word:'كنغر',category:'حيوان',meaning:'حيوان جرابي يشتهر بقوائم خلفية قوية وقفزات طويلة.',example:'يقفز الكنغر باستخدام قوائمه الخلفية.',choices:['حيوان جرابي','نوع من الزهور','مركبة','لون'],correct:0},
{word:'يربوع',category:'حيوان',meaning:'قارض صحراوي صغير ذو رجلين خلفيتين طويلتين.',example:'يتحرك اليربوع بالقفز في الصحراء.',choices:['قارض صحراوي','نوع من الفاكهة','قارب','عاصمة'],correct:0},
{word:'بوصلة',category:'جماد',meaning:'أداة تساعد على معرفة الاتجاهات.',example:'استعان الرحالة بالبوصلة لتحديد الشمال.',choices:['أداة لمعرفة الاتجاهات','طعام شعبي','نبات طبي','رياضة'],correct:0},
{word:'فانوس',category:'جماد',meaning:'مصباح محمول يُستخدم للإضاءة.',example:'أضاء الفانوس الغرفة.',choices:['مصباح محمول','حيوان بحري','شجرة','مهنة'],correct:0},
{word:'مريمية',category:'نبات',meaning:'نبات عطري تُستخدم أوراقه في مشروبات عشبية.',example:'حضّرت الأسرة مشروب المريمية.',choices:['نبات عطري','نوع من الثدييات','آلة حاسبة','دولة'],correct:0},
{word:'جربوع',category:'حيوان',meaning:'اسم يُطلق على حيوان قارض صحراوي يقفز بقوائمه الخلفية.',example:'رأى المسافر جربوعًا في الصحراء.',choices:['حيوان صحراوي','طائر جارح','فاكهة','أداة مطبخ'],correct:0},
{word:'زيتون',category:'نبات',meaning:'شجرة مثمرة يُستخرج الزيت من ثمارها.',example:'قطف المزارع ثمار الزيتون.',choices:['شجرة مثمرة','معدن','حشرة','مدينة'],correct:0},
{word:'دلفين',category:'حيوان',meaning:'ثديي بحري يتنفس الهواء.',example:'سبح الدلفين قرب القارب.',choices:['ثديي بحري','نوع من الأسماك','طائر','زهرة'],correct:0}
];
const normalize=s=>String(s||'').trim().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ');
const byKey=new Map(notes.map(n=>[JSON.stringify([n.category,normalize(n.word)]),n]));
function noteFor(category,word){return byKey.get(JSON.stringify([category,normalize(word)]))||null}
function questionsFor(history){const result=[];const seen=new Set();for(const item of Object.values(history?.entries||{})){const note=noteFor(item.category,item.word);if(!note||seen.has(note.word+'|'+note.category))continue;seen.add(note.word+'|'+note.category);result.push({id:note.category+'|'+note.word,q:'ما معنى «'+note.word+'»؟',choices:note.choices,answer:note.correct,why:note.meaning})}return result}
function validate(){for(const n of notes)if(!n.word||!n.category||!n.meaning||!n.example||n.choices.length!==4||n.correct<0||n.correct>3)throw Error('Invalid learning note');return true}
return {notes,noteFor,questionsFor,validate};
});
