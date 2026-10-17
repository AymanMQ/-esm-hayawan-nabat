(()=>{'use strict';
const week=document.getElementById('weekTab'),month=document.getElementById('monthTab'),period=document.getElementById('rankingPeriod'),panel=document.getElementById('rankingPanel'),empty=document.getElementById('rankingEmpty');
if(!week||!month||!period||!panel||!empty)return;
const show=type=>{
 const weekly=type==='week';
 week.setAttribute('aria-selected',String(weekly));month.setAttribute('aria-selected',String(!weekly));
 panel.setAttribute('aria-labelledby',weekly?'weekTab':'monthTab');
 period.textContent=weekly?'الترتيب الأسبوعي — يبدأ الأحد 12:00 صباحًا بتوقيت السعودية':'الترتيب الشهري — يبدأ أول كل شهر بتوقيت السعودية';
 empty.innerHTML='';
 const title=document.createElement('strong');title.textContent='🏅 الترتيب قريبًا';
 empty.append(title,document.createTextNode(weekly?'نجهّز لوحة شرف أسبوعية تعتمد نتائج مؤكدة على الخادم.':'نجهّز لوحة شرف شهرية تعتمد نتائج مؤكدة على الخادم.'));
};
week.addEventListener('click',()=>show('week'));month.addEventListener('click',()=>show('month'));
for(const [button,type] of [[week,'week'],[month,'month']])button.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const target=type==='week'?month:week;target.focus();show(type==='week'?'month':'week');
});
show('week');
})();