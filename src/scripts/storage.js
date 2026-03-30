(function initClassmatesStorage(global){
const STORAGE_PREFIX='classmates_';
const STORAGE_PROBE_KEY='__classmates_storage_probe__';
const BACKUP_VERSION=1;

function canUseStorage(){
  try{
    localStorage.setItem(STORAGE_PROBE_KEY,'1');
    localStorage.removeItem(STORAGE_PROBE_KEY);
    return true;
  }catch(error){
    return false;
  }
}

const storageEnabled=canUseStorage();

function storageGetItem(key){
  if(!storageEnabled)return null;
  try{return localStorage.getItem(key)}catch(error){return null}
}

function storageSetItem(key,value){
  if(!storageEnabled)return false;
  try{localStorage.setItem(key,value);return true}catch(error){return false}
}

function storageRemoveItem(key){
  if(!storageEnabled)return false;
  try{localStorage.removeItem(key);return true}catch(error){return false}
}

function storageGetJson(key,fallback){
  const raw=storageGetItem(key);
  if(raw===null)return fallback;
  try{return JSON.parse(raw)}catch(error){return fallback}
}

function storageSetJson(key,value){
  return storageSetItem(key,JSON.stringify(value));
}

function storageListAppKeys(){
  if(!storageEnabled)return [];
  const keys=[];
  try{
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index);
      if(key&&key.startsWith(STORAGE_PREFIX))keys.push(key);
    }
  }catch(error){
    return [];
  }
  return keys.sort();
}

function storageReadNamespace(){
  const entries={};
  storageListAppKeys().forEach(key=>{
    const value=storageGetItem(key);
    if(value!==null)entries[key]=value;
  });
  return entries;
}

function storageClearAppData(){
  storageListAppKeys().forEach(storageRemoveItem);
}

function buildBackupPayload(){
  return {
    app:'Classmates',
    namespace:STORAGE_PREFIX,
    version:BACKUP_VERSION,
    exportedAt:new Date().toISOString(),
    entries:storageReadNamespace(),
  };
}

function storageDownloadBackup(){
  if(!storageEnabled)throw new Error('Browser storage is unavailable.');
  const payload=buildBackupPayload();
  const stamp=payload.exportedAt.slice(0,10);
  const fileName='classmates-backup-'+stamp+'.json';
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=fileName;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  return fileName;
}

function validateBackupPayload(payload){
  if(!payload||typeof payload!=='object')throw new Error('Backup file is invalid.');
  if(payload.app!=='Classmates'||payload.namespace!==STORAGE_PREFIX)throw new Error('This backup is not a Classmates backup.');
  if(!payload.entries||typeof payload.entries!=='object'||Array.isArray(payload.entries))throw new Error('Backup file has no usable data.');
}

async function storageImportBackupFile(file){
  if(!storageEnabled)throw new Error('Browser storage is unavailable.');
  const text=await file.text();
  let payload;
  try{
    payload=JSON.parse(text);
  }catch(error){
    throw new Error('Backup file is not valid JSON.');
  }
  validateBackupPayload(payload);
  storageClearAppData();
  Object.entries(payload.entries).forEach(([key,value])=>{
    if(key.startsWith(STORAGE_PREFIX)&&typeof value==='string')storageSetItem(key,value);
  });
  return payload;
}

global.storageIsAvailable=function(){return storageEnabled};
global.storageGetItem=storageGetItem;
global.storageSetItem=storageSetItem;
global.storageRemoveItem=storageRemoveItem;
global.storageGetJson=storageGetJson;
global.storageSetJson=storageSetJson;
global.storageListAppKeys=storageListAppKeys;
global.storageClearAppData=storageClearAppData;
global.storageDownloadBackup=storageDownloadBackup;
global.storageImportBackupFile=storageImportBackupFile;
})(window);
