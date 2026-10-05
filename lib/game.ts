export const rounds = [
 {title:'Launch your model', prompt:'Your model is ready. How will you release it?', options:[
  {title:'Open release',desc:'Anyone can use and adapt the core model. Build adoption first.',delta:[-20,35,15]},
  {title:'Paid access',desc:'Keep your model closed and sell subscriptions.',delta:[25,-5,-10]},
  {title:'Free core, paid extras',desc:'Release a free base and sell advanced features.',delta:[5,15,5]}], events:[
  {title:'An open rival arrives',desc:'A strong free model makes paid access harder to sell.',effects:[[0,20,5],[-30,-20,-5],[-10,5,0]]},
  {title:'Enterprises want accountability',desc:'Businesses prioritize a clear contract and a supported product.',effects:[[-15,5,0],[20,15,5],[10,10,5]]}]},
 {title:'Find your revenue',prompt:'Adoption alone will not pay for the next model. What do you sell?',options:[
  {title:'Developer tools',desc:'Sell fine-tuning, integration and support around the model.',delta:[-15,15,10]},
  {title:'Hosted API',desc:'Charge for convenient access on your own infrastructure.',delta:[20,10,0]},
  {title:'Cloud partnership',desc:'Share revenue while a partner handles delivery.',delta:[25,20,-5]}],events:[
  {title:'The platform squeeze',desc:'A large platform offers cheap AI and tightens revenue-sharing terms.',effects:[[20,10,5],[-25,-10,0],[-35,-5,-5]]},
  {title:'A global distribution opportunity',desc:'Cloud buyers want a model they can deploy through existing systems.',effects:[[5,5,5],[0,5,0],[15,20,5]]}]},
 {title:'Choose your investment',prompt:'You have limited resources. Where do you invest next?',options:[
  {title:'Research',desc:'Improve the model to stay ahead of competitors.',delta:[-30,15,5]},
  {title:'Server reliability',desc:'Buy capacity and strengthen uptime.',delta:[-30,5,10]},
  {title:'Developer community',desc:'Improve documentation and help developers build.',delta:[-20,15,15]}],events:[
  {title:'Demand doubles overnight',desc:'Traffic surges. Reliable service becomes the deciding factor.',effects:[[-20,-15,-15],[20,25,10],[-10,-5,-5]]},
  {title:'A new benchmark race',desc:'A rival raises model performance. Customers compare capabilities.',effects:[[25,25,10],[-5,-10,0],[5,10,5]]}]},
 {title:'Make your final move',prompt:'The AI market is crowded. How do you defend your position?',options:[
  {title:'Cut prices',desc:'Compete on affordability and attract more customers.',delta:[-20,30,0]},
  {title:'Enterprise specialization',desc:'Sell tailored solutions with support and compliance tools.',delta:[15,5,5]},
  {title:'Build the ecosystem',desc:'Invest in reusable tools and community extensions.',delta:[-10,20,15]}],events:[
  {title:'Trust becomes the differentiator',desc:'Buyers demand dependable, tailored AI instead of another generic chatbot.',effects:[[-15,-15,-5],[20,15,10],[10,10,10]]},
  {title:'A wave of small developers',desc:'New app builders want affordable access and flexible tools.',effects:[[20,20,5],[-10,-5,0],[15,20,10]]}]}
] as const;
export function calculate(picks:Record<number,number>, events:number[], through:number) {
 const stats={cash:100,users:50,trust:50}; const history:{round:number;label:string;change:number[];note?:string}[]=[]; let failed=false;
 for(let r=0;r<=through;r++) { if(failed) break; const option=picks[r]; const before={...stats};
  if(option===undefined) { stats.cash-=15; history.push({round:r,label:'No decision',change:[-15,0,0],note:'Missed the deadline: 15 cash operating cost.'}); }
  else { const base=rounds[r].options[option].delta; const effect=rounds[r].events[events[r]].effects[option];
   stats.cash+=base[0]+effect[0]; stats.users=Math.max(0,stats.users+base[1]+effect[1]); stats.trust=Math.min(100,Math.max(0,stats.trust+base[2]+effect[2]));
   history.push({round:r,label:rounds[r].options[option].title,change:[stats.cash-before.cash,stats.users-before.users,stats.trust-before.trust]}); }
  if(stats.cash<=0)failed=true;
 }
 return {...stats,failed,score:failed?0:stats.cash+stats.users+stats.trust,history};
}
