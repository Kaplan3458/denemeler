/* Okur TTS browser bridge: original Okur worker, locally bundled and path adjusted.
 * See OKUR-LICENSE.txt and OKUR-NOTICE.txt for model attribution.
 * All inference stays in this browser; first visit downloads local model assets.
 */
'use strict';
window.OkurReader = (() => {
  const SAMPLE_RATE = 48000;
  let worker = null, ready = false, loading = false, requestId = 0;
  let chunks = [], pending = null, audio = null, activeUrl = null;
  let onStatus = () => {}, onFinished = () => {}, onFailure = () => {};
  const workerUrl = new URL('./okur/assets/worker-xKm_PKIH.js', document.baseURI);

  function status(s){ onStatus(s) }
  function clearSound(){
    if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null}
    if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null}
  }
  function stop(){
    ++requestId;chunks=[];pending=null;clearSound();
    if(worker) worker.postMessage({type:'cancel'});
  }
  function wav(samples){
    const size=samples.reduce((n,a)=>n+a.length,0);
    const ab=new ArrayBuffer(44+2*size), v=new DataView(ab);
    const word=(i,t)=>{for(let j=0;j<t.length;j++)v.setUint8(i+j,t.charCodeAt(j))};
    word(0,'RIFF');v.setUint32(4,36+size*2,true);word(8,'WAVEfmt ');
    v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,SAMPLE_RATE,true);v.setUint32(28,SAMPLE_RATE*2,true);
    v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,size*2,true);
    let pos=44;
    for(const arr of samples){for(let i=0;i<arr.length;i++){v.setInt16(pos,Math.max(-1,Math.min(1,arr[i]))*32767,true);pos+=2}}
    return new Blob([ab],{type:'audio/wav'});
  }
  function ensureWorker(){
    if(worker)return;
    worker=new Worker(workerUrl,{type:'module'});
    worker.onmessage = async ({data:m}) => {
      if(m.type==='progress'){
        if(loading){const pct=m.total?Math.min(100,Math.floor(100*m.loaded/m.total)):0;status(`Okur modeli hazırlanıyor: %${pct}`)}
        return;
      }
      if(m.type==='stage'){status('Okur ses motoru hazırlanıyor…');return}
      if(m.type==='ready'){ready=true;loading=false;status('Okur hazır.');return}
      if(m.type==='error'){
        if(m.id===undefined){loading=false;ready=false;onFailure('Okur modeli yüklenemedi: '+m.message)}
        else if(m.id===requestId){pending=null;onFailure('Okur ses üretemedi: '+m.message)}
        return;
      }
      if(m.id!==requestId || !pending) return;
      if(m.type==='chunk') {chunks[m.index]=m.audio;return}
      if(m.type==='done'){
        const current=pending;
        pending=null;
        if(!current || !chunks.length || chunks.some(x=>!x)){onFailure('Okur ses dosyasını tamamlayamadı.');return}
        try{
          clearSound();
          activeUrl=URL.createObjectURL(wav(chunks));
          audio=new Audio(activeUrl);
          audio.preload='auto';
          audio.playbackRate=current.rate;
          audio.onended=()=>{if(current.id===requestId)onFinished()};
          audio.onerror=()=>{if(current.id===requestId)onFailure('Üretilen ses oynatılamadı.')};
          chunks=[];
          status('Okur ile okunuyor…');
          await audio.play();
        }catch(e){if(current.id===requestId)onFailure('Ses başlatılamadı. Tekrar Dinle düğmesine dokunabilirsiniz. ('+e.message+')')}
      }
    };
    worker.onerror=e=>{loading=false;ready=false;onFailure('Okur ses motoru başlatılamadı: '+(e.message||'tarayıcı hatası'))};
  }
  function initialize(){
    try{ensureWorker();if(!ready && !loading){loading=true;status('Okur modeli cihazınıza indiriliyor…');worker.postMessage({type:'load',threads:1})}}
    catch(e){onFailure('Okur bu tarayıcıda başlatılamadı: '+e.message)}
  }
  function speak(text,rate){
    stop();
    if(!text.trim())return;
    initialize();
    const id=++requestId;
    chunks=[];pending={id,rate};
    status(ready?'Okur seslendiriyor…':'Okur modeli yükleniyor, ardından seslendirilecek…');
    worker?.postMessage({type:'speak',id,text,speed:1,seed:0,pause:1,temperature:1});
  }
  function configure(callbacks){onStatus=callbacks.status;onFinished=callbacks.finished;onFailure=callbacks.failure}
  function isSupported(){return !!(window.Worker && window.WebAssembly && window.Audio)}
  return {configure,initialize,speak,stop,isSupported};
})();
