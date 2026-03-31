(function(){
  function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}

  function genNbQ(target){const format=['A','B','C'][Math.floor(Math.random()*3)];let a,missing;if(target<=10){a=rand(1,target-1)}else if(target<=20){a=rand(1,target-1)}else{a=rand(5,target-5);a=Math.round(a/5)*5}missing=target-a;if(format==='B'){return{format:format,target:target,shown:missing,answer:a,display:'? + '+missing+' = '+target}}else if(format==='C'){const showFirst=Math.random()<0.5;return{format:format,target:target,left:showFirst?a:'?',right:showFirst?'?':missing,answer:showFirst?missing:a,display:'bar'}}else{return{format:format,target:target,shown:a,answer:missing,display:a+' + ? = '+target}}}

  window.ClassmatesNumberBonds = {
    genQuestion: genNbQ
  }
})();
