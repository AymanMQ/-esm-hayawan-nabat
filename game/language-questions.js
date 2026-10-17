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

/* Proverbs are common traditional expressions without an asserted author.
   Poetry snippets below are attributed to al-Mutanabbi and linked to public text.
   Literary riddles are original game material, not misattributed heritage. */
questions.push(
{id:'p1',track:'proverbs',level:1,kind:'أكمل المثل',q:'أكمل المثل: الصديق وقت ____',choices:['الضيق','النوم','الصباح','الشتاء'],answer:0,why:'يُضرب المثل في الصديق الذي يقف مع صاحبه وقت الشدة.',sourceTitle:'مثل عربي متداول'},
{id:'p2',track:'proverbs',level:1,kind:'أكمل المثل',q:'أكمل: يد واحدة لا ____',choices:['تصفق','تقرأ','تسافر','تنام'],answer:0,why:'يدل المثل على أهمية التعاون.',sourceTitle:'مثل عربي متداول'},
{id:'p3',track:'proverbs',level:1,kind:'أكمل المثل',q:'أكمل: في التأني السلامة، وفي العجلة ____',choices:['الندامة','السعادة','الراحة','القوة'],answer:0,why:'يدعو المثل إلى التروي وتجنب التسرع.',sourceTitle:'مثل عربي متداول'},
{id:'p4',track:'proverbs',level:2,kind:'أكمل المثل',q:'أكمل: ربَّ أخٍ لك لم تلده ____',choices:['أمك','أختك','يدك','دارك'],answer:0,why:'يُقال في الصديق القريب الذي يُعامل معاملة الأخ.',sourceTitle:'مثل عربي متداول'},
{id:'p5',track:'proverbs',level:2,kind:'معنى المثل',q:'ما المقصود بقولهم «لكل جواد كبوة»؟',choices:['حتى الماهر قد يخطئ','كل الخيل سريعة','النجاح مستحيل','الخطأ دائم'],answer:0,why:'المعنى أن المهارة لا تمنع الخطأ العارض.',sourceTitle:'مثل عربي متداول'},
{id:'p6',track:'proverbs',level:3,kind:'معنى المثل',q:'ما المعنى الأقرب لـ«على نفسها جنت براقش»؟',choices:['تسبّب المرء في ضرر أصابه','عاد المسافر سالمًا','انتصر الضعيف','نجح الصديق'],answer:0,why:'يُضرب لمن جلب الضرر على نفسه بفعله.',sourceTitle:'مثل عربي متداول'},
{id:'po1',track:'poetry',level:1,kind:'أكمل بيتًا',q:'أكمل للمتنبي: «على قدر أهل العزم تأتي ____»',choices:['العزائم','النجوم','الفضائل','الهمم'],answer:0,why:'يصف البيت العلاقة بين قوة العزم وعظمة الأعمال.',sourceTitle:'ديوان المتنبي — على قدر أهل العزم'},
{id:'po2',track:'poetry',level:2,kind:'أكمل بيتًا',q:'أكمل للمتنبي: «فلا تقنع بما دون ____»',choices:['النجوم','الغيوم','العيون','السهول'],answer:0,why:'يدعو البيت إلى طلب المعالي.',sourceTitle:'ديوان المتنبي — إذا غامرت في شرف مروم'},
{id:'po3',track:'poetry',level:3,kind:'فهم الشعر',q:'ما المعنى الأقرب لقول المتنبي «وتعظم في عين الصغير صغارها»؟',choices:['ضعيف الهمة يرى الصغير عظيمًا','كل الأشياء عظيمة','النجوم صغيرة','العزم يمنع الخوف'],answer:0,why:'يقارن الشاعر بين نظرة أصحاب الهمم المختلفة للأمور.',sourceTitle:'ديوان المتنبي — على قدر أهل العزم'},
{id:'r1',track:'riddles',level:1,kind:'لغز أدبي',q:'لي أوراق كثيرة ولا أغصان لي، وفي بطني حكايات؛ فمن أنا؟',choices:['كتاب','شجرة','مفتاح','قارب'],answer:0,why:'الكتاب له صفحات ويحتوي حكايات، لكنه ليس شجرة.',sourceTitle:'لغز أصلي للعبة'},
{id:'r2',track:'riddles',level:1,kind:'لغز كلمات',q:'أحمل الحبر وأترك أثرًا على الورق، ولا أتكلم؛ فمن أنا؟',choices:['قلم','مصباح','ساعة','حقيبة'],answer:0,why:'القلم يكتب بالحبر أو غيره ويترك أثرًا.',sourceTitle:'لغز أصلي للعبة'},
{id:'r3',track:'riddles',level:2,kind:'لغز أدبي',q:'كلما أخذت مني كبرتُ؛ ما أنا؟',choices:['الحفرة','النافذة','المرآة','الورقة'],answer:0,why:'كلما أزلت ترابًا من الحفرة اتسعت.',sourceTitle:'لغز أصلي للعبة'},
{id:'r4',track:'riddles',level:2,kind:'لغز كلمات',q:'أنا أول «نهار» وآخر «زمان»؛ أي حرف أنا؟',choices:['ن','ر','م','ز'],answer:0,why:'حرف النون أول كلمة نهار وآخر كلمة زمان.',sourceTitle:'لغز أصلي للعبة'},
{id:'r5',track:'riddles',level:3,kind:'لغز أدبي',q:'ما الذي تراه في «الليل» ثلاث مرات وفي «النهار» مرة؟',choices:['حرف اللام','حرف النون','حرف الهاء','حرف الراء'],answer:0,why:'في كلمة الليل ثلاث لامات، وفي النهار لام واحدة.',sourceTitle:'لغز أصلي للعبة'}
);


