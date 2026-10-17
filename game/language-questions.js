/* Original sample language enrichment questions, not official test items. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanguageQuestions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const questions=[
{id:'g1',track:'general',level:1,kind:'مرادفات',q:'ما مرادف كلمة «سعيد»؟',choices:['مسرور','حزين','متعب','غاضب'],answer:0,why:'مسرور تعني فرِحًا أو سعيدًا.'},
{id:'g2',track:'general',level:1,kind:'أضداد',q:'ما ضد كلمة «واسع»؟',choices:['رحب','ضيق','كبير','طويل'],answer:1,why:'الضيق عكس الاتساع.'},
{id:'g3',track:'general',level:1,kind:'تصنيف',q:'أي الكلمات التالية اسم نبات؟',choices:['عصفور','مطرقة','ريحان','قطار'],answer:2,why:'الريحان نبات عطري.'},
{id:'g4',track:'general',level:1,kind:'معنى كلمة',q:'ما معنى «العطش»؟',choices:['الحاجة إلى النوم','الحاجة إلى الماء','الخوف من الظلام','الشعور بالبرد'],answer:1,why:'العطش شعور بالحاجة إلى شرب الماء.'},
{id:'g5',track:'general',level:1,kind:'إكمال جملة',q:'تشرق الشمس في ____.',choices:['الغرب','الجنوب','الشرق','الشمال'],answer:2,why:'الاتجاه الذي تشرق منه الشمس هو الشرق.'},
{id:'g6',track:'general',level:2,kind:'مرادفات',q:'ما أقرب معنى لكلمة «يُثابر»؟',choices:['يستسلم','يواصل بجد','يتردد','ينسى'],answer:1,why:'المثابرة هي الاستمرار في الجهد رغم الصعوبات.'},
{id:'g7',track:'general',level:2,kind:'أضداد',q:'ما ضد «التواضع»؟',choices:['الكرم','الحياء','التكبر','الصدق'],answer:2,why:'التكبر عكس التواضع.'},
{id:'g8',track:'general',level:2,kind:'سياق',q:'في قولنا «تدفقت الأفكار»، ما المقصود؟',choices:['اختفت الأفكار','تتابعت بكثرة','توقفت فجأة','تكررت كلمة واحدة'],answer:1,why:'التدفق هنا استعارة لتتابع الأفكار وسرعة ورودها.'},
{id:'g9',track:'general',level:3,kind:'معنى كلمة',q:'ما معنى «الوَجَل»؟',choices:['الفرح','الخوف','الهدوء','الكسل'],answer:1,why:'الوجل هو الخوف أو القلق.'},
{id:'g10',track:'general',level:3,kind:'سياق',q:'«ألقى الكاتب الضوء على القضية». ما المعنى المقصود؟',choices:['أشعل مصباحًا','ناقشها ووضحها','أخفاها','تجاهلها'],answer:1,why:'إلقاء الضوء على أمر يعني توضيحه ولفت الانتباه إليه.'},
{id:'v1',track:'verbal',level:1,kind:'تناظر لفظي',q:'قلم : كتابة :: فرشاة : ؟',choices:['قراءة','رسم','مشي','حساب'],answer:1,why:'القلم أداة للكتابة، والفرشاة أداة للرسم.'},
{id:'v2',track:'verbal',level:1,kind:'الكلمة المختلفة',q:'أي كلمة لا تنتمي إلى المجموعة؟',choices:['تفاح','برتقال','موز','كرسي'],answer:3,why:'الثلاث الأولى فواكه، والكرسي قطعة أثاث.'},
{id:'v3',track:'verbal',level:1,kind:'إكمال جملة',q:'كلما تدربت على القراءة، ____ فهمك للنصوص.',choices:['تحسن','توقف','اختفى','قل دائمًا'],answer:0,why:'التدرب المنتظم يساعد عادة على تحسين الفهم.'},
{id:'v4',track:'verbal',level:1,kind:'تناظر لفظي',q:'طبيب : مستشفى :: معلم : ؟',choices:['ملعب','مدرسة','مطار','مخبز'],answer:1,why:'علاقة المهنة بمكان العمل المعتاد.'},
{id:'v5',track:'verbal',level:1,kind:'سياق',q:'«الطالب نَهِم للمعرفة». ما المقصود؟',choices:['شديد الرغبة فيها','رافض لها','خائف منها','غير مهتم بها'],answer:0,why:'النهم هنا يدل على شدة الرغبة في المعرفة.'},
{id:'v6',track:'verbal',level:2,kind:'تناظر لفظي',q:'بذرة : شجرة :: فكرة : ؟',choices:['مشروع','تراب','مطر','نافذة'],answer:0,why:'قد تنمو البذرة لتصبح شجرة، وقد تتطور الفكرة إلى مشروع.'},
{id:'v7',track:'verbal',level:2,kind:'الكلمة المختلفة',q:'أي الكلمات تختلف في العلاقة؟',choices:['سفينة : بحر','طائرة : جو','قطار : سكة','كتاب : مطبخ'],answer:3,why:'الثلاث الأولى وسيلة نقل وبيئتها أو مسارها.'},
{id:'v8',track:'verbal',level:2,kind:'إكمال جملة',q:'لم يكتف الباحث بالافتراض، بل بحث عن ____ تدعم رأيه.',choices:['أدلة','شائعات','أعذار','أوهام'],answer:0,why:'الاستدلال العلمي يحتاج إلى أدلة.'},
{id:'v9',track:'verbal',level:3,kind:'تناظر لفظي',q:'مقدمة : كتاب :: تمهيد : ؟',choices:['خطاب','حجر','طريق','ساعة'],answer:0,why:'المقدمة والتمهيد يسبقان المتن أو المحتوى.'},
{id:'v10',track:'verbal',level:3,kind:'سياق',q:'«أصاب رأيه كبد الحقيقة». ما المعنى؟',choices:['اقترب من الحقيقة بدقة','تجنب الإجابة','غيّر الموضوع','أخطأ تمامًا'],answer:0,why:'التعبير يدل على إصابة الصواب بدقة.'}
];
function validate(list=questions){const ids=new Set();for(const q of list){if(ids.has(q.id)||!['general','verbal'].includes(q.track)||![1,2,3].includes(q.level)||!Array.isArray(q.choices)||q.choices.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>=4||!q.q||!q.why)throw Error('سؤال غير صالح: '+q.id);ids.add(q.id)}return true}
function select(track,level,count=5,random=Math.random){if(!['general','verbal','mixed'].includes(track)||![1,2,3].includes(level))throw Error('إعداد تحدٍ غير صالح');const pool=questions.filter(q=>(track==='mixed'||q.track===track)&&q.level<=level);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,Math.min(count,pool.length))}
return {questions,validate,select};
});
