// Preloader
(function(){
  const pre = document.getElementById('preloader');
  const vid = document.getElementById('preloader-video');
  let started = false, closed = false;
  document.body.style.overflow = 'hidden';
  function finish(){
    if(closed) return; closed = true;
    pre.classList.add('closing');
    setTimeout(()=>{ pre.style.display='none'; document.body.style.overflow=''; }, 800);
  }
  function start(){
    if(started) return; started = true;
    pre.classList.add('started');
    
    // Fallback: force finish after 10 seconds if video stalls
    setTimeout(finish, 10000);
    
    try { 
      const p = vid.play(); 
      if(p && p.catch) p.catch(()=>setTimeout(finish,600)); 
    }
    catch(e){ setTimeout(finish,600); }
  }
  vid.addEventListener('ended', finish);
  vid.addEventListener('error', finish);
  ['click', 'touchstart'].forEach(ev => pre.addEventListener(ev, start));
})();

// Countdown
(function(){
  const target = new Date('2026-08-15T18:00:00').getTime();
  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-min');
  const sEl = document.getElementById('cd-sec');
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    const diff = Math.max(0, target - Date.now());
    dEl.textContent = pad(Math.floor(diff/86400000));
    hEl.textContent = pad(Math.floor(diff/3600000)%24);
    mEl.textContent = pad(Math.floor(diff/60000)%60);
    sEl.textContent = pad(Math.floor(diff/1000)%60);
  }
  tick(); setInterval(tick,1000);
})();

// Reveal on scroll
(function(){
  const els = document.querySelectorAll('.fade-up:not(.in-view)');
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
    }
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
})();

// RSVP
(function(){
  const form = document.getElementById('rsvp-form');
  const thanks = document.getElementById('rsvp-thanks');
  if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    form.classList.add('hidden');
    thanks.classList.remove('hidden');
  });
})();

// Background music (start on first interaction)
(function(){
  const music = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  if(!music || !toggle) return;

  let autoStarted = false;
  const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];

  function setToggleUI(isPlaying){
    toggle.classList.toggle('is-playing', isPlaying);
    toggle.textContent = isPlaying ? '❚❚' : '♪';
    toggle.setAttribute('aria-label', isPlaying ? 'Pause Music' : 'Play Music');
  }

  function playMusic(){
    return music.play()
      .then(()=>{
        setToggleUI(true);
        return true;
      })
      .catch(()=>{
        setToggleUI(false);
        return false;
      });
  }

  function removeUnlockListeners(){
    unlockEvents.forEach((eventName)=>{
      window.removeEventListener(eventName, onFirstInteraction, true);
    });
  }

  function onFirstInteraction(){
    if(autoStarted) return;
    playMusic().then((ok)=>{
      if(ok){
        autoStarted = true;
        removeUnlockListeners();
      }
    });
  }

  unlockEvents.forEach((eventName)=>{
    window.addEventListener(eventName, onFirstInteraction, { passive:true, capture:true });
  });

  toggle.addEventListener('click', ()=>{
    if(music.paused){
      playMusic().then((ok)=>{
        if(ok && !autoStarted){
          autoStarted = true;
          removeUnlockListeners();
        }
      });
    }else{
      music.pause();
      setToggleUI(false);
    }
  });

  music.addEventListener('pause', ()=>setToggleUI(false));
  music.addEventListener('play', ()=>setToggleUI(true));
  setToggleUI(false);
})();