/* Diwaniya: original rhyme puzzles plus familiar classical verse with attribution.
   Original prompts are explicitly marked and not attributed to historical poets. */
questions.push(
{id:'d1',track:'diwaniya',level:1,kind:'قافية',q:'أي كلمة تقافي «نجوم»؟',choices:['غيوم','كتاب','طريق','قلم'],answer:0,why:'تنتهي نجوم وغيوم بالصوت «ـوم».',sourceTitle:'لغز قافية أصلي للعبة'},
{id:'d2',track:'diwaniya',level:1,kind:'قافية',q:'أي كلمة تقافي «سلام»؟',choices:['كلام','نهار','ضياء','صديق'],answer:0,why:'سلام وكلام تنتهيان بصوت «ـلام».',sourceTitle:'لغز قافية أصلي للعبة'},
{id:'d3',track:'diwaniya',level:1,kind:'قافية',q:'اختر زوج الكلمات المتقافي:',choices:['صفاء — ضياء','قمر — بحر','بيت — باب','ورد — قلم'],answer:0,why:'صفاء وضياء تتشاركان في نهاية «ـاء».',sourceTitle:'لغز قافية أصلي للعبة'},
{id:'d4',track:'diwaniya',level:1,kind:'أكمل البيت',q:'أكمل للمتنبي: «على قدر أهل العزم تأتي ____»',choices:['العزائم','النجوم','الليالي','الهموم'],answer:0,why:'هذا صدر بيت مشهور للمتنبي يربط عِظَم العمل بعِظَم العزم.',sourceTitle:'ديوان المتنبي — على قدر أهل العزم'},
{id:'d5',track:'diwaniya',level:1,kind:'قافية',q:'أي كلمة تقافي «نور»؟',choices:['سرور','قمر','نهر','قلم'],answer:0,why:'نور وسرور تشتركان في نهاية «ـور».',sourceTitle:'لغز قافية أصلي للعبة'},
{id:'d6',track:'diwaniya',level:2,kind:'اعرف القائل',q:'من قائل «على قدر أهل العزم تأتي العزائم»؟',choices:['المتنبي','البحتري','أبو تمام','أحمد شوقي'],answer:0,why:'البيت لأبي الطيب المتنبي.',sourceTitle:'ديوان المتنبي — على قدر أهل العزم'},
{id:'d7',track:'diwaniya',level:2,kind:'أكمل البيت',q:'أكمل للمتنبي: «إذا غامرت في شرف مروم / فلا تقنع بما دون ____»',choices:['النجوم','الغيوم','القلوب','الحلوم'],answer:0,why:'المتنبي يحث على طلب أعلى المراتب.',sourceTitle:'ديوان المتنبي — إذا غامرت في شرف مروم'},
{id:'d8',track:'diwaniya',level:2,kind:'القافية المختلفة',q:'أي كلمة لا تقافي الكلمات الأخرى؟',choices:['كتاب','حضور','عبور','سرور'],answer:0,why:'حضور وعبور وسرور تنتهي بـ«ـور»، بينما كتاب تختلف.',sourceTitle:'لغز قافية أصلي للعبة'},
{id:'d9',track:'diwaniya',level:3,kind:'حرف الروي',q:'ما حرف الروي المشترك في «سلام» و«كلام»؟',choices:['الميم','اللام','الألف','السين'],answer:0,why:'حرف الروي هنا الميم، وهو الحرف الذي تقوم عليه القافية.',sourceTitle:'لغز عروض أصلي للعبة'},
{id:'d10',track:'diwaniya',level:3,kind:'معنى بيت',q:'ما الفكرة التي يعبر عنها «على قدر أهل العزم تأتي العزائم»؟',choices:['تكبر الإنجازات بقدر قوة الهمة','المال أهم من العمل','الراحة أساس النجاح','الزمن لا يتغير'],answer:0,why:'يؤكد البيت أن قيمة العمل تعكس مقدار عزم صاحبه.',sourceTitle:'ديوان المتنبي — على قدر أهل العزم'}
);


