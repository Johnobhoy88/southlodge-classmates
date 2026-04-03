(function(){
  // ============================================================
  // FX SOUND — ZzFX-powered game sound library
  // Professional procedural sounds from parameter arrays.
  // Each game can override with custom sounds via scene config.
  // ZzFXMicro embedded inline (~1.2KB).
  // ============================================================

  // ==================== ZzFXMicro v1.3.2 by Frank Force ====================
  // Embedded inline — zero external dependency
  var zzfxV=.3,zzfxX,zzfx=function(p,k,b,e,r,t,q,D,u,y,v,z,l,E,A,F,c,w,m,B,N){
    if(!zzfxX)try{zzfxX=new(window.AudioContext||window.webkitAudioContext)}catch(e){return}
    var M=Math,d=2*M.PI,R=44100,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,
    g=0,H=0,a=0,n=1,I=0,J=0,f=0,h=N<0?-1:1,x=d*h*N*2/R,L=M.cos(x),Z=M.sin,K=Z(x)/4,O=1+K,
    X=-2*L/O,Y=(1-K)/O,P=(1+h*L)/2/O,Q=-(h+L)/O,S=P,T=0,U=0,V=0,W=0;e=R*e+9;m*=R;r*=R;t*=
    R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;p*=zzfxV;for(h=e+m+r+t+c|0;a<h;k[a++]
    =f*p)++J%(100*F|0)||(f=q?1<q?2<q?3<q?4<q?(g/d%1<D/2)*2-1:Z(g**3):M.max(M.min(M.tan(g)
    ,1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):Z(g),f=(l?1-B+B*Z(d*a/l):1)*(4<q?
    f:(f<0?-1:1)*M.abs(f)**D)*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:
    0),f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2/p):f,N?f=W=S*T+Q*(T=U)+P*(U=f)-Y*V-X*(
    V=W):0),x=(b+=u+=y)*M.cos(A*H++),g+=x+x*E*Z(a**5),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l
    ||(b=C,u=G,n=n||1);X=zzfxX;p=X.createBuffer(1,h,R);p.getChannelData(0).set(k);b=X.
    createBufferSource();b.buffer=p;b.connect(X.destination);b.start()
  };

  // ==================== SOUND LIBRARY ====================
  // Each entry: [volume, randomness, frequency, attack, sustain, release, shape,
  //   shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime,
  //   noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo, filter]
  var SOUNDS = {
    // === CORRECT / POSITIVE ===
    correct:      [,,537,.02,.07,.21,1,.79,-4,,,,,,,,.06,.85,.06],        // bright coin collect
    correctHigh:  [,,800,.01,.04,.15,1,1.2,-5,,,,,,,,.04,.9,.04],        // higher pitched ding
    correctSoft:  [,,440,.03,.1,.3,0,1,,,,,,,,,,0.8,.08],                // gentle sine chime
    streak:       [,,700,.01,.02,.08,1,1.8,-8,4,,,.02,,,,,.9,.02],       // rapid sparkle
    starCollect:  [,,1e3,.01,.05,.1,1,2,,,800,.02],                       // star power-up

    // === WRONG / NEGATIVE ===
    wrong:        [,,200,.05,.08,.3,3,.2,,,-50,.05,.1],                   // soft buzz
    wrongGentle:  [,,180,.04,.1,.4,0,.8,,,,,,,,,,0.6,.1],                // gentle low tone
    wrongDeep:    [,,120,.06,.12,.5,0,.6],                                // deep rumble

    // === COMPLETE / CELEBRATION ===
    complete:     [,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],              // victory fanfare
    levelUp:      [,,580,.03,.25,.5,1,1.5,,3.3,-220,.08,.15],            // level up jingle
    celebration:  [,,1200,.01,.08,.15,1,2,-10,8,,,.03,,,,,.95,.02],      // sparkle burst

    // === UI / INTERACTION ===
    click:        [,,1200,.01,,.01,4,,,,,,,,,,,,,.5],                    // soft click
    tap:          [,,800,.005,.005,.01,4,2],                              // quick tap
    pop:          [,,400,.01,.01,.05,1,2,-10],                            // bubble pop
    whoosh:       [,,300,.02,,.1,4,.5,-5,,,,,,10],                       // whoosh transition
    slide:        [,,500,.02,.05,.1,0,1,5],                              // slide sound

    // === SPECIAL ===
    drop:         [,,1500,.005,.01,.01,4,2,-20],                         // water drop
    chime:        [,,660,.03,.15,.4,0,1.2,,,,,,,,,,.85,.06],             // bell chime
    magic:        [,,600,.02,.2,.4,1,1.5,-3,2,,,.05,,,,,0.7,.08],       // magical shimmer
    error:        [,,160,.04,.15,.4,3,.4,,,,,,,,,,0.5,.12]               // error alert
  };

  // ==================== PLAY API ====================
  var muted = false;

  function play(name, volumeOverride) {
    if (muted || window._classmatesMuted) return;
    var params = SOUNDS[name];
    if (!params) return;
    // Clone array so we don't mutate the library
    var p = params.slice();
    if (volumeOverride !== undefined) p[0] = volumeOverride;
    try { zzfx.apply(null, p); } catch (e) { /* audio context not ready */ }
  }

  // Play a custom ZzFX array (for per-game overrides)
  function playCustom(params) {
    if (muted || window._classmatesMuted) return;
    if (!params) return;
    try { zzfx.apply(null, params); } catch (e) {}
  }

  // Play a sequence of sounds with delays (for fanfares)
  function playSequence(names, interval) {
    interval = interval || 100;
    for (var i = 0; i < names.length; i++) {
      (function(idx) {
        setTimeout(function() { play(names[idx]); }, idx * interval);
      })(i);
    }
  }

  function setMuted(m) { muted = !!m; }
  function isMuted() { return muted || !!window._classmatesMuted; }

  // ==================== PUBLIC API ====================
  window.FXSound = {
    play: play,
    playCustom: playCustom,
    playSequence: playSequence,
    setMuted: setMuted,
    isMuted: isMuted,
    // Access to raw library for inspection/override
    sounds: SOUNDS,
    // Raw zzfx for advanced use
    zzfx: zzfx
  };

  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'fx-sound', {
      owner: 'platform',
      exports: ['FXSound']
    });
  }
})();
