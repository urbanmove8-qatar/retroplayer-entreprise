/**
 * RetroPlayer v1.0.0 (Enterprise Open Source)
 * Urbanmove 8 Kft. and Urbanmove 8 Qatar Sole Prop.
 */

(function() {
    const scripts = ['https://www.youtube.com/iframe_api', 'https://player.vimeo.com/api/player.js'];
    scripts.forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const s = document.createElement('script'); s.src = src; document.head.appendChild(s);
        }
    });

    const style = document.createElement('style');
    style.textContent = `
        video::-webkit-media-controls { display:none !important; }
        .retro-ui-wrapper {
            background: #ffffff; padding: 2px; border: 1px solid #1760a5;
            display: inline-flex; flex-direction: column; 
            position: relative; font-family: 'Segoe UI', sans-serif;
            box-shadow: 0 0 15px rgba(0,0,0,0.2); overflow: hidden;
        }
        .retro-ui-wrapper:fullscreen {
            width: 100vw !important; height: 100vh !important;
            display: flex !important; flex-direction: column !important;
            background: #000; padding: 0; border: none;
        }
        .retro-video-viewport { 
            background: #000; position: relative; overflow: hidden; 
            display: flex; align-items: center; justify-content: center; flex-grow: 1;
        }
        .retro-video-viewport iframe, .retro-video-viewport video { width: 100% !important; height: 100% !important; border:none; }
        .retro-control-bar {
            height: 48px; background: #0078d7;
            display: flex; align-items: center; padding: 0 15px; gap: 15px;
            color: #ffffff; flex-shrink: 0; z-index: 10;
        }
        .retro-btn { 
            height: 32px; min-width: 32px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 18px; border: 2px solid transparent; transition: 0.1s; user-select: none;
        }
        .retro-btn:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255,255,255,0.3); }
        .retro-btn:active { background: #ffffff; color: #0078d7; }
        .retro-seek-bar, .custom-vol-bg { height: 4px; background: rgba(255,255,255,0.2); cursor: pointer; position: relative; }
        .retro-seek-bar { flex-grow: 1; }
        .custom-vol-bg { width: 60px; }
        .retro-seek-fill, .custom-vol-fill { height: 100%; background: #ffffff; pointer-events: none; width: 0%; }
        .retro-time { color: #ffffff; font-size: 12px; font-weight: 300; min-width: 50px; text-align: center; }
        .retro-toast {
            position: absolute; top: 20px; right: 20px; background: rgba(0, 120, 215, 0.9);
            color: white; padding: 10px 20px; font-size: 13px; display: none; z-index: 100;
            border-left: 5px solid #fff;
        }
        .retro-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10001; display: none;
            align-items: center; justify-content: center;
        }
        .m-box { background: #fff; border: 1px solid #1760a5; width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .m-head { padding: 20px; color: #0078d7; font-size: 22px; font-weight: 300; }
        .m-body { padding: 0 20px 20px 20px; font-size: 13px; color: #555; line-height: 1.5; }
        .m-foot { padding: 15px; text-align: right; background: #f2f2f2; }
        .m-btn { padding: 7px 25px; border: 2px solid #999; background: #e1e1e1; cursor: pointer; font-weight: bold; }
        .retro-menu {
            position: fixed; background: #f9f9f9; border: 1px solid #999; 
            box-shadow: 5px 5px 15px rgba(0,0,0,0.2); z-index: 10000; display: none; min-width: 180px;
        }
        .retro-menu div { padding: 10px 15px; cursor: pointer; font-size: 12px; color: #333; }
        .retro-menu div:hover { background: #0078d7; color: #fff; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'retro-modal';
    modal.innerHTML = `<div class="m-box"><div class="m-head">RetroPlayer Enterprise</div><div class="m-body">Version 1.0.0-Release<br>Optimized for IE10/Windows 8 Framework.<br><br><b>Shortcuts:</b><br>Space: Play/Pause | M: Mute | F: Fullscreen</div><div class="m-foot"><button class="m-btn">Dismiss</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.m-btn').onclick = () => modal.style.display = 'none';

    const menu = document.createElement('div');
    menu.className = 'retro-menu';
    menu.innerHTML = `<div id="m-abt">About System</div><div onclick="location.reload()">Reset Interface</div>`;
    document.body.appendChild(menu);
    menu.querySelector('#m-abt').onclick = () => { modal.style.display = 'flex'; menu.style.display = 'none'; };

    window.RetroPlayerBeta = () => {
        const canDl = !!document.querySelector('downloadallow') && !document.querySelector('downloaddisallow');

        document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((el, idx) => {
            if (el.dataset.retroActive) return;
            el.dataset.retroActive = "true";

            const wrap = document.createElement('div'); wrap.className = 'retro-ui-wrapper';
            const toast = document.createElement('div'); toast.className = 'retro-toast';
            wrap.appendChild(toast);
            
            const origW = el.getAttribute('width') || el.clientWidth || 640;
            const origH = el.getAttribute('height') || el.clientHeight || 360;
            wrap.style.width = origW + 'px';

            const view = document.createElement('div'); view.className = 'retro-video-viewport';
            view.style.height = origH + 'px';
            const bars = document.createElement('div'); bars.className = 'retro-control-bar';
            
            bars.innerHTML = `
                <div class="retro-btn p-btn">▶</div>
                <div class="retro-btn m-btn">🔊</div>
                <div class="custom-vol-bg"><div class="custom-vol-fill" style="width: 100%"></div></div>
                <div class="retro-seek-bar"><div class="retro-seek-fill"></div></div>
                <div class="retro-time">0:00</div>
                <div class="retro-btn s-btn" style="font-size:11px; font-weight:bold">1.0x</div>
                ${canDl ? `<div class="retro-btn d-btn">↓</div>` : ''}
                <div class="retro-btn f-btn">⛶</div>
            `;

            el.parentNode.insertBefore(wrap, el);
            wrap.appendChild(view); view.appendChild(el); wrap.appendChild(bars);

            wrap.oncontextmenu = (e) => {
                e.preventDefault(); menu.style.display = 'block'; menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
            };

            const fill = bars.querySelector('.retro-seek-fill');
            const vFill = bars.querySelector('.custom-vol-fill');
            const vBg = bars.querySelector('.custom-vol-bg');
            const time = bars.querySelector('.retro-time');
            const pBtn = bars.querySelector('.p-btn');
            const mBtn = bars.querySelector('.m-btn');
            const sBtn = bars.querySelector('.s-btn');
            const bar  = bars.querySelector('.retro-seek-bar');

            const getX = (e, obj) => (e.clientX - obj.getBoundingClientRect().left) / obj.offsetWidth;
            const localToast = (m) => {
                toast.innerText = m; toast.style.display = 'block';
                setTimeout(() => toast.style.display = 'none', 2000);
            };

            const format = (s) => isNaN(s) ? "0:00" : Math.floor(s/60) + ":" + (Math.floor(s%60)).toString().padStart(2, '0');

            // Logic Switcher
            if (el.src && el.src.includes('youtube')) {
                const uid = "yt-" + Date.now() + idx; el.id = uid;
                if (!el.src.includes('enablejsapi=1')) el.src += (el.src.includes('?') ? '&' : '?') + 'enablejsapi=1&controls=0';
                const ytPoll = setInterval(() => {
                    if (window.YT && YT.Player) {
                        clearInterval(ytPoll);
                        const player = new YT.Player(uid, {
                            events: {
                                'onReady': (ev) => {
                                    pBtn.onclick = () => ev.target.getPlayerState() === 1 ? ev.target.pauseVideo() : ev.target.playVideo();
                                    mBtn.onclick = () => { 
                                        if(ev.target.isMuted()) { ev.target.unMute(); mBtn.innerText = '🔊'; localToast("Unmuted"); }
                                        else { ev.target.mute(); mBtn.innerText = '🔇'; localToast("Muted"); }
                                    };
                                    bar.onclick = (e) => ev.target.seekTo(getX(e, bar) * ev.target.getDuration());
                                    vBg.onclick = (e) => { let v = getX(e, vBg); ev.target.setVolume(v*100); vFill.style.width = (v*100)+'%'; };
                                    sBtn.onclick = () => { 
                                        let r = ev.target.getPlaybackRate(); let n = r >= 2 ? 0.5 : r + 0.5;
                                        ev.target.setPlaybackRate(n); sBtn.innerText = n + 'x'; localToast("Speed: " + n + "x");
                                    };
                                    setInterval(() => {
                                        fill.style.width = (ev.target.getCurrentTime() / ev.target.getDuration() * 100) + '%';
                                        time.innerText = format(ev.target.getCurrentTime());
                                        pBtn.innerText = ev.target.getPlayerState() === 1 ? 'Ⅱ' : '▶';
                                    }, 500);
                                }
                            }
                        });
                    }
                }, 500);
            } else {
                // Native/Vimeo fallback logic
                pBtn.onclick = () => el.paused ? el.play() : el.pause();
                mBtn.onclick = () => { el.muted = !el.muted; mBtn.innerText = el.muted ? '🔇' : '🔊'; localToast(el.muted ? "Muted" : "Unmuted"); };
                bar.onclick = (e) => el.currentTime = getX(e, bar) * el.duration;
                vBg.onclick = (e) => { el.volume = getX(e, vBg); vFill.style.width = (el.volume * 100) + '%'; };
                sBtn.onclick = () => { 
                    el.playbackRate = el.playbackRate >= 2 ? 0.5 : el.playbackRate + 0.5; 
                    sBtn.innerText = el.playbackRate + 'x'; localToast("Speed: " + el.playbackRate + "x");
                };
                el.ontimeupdate = () => {
                    fill.style.width = (el.currentTime / el.duration * 100) + '%';
                    time.innerText = format(el.currentTime);
                    pBtn.innerText = el.paused ? '▶' : 'Ⅱ';
                };
            }

            // Global Keybinds for active player
            window.addEventListener('keydown', (e) => {
                if (document.fullscreenElement !== wrap) return;
                if (e.code === 'Space') { e.preventDefault(); pBtn.click(); }
                if (e.code === 'KeyM') mBtn.click();
                if (e.code === 'KeyF') wrap.querySelector('.f-btn').click();
            });

            bars.querySelector('.f-btn').onclick = () => document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen();
        });
    };

    window.addEventListener('load', () => setTimeout(window.RetroPlayerBeta, 1000));
    document.addEventListener('click', () => menu.style.display = 'none');
})();