/* Additional Diwaniya rounds: independently sourced classical verse or original puzzles. */
questions.push(
{id:'d11',track:'diwaniya',level:1,kind:'من القائل؟',q:'من صاحب البيت «إذا الشعب يومًا أراد الحياة»؟',choices:['أبو القاسم الشابي','المتنبي','أبو تمام','البحتري'],answer:0,why:'البيت من قصيدة «إرادة الحياة» للشاعر التونسي أبي القاسم الشابي.',sourceTitle:'إرادة الحياة — أبو القاسم الشابي (ويكي مصدر)',sourceUrl:'https://ar.wikisource.org/wiki/إرادة_الحياة'},
{id:'d12',track:'diwaniya',level:1,kind:'أكمل البيت',q:'أكمل للشابي: «فلا بد أن يستجيب ____»',choices:['القدر','المطر','القمر','البشر'],answer:0,why:'تكملة الشطر من قصيدة «إرادة الحياة».',sourceTitle:'إرادة الحياة — أبو القاسم الشابي (ويكي مصدر)',sourceUrl:'https://ar.wikisource.org/wiki/إرادة_الحياة'},
{id:'d13',track:'diwaniya',level:2,kind:'من القائل؟',q:'لمن البيت «وتعظم في عين الصغير صغارها»؟',choices:['المتنبي','أبو نواس','ابن زيدون','أحمد شوقي'],answer:0,why:'من قصيدة «على قدر أهل العزم تأتي العزائم» للمتنبي.',sourceTitle:'على قدر أهل العزم — المتنبي (ويكي مصدر)',sourceUrl:'https://ar.wikisource.org/wiki/على_قدر_أهل_العزم_تأتي_العزائم'},
{id:'d14',track:'diwaniya',level:2,kind:'أكمل البيت',q:'أكمل للمتنبي: «وتأتي على قدر الكرام ____»',choices:['المكارم','الفضائل','النجوم','الملاحم'],answer:0,why:'يقابل المتنبي بين أهل العزم والكرام وبين العزائم والمكارم.',sourceTitle:'على قدر أهل العزم — المتنبي (ويكي مصدر)',sourceUrl:'https://ar.wikisource.org/wiki/على_قدر_أهل_العزم_تأتي_العزائم'},
{id:'d15',track:'diwaniya',level:1,kind:'أكمل القافية',q:'أكمل العبارة المسجوعة: «في الليل أرى القمر، وفي الصباح أرى ____»',choices:['الشجر','الكتاب','القلم','البحرين'],answer:0,why:'القمر والشجر يتفقان في نهاية الراء المسبوقة بفتح، وهو سجع بسيط مؤلف للعبة.',sourceTitle:'نص أصلي مؤلف للعبة — تمرين قافية'},
{id:'d16',track:'diwaniya',level:2,kind:'لغز شعري',q:'«لا فم لي لكن أروي الأخبار، وفي أوراقي تحفظ الأسرار»؛ ما أنا؟',choices:['كتاب','مطر','قمر','مفتاح'],answer:0,why:'الكتاب يحمل الحكايات والمعلومات في صفحاته.',sourceTitle:'لغز منظوم أصلي مؤلف للعبة'},
{id:'d17',track:'diwaniya',level:2,kind:'لغز شعري',q:'«أجري بلا قدمين، وأحمل السفن في حين»؛ ما أنا؟',choices:['نهر','جبل','صحراء','شجرة'],answer:0,why:'النهر يجري وتطفو عليه السفن.',sourceTitle:'لغز منظوم أصلي مؤلف للعبة'},
{id:'d18',track:'diwaniya',level:3,kind:'حرف الروي',q:'أي حرف يصلح رويًّا مشتركًا لكلمات «ضياء» و«صفاء» و«رجاء»؟',choices:['الهمزة','الضاد','الفاء','الراء'],answer:0,why:'تنتهي الكلمات بهمزة تسبقها ألف مد.',sourceTitle:'لغز عروض أصلي مؤلف للعبة'},
{id:'d19',track:'diwaniya',level:3,kind:'لغز شعري',q:'«أسير معك في ضوء النهار، وأختفي في ظلام الدار»؛ ما أنا؟',choices:['الظل','الصوت','المطر','الهواء'],answer:0,why:'يظهر الظل مع الضوء ويختفي في الظلام.',sourceTitle:'لغز منظوم أصلي مؤلف للعبة'},
{id:'d20',track:'diwaniya',level:3,kind:'تمييز القافية',q:'أي مجموعة تشترك في الروي نفسه؟',choices:['أمل — عمل — جمل','نجم — بحر — قلم','دار — نور — غيم','قمر — كتاب — شمس'],answer:0,why:'تنتهي كلمات المجموعة الأولى بحرف اللام، وهو الروي المشترك.',sourceTitle:'لغز عروض أصلي مؤلف للعبة'}
);

function validate(list=questions){const ids=new Set();for(const q of list){if(ids.has(q.id)||!['general','verbal','proverbs','poetry','riddles','diwaniya'].includes(q.track)||![1,2,3].includes(q.level)||!Array.isArray(q.choices)||q.choices.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>=4||!q.q||!q.why)throw Error('سؤال غير صالح: '+q.id);ids.add(q.id)}return true}
function select(track,level,count=5,random=Math.random){if(!['general','verbal','proverbs','poetry','riddles','diwaniya','mixed'].includes(track)||![1,2,3].includes(level))throw Error('إعداد تحدٍ غير صالح');const pool=questions.filter(q=>(track==='mixed'||q.track===track)&&q.level<=level);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}if(track==='mixed'){
 const tracks=['general','verbal','proverbs','poetry','riddles'];
 const picked=[];for(const type of tracks){const first=pool.find(q=>q.track===type&&!picked.includes(q));if(first&&picked.length<count)picked.push(first)}
 return picked.concat(pool.filter(q=>!picked.includes(q)).slice(0,Math.max(0,count-picked.length)));
 }return pool.slice(0,Math.min(count,pool.length))}
return {questions,validate,select};
});
