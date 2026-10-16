/* Category configuration shared by UI and trusted server. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GameCategories=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DEFAULT=['اسم','حيوان','نبات','جماد','بلاد'];
const PRESETS=['لون','أكلة','مهنة','مدينة','رياضة','ملابس','شيء في البيت','مشروب','شخصية مشهورة'];
const MAX_CATEGORIES=9;
function clean(value){return String(value||'').normalize('NFC').trim().replace(/\s+/g,' ')}
function validate(input){if(!Array.isArray(input))throw Error('الفئات يجب أن تكون قائمة');if(input.length<3||input.length>MAX_CATEGORIES)throw Error('اختر من 3 إلى 9 فئات');const names=input.map(clean);if(names.some(x=>x.length<2||x.length>25||/[<>\\/\u0000-\u001f]/.test(x)))throw Error('اسم فئة غير صالح');if(new Set(names).size!==names.length)throw Error('لا يمكن تكرار الفئة');return names}
function propose(label,already=[]){const value=clean(label);if(value.length<2||value.length>25)throw Error('اكتب اسم فئة من 2 إلى 25 حرفًا');if(/[<>\\/\u0000-\u001f]/.test(value))throw Error('اسم فئة غير صالح');if(already.map(clean).includes(value))throw Error('الفئة مضافة بالفعل');return value}
return {DEFAULT,PRESETS,MAX_CATEGORIES,validate,propose};
});
