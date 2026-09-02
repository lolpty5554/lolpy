/**
 * SiamCraft Hub - Main Interactive JavaScript Application
 * Features: Web Audio SFX, 3D Skin Canvas, Live Filters, Forum Posting, Server Voting, Universal Search
 */

document.addEventListener('DOMContentLoaded', () => {
    let appData = window.SiamCraftData;

    // Helper to update stats UI dynamically
    function updateStatsUI() {
        const statNumbers = document.querySelectorAll('.stats-strip .stat-number');
        if (statNumbers.length >= 4 && appData && appData.stats) {
            statNumbers[0].textContent = appData.stats.totalOnlinePlayers.toLocaleString() + '+';
            statNumbers[1].textContent = appData.stats.activeServers.toLocaleString() + '+';
            statNumbers[2].textContent = appData.stats.communityMembers.toLocaleString() + '+';
            statNumbers[3].textContent = appData.stats.resourcesShared.toLocaleString() + '+';
        }
    }

    // Helper to update the featured server card dynamically
    function updateFeaturedServerUI() {
        if (!appData || !appData.servers) return;
        const featuredServer = appData.servers.find(s => s.featured);
        if (featuredServer) {
            const featuredCard = document.querySelector('.hero-featured-card');
            if (featuredCard) {
                const header = featuredCard.querySelector('.featured-card-header');
                if (header) {
                    header.style.backgroundImage = `url('${featuredServer.banner}')`;
                    const playerCount = header.querySelector('.live-player-tag span:not(.pulse-dot)');
                    if (playerCount) playerCount.textContent = `${featuredServer.players}/${featuredServer.maxPlayers} คน`;
                }
                const name = featuredCard.querySelector('.server-name');
                if (name) name.textContent = `⚔️ ${featuredServer.name}`;
                const ping = featuredCard.querySelector('.server-ping');
                if (ping) ping.textContent = `📶 ${featuredServer.ping}ms (ไทยแลนด์)`;
                const desc = featuredCard.querySelector('.server-desc-short');
                if (desc) desc.textContent = featuredServer.description;
                const ipAddress = featuredCard.querySelector('.ip-address');
                if (ipAddress) ipAddress.textContent = featuredServer.ip;
                const copyIpBox = featuredCard.querySelector('.copy-ip-box');
                if (copyIpBox) copyIpBox.setAttribute('onclick', `copyIP('${featuredServer.ip}')`);
                const voteBtn = featuredCard.querySelector('.btn-vote-server');
                if (voteBtn) voteBtn.setAttribute('onclick', `voteServer('${featuredServer.id}')`);
            }
        }
    }

    // Helper to safely get the active Supabase client instance
    function getSupabase() {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            return window.supabaseClient;
        }
        if (window.supabase && typeof window.supabase.from === 'function') {
            return window.supabase;
        }
        if (typeof supabase !== 'undefined' && supabase && typeof supabase.from === 'function') {
            return supabase;
        }
        return null;
    }

    // Function to load all data from Supabase, falling back to local data if needed
    async function initSupabaseData() {
        const sb = getSupabase();
        if (sb) {
            try {
                // Fetch stats
                const { data: statsData, error: statsErr } = await sb.from('stats').select('*').single();
                if (statsErr) console.warn("Supabase stats fetch error:", statsErr);

                // Fetch servers
                const { data: serversData, error: srvErr } = await sb.from('servers').select('*').order('votes', { ascending: false });
                if (srvErr) console.warn("Supabase servers fetch error:", srvErr);

                // Fetch posts with comments
                const { data: postsData, error: postErr } = await sb.from('posts')
                    .select('*, comments(*)')
                    .order('created_at', { ascending: false });
                if (postErr) console.warn("Supabase posts fetch error:", postErr);

                // Sort comments on each post by created_at ascending
                if (postsData) {
                    postsData.forEach(post => {
                        if (post.comments) {
                            post.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                        } else {
                            post.comments = [];
                        }
                    });
                }

                // Fetch resources
                const { data: resourcesData } = await sb.from('resources').select('*');

                // Fetch events
                const { data: eventsData } = await sb.from('events').select('*');

                // Fetch guides
                const { data: guidesData } = await sb.from('guides').select('*');

                appData = {
                    stats: statsData || appData.stats,
                    servers: (serversData && serversData.length > 0) ? serversData : appData.servers,
                    posts: (postsData && postsData.length > 0) ? postsData : appData.posts,
                    resources: (resourcesData && resourcesData.length > 0) ? resourcesData : appData.resources,
                    events: (eventsData && eventsData.length > 0) ? eventsData : appData.events,
                    guides: (guidesData && guidesData.length > 0) ? guidesData : appData.guides
                };
                console.log("⚡ Loaded data successfully from Supabase!", appData);

                // Start Supabase Realtime Subscription
                setupRealtimeSubscription(sb);

            } catch (err) {
                console.error("Error loading data from Supabase, falling back to local data:", err);
            }
        }

        // Initial UI Render
        updateStatsUI();
        updateFeaturedServerUI();
        renderServers('all');
        renderPosts('all');
        renderResources('all');
        updateCountdowns();
    }

    // ==========================================================================
    // 1. Audio System (Web Audio API Synthesizer)
    // ==========================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = localStorage.getItem('siamcraft_muted') === 'true';
            this.initAudio();
        }

        initAudio() {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }

        resumeContext() {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playClick() {
            if (this.muted || !this.ctx) return;
            this.resumeContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        }

        playOrb() {
            if (this.muted || !this.ctx) return;
            this.resumeContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const freqs = [587.33, 880, 1174.66]; // D5, A5, D6
            const chosen = freqs[Math.floor(Math.random() * freqs.length)];
            osc.frequency.setValueAtTime(chosen, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        }

        playLevelUp() {
            if (this.muted || !this.ctx) return;
            this.resumeContext();
            const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.08);
                osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
            });
        }

        toggleMute() {
            this.muted = !this.muted;
            localStorage.setItem('siamcraft_muted', this.muted);
            return this.muted;
        }
    }

    const soundEngine = new SoundEngine();

    // Sound toggle button UI setup
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
        if (soundEngine.muted) soundToggleBtn.classList.add('muted');
        soundToggleBtn.addEventListener('click', () => {
            const isMuted = soundEngine.toggleMute();
            soundToggleBtn.classList.toggle('muted', isMuted);
            soundToggleBtn.title = isMuted ? "เปิดเสียงเอฟเฟกต์ (Muted)" : "ปิดเสียงเอฟเฟกต์ (Unmuted)";
            if (!isMuted) soundEngine.playLevelUp();
            showToast(isMuted ? "🔇 ปิดเสียงเอฟเฟกต์แล้ว" : "🔊 เปิดเสียงเอฟเฟกต์แล้ว!");
        });
    }

    // Attach click sound to buttons
    document.querySelectorAll('button, .nav-link, .btn-vote-server, .filter-btn, .btn-primary-voxel').forEach(el => {
        el.addEventListener('click', () => soundEngine.playClick());
    });

    // ==========================================================================
    // 2. Floating XP & Particle Canvas
    // ==========================================================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const numParticles = 40;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 4 + 2;
                this.speedY = Math.random() * 0.8 + 0.3;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.color = Math.random() > 0.4 ? 'rgba(52, 211, 153, ' : 'rgba(56, 189, 248, ';
                this.alpha = Math.random() * 0.6 + 0.2;
            }
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                if (this.y < -20) this.reset();
            }
            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.alpha + ')';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#10b981';
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < numParticles; i++) {
            const p = new Particle();
            p.y = Math.random() * canvas.height;
            particles.push(p);
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ==========================================================================
    // 3. Toast Notification Helper
    // ==========================================================================
    const toastContainer = document.getElementById('toastContainer');
    function showToast(message, icon = '✨') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
    window.showToast = showToast;

    // One-click copy IP function
    window.copyIP = function (ip) {
        navigator.clipboard.writeText(ip).then(() => {
            soundEngine.playOrb();
            showToast(`คัดลอก IP: ${ip} เรียบร้อยแล้ว!`, '📋');
        }).catch(() => {
            showToast(`IP: ${ip}`, '📋');
        });
    };

    // ==========================================================================
    // 4. Server Hub Rendering & Filtering
    // ==========================================================================
    const serverGrid = document.getElementById('serverGrid');
    const serverFilterContainer = document.getElementById('serverFilters');
    let currentServerFilter = 'all';

    function renderServers(filter = 'all', searchQuery = '') {
        if (!serverGrid || !appData) return;

        let servers = appData.servers;
        if (filter !== 'all') {
            servers = servers.filter(s => s.type.toLowerCase().includes(filter.toLowerCase()) ||
                s.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            servers = servers.filter(s => s.name.toLowerCase().includes(q) ||
                s.ip.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q));
        }

        if (servers.length === 0) {
            serverGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
                    <h3>ไม่พบเซิร์ฟเวอร์ที่ตรงกับคำค้นหา</h3>
                    <p>ลองค้นหาด้วยชื่ออื่น หรือเปลี่ยนหมวดหมู่ตัวกรอง</p>
                </div>
            `;
            return;
        }

        serverGrid.innerHTML = servers.map(server => `
            <div class="server-card" id="server-${server.id}">
                <div class="server-card-banner" style="background-image: url('${server.banner}')">
                    <span class="server-type-badge">${server.icon} ${server.type}</span>
                    <span class="live-player-tag">
                        <span class="pulse-dot"></span>
                        <span class="live-count">${server.players}/${server.maxPlayers}</span>
                    </span>
                </div>
                <div class="server-card-content">
                    <div class="server-title-row">
                        <h3 class="server-name">${server.name}</h3>
                        <span class="server-ping">📶 ${server.ping}ms</span>
                    </div>
                    <div class="server-meta-tags">
                        <span class="tag-pill" style="color: var(--color-emerald-light); font-weight: 600;">v${server.version}</span>
                        ${server.isCrossplay ? '<span class="tag-pill" style="color: #38bdf8;">Bedrock & Java</span>' : ''}
                        ${server.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
                    </div>
                    <p class="server-desc">${server.description}</p>
                    <div class="server-card-footer">
                        <button class="btn-copy-small" onclick="copyIP('${server.ip}')">
                            <span>📋</span> <span>${server.ip}</span>
                        </button>
                        <button class="btn-vote-small" onclick="voteServer('${server.id}')">
                            <span>⭐</span> <span id="vote-count-${server.id}">${server.votes.toLocaleString()}</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Server Voting Logic
    window.voteServer = async function (serverId) {
        const server = appData.servers.find(s => s.id === serverId);
        if (server) {
            server.votes += 1;
            const voteEl = document.getElementById(`vote-count-${serverId}`);
            if (voteEl) {
                voteEl.textContent = server.votes.toLocaleString();
                voteEl.parentElement.style.transform = 'scale(1.15)';
                setTimeout(() => voteEl.parentElement.style.transform = 'scale(1)', 200);
            }

            // Update featured card in case this is the featured server
            updateFeaturedServerUI();

            soundEngine.playLevelUp();
            showToast(`โหวตให้เซิร์ฟเวอร์ ${server.name} สำเร็จ! (+1 คะแนน)`, '⭐');

            // Persist to Supabase
            const sb = getSupabase();
            if (sb) {
                try {
                    const { error } = await sb
                        .from('servers')
                        .update({ votes: server.votes })
                        .eq('id', serverId);
                    if (error) console.error("Supabase vote error:", error);
                } catch (err) {
                    console.error("Failed to update votes in Supabase:", err);
                }
            }
        }
    };

    if (serverFilterContainer) {
        serverFilterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            serverFilterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentServerFilter = btn.dataset.filter || 'all';
            renderServers(currentServerFilter);
        });
    }

    // ==========================================================================
    // 5. Supabase Realtime Synchronization & Event Handlers
    // ==========================================================================
    let realtimeChannel = null;
    // Track IDs of records inserted locally so Realtime won't duplicate them
    const localPostIds = new Set();
    const localCommentIds = new Set();

    function renderCommentsHTML(comments) {
        if (!comments || comments.length === 0) {
            return `<div class="no-comments-msg" style="font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 6px 0;">ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มการสนทนา!</div>`;
        }
        return comments.map(c => `
            <div class="comment-bubble" id="comment-${c.id || ''}">
                <img src="${c.avatar || 'https://minotar.net/avatar/Steve/48.png'}" class="comment-avatar" alt="${c.author}" />
                <div class="comment-text-wrap">
                    <span class="comment-author-name">${c.author}</span>
                    <p class="comment-body-text">${c.text}</p>
                </div>
            </div>
        `).join('');
    }

    function updatePostCommentCountUI(postId) {
        const countEl = document.getElementById(`post-comments-count-${postId}`);
        const post = appData && appData.posts ? appData.posts.find(p => p.id === postId) : null;
        if (countEl && post) {
            countEl.textContent = post.comments ? post.comments.length : 0;
        }
    }

    function updatePostCommentsListUI(postId) {
        const listEl = document.getElementById(`comments-list-${postId}`);
        const post = appData && appData.posts ? appData.posts.find(p => p.id === postId) : null;
        if (listEl && post) {
            listEl.innerHTML = renderCommentsHTML(post.comments);
        }
    }

    // Realtime handler for comments (INSERT, UPDATE, DELETE)
    function handleRealtimeComment(payload) {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log(`⚡ Realtime Comment [${eventType}]:`, payload);

        if (!appData || !appData.posts) return;

        if (eventType === 'INSERT') {
            const postId = newRow.post_id;
            const post = appData.posts.find(p => p.id === postId);
            if (!post) return;

            if (!post.comments) post.comments = [];

            // Check if comment already exists (local optimistic insert)
            const existingIdx = post.comments.findIndex(c => c.id === newRow.id);
            if (existingIdx !== -1) {
                // Merge Supabase data (e.g. server-generated created_at) into local copy
                post.comments[existingIdx] = { ...post.comments[existingIdx], ...newRow };
            } else {
                post.comments.push(newRow);
                post.comments.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

                // Only notify if this wasn't inserted by us locally
                if (!localCommentIds.has(newRow.id)) {
                    showToast(`💬 ความคิดเห็นใหม่จาก ${newRow.author}: "${newRow.text.length > 25 ? newRow.text.substring(0, 25) + '...' : newRow.text}"`, '💬');
                    soundEngine.playOrb();
                }
            }
            localCommentIds.delete(newRow.id);

            updatePostCommentCountUI(postId);
            updatePostCommentsListUI(postId);
        } 
        else if (eventType === 'UPDATE') {
            const postId = newRow.post_id;
            const post = appData.posts.find(p => p.id === postId);
            if (post && post.comments) {
                const idx = post.comments.findIndex(c => c.id === newRow.id);
                if (idx !== -1) {
                    post.comments[idx] = newRow;
                    updatePostCommentsListUI(postId);
                }
            }
        } 
        else if (eventType === 'DELETE') {
            const commentId = oldRow.id;
            appData.posts.forEach(post => {
                if (post.comments) {
                    const prevLen = post.comments.length;
                    post.comments = post.comments.filter(c => c.id !== commentId);
                    if (post.comments.length !== prevLen) {
                        updatePostCommentCountUI(post.id);
                        updatePostCommentsListUI(post.id);
                    }
                }
            });
        }
    }

    // Realtime handler for posts (INSERT, UPDATE, DELETE)
    function handleRealtimePost(payload) {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log(`⚡ Realtime Post [${eventType}]:`, payload);

        if (!appData || !appData.posts) return;

        if (eventType === 'INSERT') {
            const exists = appData.posts.some(p => p.id === newRow.id);
            if (!exists) {
                newRow.comments = newRow.comments || [];
                appData.posts.unshift(newRow);
                renderPosts(currentForumFilter);

                // Only notify if not our own local post
                if (!localPostIds.has(newRow.id)) {
                    showToast(`📝 กระทู้ใหม่จาก ${newRow.author}: "${newRow.title}"`, '🎉');
                    soundEngine.playLevelUp();
                }
            }
            localPostIds.delete(newRow.id);
        } 
        else if (eventType === 'UPDATE') {
            const idx = appData.posts.findIndex(p => p.id === newRow.id);
            if (idx !== -1) {
                const existingComments = appData.posts[idx].comments || [];
                const wasLiked = appData.posts[idx].liked;
                appData.posts[idx] = {
                    ...appData.posts[idx],
                    ...newRow,
                    comments: existingComments,
                    liked: wasLiked
                };

                const likeEl = document.getElementById(`post-likes-${newRow.id}`);
                if (likeEl) {
                    likeEl.textContent = newRow.likes;
                }
            }
        } 
        else if (eventType === 'DELETE') {
            appData.posts = appData.posts.filter(p => p.id !== oldRow.id);
            renderPosts(currentForumFilter);
        }
    }

    // Realtime handler for servers (INSERT, UPDATE, DELETE)
    function handleRealtimeServer(payload) {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log(`⚡ Realtime Server [${eventType}]:`, payload);

        if (!appData || !appData.servers) return;

        if (eventType === 'UPDATE') {
            const idx = appData.servers.findIndex(s => s.id === newRow.id);
            if (idx !== -1) {
                appData.servers[idx] = { ...appData.servers[idx], ...newRow };

                const voteEl = document.getElementById(`vote-count-${newRow.id}`);
                if (voteEl) {
                    voteEl.textContent = Number(newRow.votes).toLocaleString();
                    voteEl.parentElement.style.transform = 'scale(1.15)';
                    setTimeout(() => voteEl.parentElement.style.transform = 'scale(1)', 200);
                }

                const cardEl = document.getElementById(`server-${newRow.id}`);
                if (cardEl) {
                    const countEl = cardEl.querySelector('.live-count');
                    if (countEl) countEl.textContent = `${newRow.players}/${newRow.maxPlayers}`;
                }

                updateFeaturedServerUI();
            }
        } 
        else if (eventType === 'INSERT') {
            if (!appData.servers.some(s => s.id === newRow.id)) {
                appData.servers.push(newRow);
                renderServers(currentServerFilter);
                updateFeaturedServerUI();
            }
        } 
        else if (eventType === 'DELETE') {
            appData.servers = appData.servers.filter(s => s.id !== oldRow.id);
            renderServers(currentServerFilter);
            updateFeaturedServerUI();
        }
    }

    // Realtime handler for stats
    function handleRealtimeStats(payload) {
        const { eventType, new: newRow } = payload;
        console.log(`⚡ Realtime Stats [${eventType}]:`, payload);
        if (eventType === 'UPDATE' || eventType === 'INSERT') {
            appData.stats = newRow;
            updateStatsUI();
        }
    }

    // Realtime handler for resources
    function handleRealtimeResource(payload) {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (!appData || !appData.resources) return;
        const currentResFilter = document.querySelector('#resourceFilters .filter-btn.active')?.dataset.filter || 'all';

        if (eventType === 'INSERT') {
            if (!appData.resources.some(r => r.id === newRow.id)) {
                appData.resources.push(newRow);
                renderResources(currentResFilter);
            }
        } else if (eventType === 'UPDATE') {
            const idx = appData.resources.findIndex(r => r.id === newRow.id);
            if (idx !== -1) {
                appData.resources[idx] = newRow;
                renderResources(currentResFilter);
            }
        } else if (eventType === 'DELETE') {
            appData.resources = appData.resources.filter(r => r.id !== oldRow.id);
            renderResources(currentResFilter);
        }
    }

    // Setup Supabase Realtime Channels
    function setupRealtimeSubscription(sb) {
        if (!sb || typeof sb.channel !== 'function') {
            console.warn("Supabase client does not support Realtime channels.");
            return;
        }

        if (realtimeChannel) {
            try {
                sb.removeChannel(realtimeChannel);
            } catch (e) {
                console.warn("Error removing previous Realtime channel:", e);
            }
        }

        console.log("⚡ Subscribing to Supabase Realtime...");
        const liveBadge = document.getElementById('realtimeStatusBadge');
        if (liveBadge) {
            liveBadge.innerHTML = `<span class="pulse-dot" style="background:#eab308; box-shadow:0 0 8px #eab308;"></span> <span>Realtime: เชื่อมต่อ...</span>`;
            liveBadge.style.color = '#fde047';
            liveBadge.style.borderColor = 'rgba(234, 179, 8, 0.3)';
        }

        realtimeChannel = sb.channel('siamcraft-all-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'comments' },
                payload => handleRealtimeComment(payload)
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'posts' },
                payload => handleRealtimePost(payload)
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'servers' },
                payload => handleRealtimeServer(payload)
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'stats' },
                payload => handleRealtimeStats(payload)
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'resources' },
                payload => handleRealtimeResource(payload)
            )
            .subscribe((status, err) => {
                console.log(`📡 Supabase Realtime Status: [${status}]`, err || '');
                if (liveBadge) {
                    if (status === 'SUBSCRIBED') {
                        liveBadge.innerHTML = `<span class="pulse-dot"></span> <span>Realtime Sync</span>`;
                        liveBadge.style.color = 'var(--color-emerald-light)';
                        liveBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        liveBadge.style.background = 'rgba(16, 185, 129, 0.12)';
                    } else if (status === 'CHANNEL_ERROR') {
                        liveBadge.innerHTML = `<span class="pulse-dot" style="background:#ef4444; box-shadow:none;"></span> <span>Realtime Offline</span>`;
                        liveBadge.style.color = '#f87171';
                        liveBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        liveBadge.style.background = 'rgba(239, 68, 68, 0.1)';
                    } else if (status === 'TIMED_OUT') {
                        liveBadge.innerHTML = `<span class="pulse-dot" style="background:#f59e0b; box-shadow:none;"></span> <span>Realtime Reconnecting</span>`;
                        liveBadge.style.color = '#fbbf24';
                        liveBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    }
                }
            });
    }

    // ==========================================================================
    // 6. Community Forum Feed & Interactions
    // ==========================================================================
    const postFeedList = document.getElementById('postFeedList');
    const forumFilterContainer = document.getElementById('forumFilters');
    let currentForumFilter = 'all';

    function renderPosts(filter = 'all') {
        if (!postFeedList || !appData) return;

        // Remember which comment containers are currently open
        const openComments = new Set();
        document.querySelectorAll('.post-comments-container').forEach(el => {
            const display = el.style.display || window.getComputedStyle(el).display;
            if (display === 'flex') openComments.add(el.id);
        });

        let posts = appData.posts;
        if (filter !== 'all') {
            posts = posts.filter(p => p.category.toLowerCase() === filter.toLowerCase());
        }

        postFeedList.innerHTML = posts.map(post => `
            <article class="post-card" id="post-card-${post.id}">
                <div class="post-author-row">
                    <div class="author-info">
                        <img src="${post.avatar || 'https://minotar.net/avatar/Steve/48.png'}" alt="${post.author}" class="author-avatar" />
                        <div>
                            <div class="author-name">${post.author}</div>
                            <span class="author-role-tag">${post.role || 'สมาชิก'}</span>
                        </div>
                    </div>
                    <span class="post-time">${post.time || 'เมื่อสักครู่'}</span>
                </div>

                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content}</p>

                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image-preview" loading="lazy" />` : ''}

                <div class="post-actions-bar">
                    <div class="post-stats-left">
                        <button class="btn-post-action ${post.liked ? 'liked' : ''}" onclick="toggleLikePost('${post.id}')">
                            <span>${post.liked ? '❤️' : '🤍'}</span>
                            <span id="post-likes-${post.id}">${post.likes}</span> ไลก์
                        </button>
                        <button class="btn-post-action" onclick="toggleComments('${post.id}')">
                            <span>💬</span> <span id="post-comments-count-${post.id}">${post.comments ? post.comments.length : 0}</span> ความคิดเห็น
                        </button>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">👁️ ${(post.views || 0).toLocaleString()} อ่าน</span>
                </div>

                <!-- Comments Container (Collapsible) -->
                <div class="post-comments-container" id="comments-${post.id}" style="display:none;">
                    <div class="comments-list" id="comments-list-${post.id}">
                        ${renderCommentsHTML(post.comments)}
                    </div>
                    <form class="comment-input-form" onsubmit="submitComment(event, '${post.id}')">
                        <input type="text" class="comment-input-field" placeholder="เขียนตอบกลับหรือแสดงความคิดเห็น..." required />
                        <button type="submit" class="btn-send-comment">ส่ง</button>
                    </form>
                </div>
            </article>
        `).join('');

        // Restore open state
        openComments.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        });
    }

    window.toggleLikePost = async function (postId) {
        const post = appData.posts.find(p => p.id === postId);
        if (!post) return;
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        const likeEl = document.getElementById(`post-likes-${postId}`);
        const btn = likeEl ? likeEl.closest('.btn-post-action') : null;
        if (likeEl && btn) {
            likeEl.textContent = post.likes;
            btn.classList.toggle('liked', post.liked);
            btn.querySelector('span:first-child').textContent = post.liked ? '❤️' : '🤍';
        }
        if (post.liked) soundEngine.playOrb();

        // Persist to Supabase
        const sb = getSupabase();
        if (sb) {
            try {
                const { error } = await sb.from('posts').update({ likes: post.likes }).eq('id', postId);
                if (error) console.error('Supabase like error:', error);
            } catch (err) {
                console.error('Failed to update post likes in Supabase:', err);
            }
        }
    };

    window.toggleComments = function (postId) {
        const el = document.getElementById(`comments-${postId}`);
        if (!el) return;
        const isHidden = el.style.display === 'none' || window.getComputedStyle(el).display === 'none';
        el.style.display = isHidden ? 'flex' : 'none';
    };

    window.submitComment = async function (e, postId) {
        e.preventDefault();
        const input = e.target.querySelector('input');
        const text = input.value.trim();
        if (!text) return;

        const post = appData.posts.find(p => p.id === postId);
        if (!post) return;

        const commentId = 'c_' + Date.now();
        const newComment = {
            id: commentId,
            post_id: postId,
            author: 'Player_Siam',
            avatar: 'https://minotar.net/avatar/Steve/48.png',
            time: 'เมื่อสักครู่',
            text: text,
            created_at: new Date().toISOString()
        };

        // Mark as local so Realtime won't duplicate it
        localCommentIds.add(commentId);

        if (!post.comments) post.comments = [];
        post.comments.push(newComment);
        input.value = '';
        soundEngine.playOrb();
        showToast('ส่งความคิดเห็นสำเร็จ!', '💬');
        updatePostCommentCountUI(postId);
        updatePostCommentsListUI(postId);

        // Persist to Supabase
        const sb = getSupabase();
        if (sb) {
            try {
                const { error } = await sb.from('comments').insert([newComment]);
                if (error) {
                    console.error('❌ Supabase insert comment error:', error);
                    localCommentIds.delete(commentId);
                } else {
                    console.log('✅ Comment persisted to Supabase:', newComment);
                }
            } catch (err) {
                console.error('Failed to insert comment in Supabase:', err);
                localCommentIds.delete(commentId);
            }
        }
    };

    if (forumFilterContainer) {
        forumFilterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            forumFilterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentForumFilter = btn.dataset.filter || 'all';
            renderPosts(currentForumFilter);
        });
    }

    // ==========================================================================
    // 7. New Post Modal Handler
    // ==========================================================================
    const newPostModal = document.getElementById('newPostModal');
    const btnOpenNewPost = document.getElementById('btnOpenNewPost');
    const btnCloseNewPost = document.getElementById('btnCloseNewPost');
    const newPostForm = document.getElementById('newPostForm');

    if (btnOpenNewPost && newPostModal) {
        btnOpenNewPost.addEventListener('click', () => {
            newPostModal.classList.add('active');
            soundEngine.playClick();
        });
    }

    if (btnCloseNewPost && newPostModal) {
        btnCloseNewPost.addEventListener('click', () => {
            newPostModal.classList.remove('active');
            soundEngine.playClick();
        });
    }

    if (newPostForm) {
        newPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('postTitleInput').value;
            const category = document.getElementById('postCategoryInput').value;
            const author = document.getElementById('postAuthorInput').value || 'Siam_Crafter';
            const content = document.getElementById('postContentInput').value;
            const image = document.getElementById('postImageInput').value;

            const postId = 'post-' + Date.now();
            const newPost = {
                id: postId,
                title: title,
                author: author,
                role: 'สมาชิกชุมชน',
                avatar: `https://minotar.net/avatar/${encodeURIComponent(author)}/64.png`,
                time: 'เมื่อสักครู่',
                category: category,
                tag: category,
                content: content,
                image: image || '',
                likes: 1,
                liked: false,        // false in DB; local liked state managed in-memory
                views: 12,
                comments: [],
                created_at: new Date().toISOString()
            };

            // Mark as local so Realtime won't show duplicate notification
            localPostIds.add(postId);

            appData.posts.unshift(newPost);
            // Set liked=true locally after adding to appData
            appData.posts[0].liked = true;

            newPostForm.reset();
            newPostModal.classList.remove('active');
            soundEngine.playLevelUp();
            showToast('โพสต์กระทู้ของคุณขึ้นสู่ชุมชนแล้ว!', '🎉');
            renderPosts(currentForumFilter);

            // Persist to Supabase (strip local-only fields)
            const sb = getSupabase();
            if (sb) {
                try {
                    const { comments, liked: _liked, ...postPayload } = newPost;
                    // liked column in DB should always start as false
                    postPayload.liked = false;
                    const { data: inserted, error } = await sb
                        .from('posts')
                        .insert([postPayload])
                        .select()
                        .single();
                    if (error) {
                        console.error('❌ Supabase insert post error:', error);
                        localPostIds.delete(postId); // allow realtime to handle it
                    } else {
                        console.log('✅ Post persisted to Supabase:', inserted);
                    }
                } catch (err) {
                    console.error('Failed to insert post in Supabase:', err);
                    localPostIds.delete(postId);
                }
            }
        });
    }

    // ==========================================================================
    // 7. Resource & Mod Depot
    // ==========================================================================
    const resourceGrid = document.getElementById('resourceGrid');
    const resourceFilters = document.getElementById('resourceFilters');

    function renderResources(filter = 'all') {
        if (!resourceGrid || !appData) return;
        let resList = appData.resources;
        if (filter !== 'all') {
            resList = resList.filter(r => r.type.toLowerCase() === filter.toLowerCase());
        }

        resourceGrid.innerHTML = resList.map(res => `
            <div class="resource-card">
                <div class="resource-thumb" style="background-image: url('${res.image}')">
                    <span class="resource-badge">${res.badge}</span>
                </div>
                <div class="resource-body">
                    <span class="resource-version">${res.version}</span>
                    <h3 class="resource-title">${res.title}</h3>
                    <p class="resource-desc">${res.description}</p>
                    <div class="resource-footer">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">💾 ${res.size} • ⭐ ${res.rating}</span>
                        <button class="btn-download-res" onclick="downloadResource('${res.title}')">
                            <span>⬇️ ดาวน์โหลด</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.downloadResource = function (title) {
        soundEngine.playLevelUp();
        showToast(`กำลังเตรียมไฟล์ดาวน์โหลด: ${title}`, '📦');
    };

    if (resourceFilters) {
        resourceFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            resourceFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderResources(btn.dataset.filter || 'all');
        });
    }

    // ==========================================================================
    // 8. Interactive 3D Skin Canvas (Texture-Mapped from skin.png)
    // ==========================================================================
    const skinCanvas = document.getElementById('skin-canvas');
    if (skinCanvas) {
        const sCtx = skinCanvas.getContext('2d');
        let rotationY = 0;
        let isDragging = false;
        let lastMouseX = 0;
        let autoRotate = true;
        let currentSkinUsername = 'Steve';

        // Off-screen canvas to hold the loaded skin texture (64x64)
        let skinTexture = null;
        const skinOffscreen = document.createElement('canvas');
        skinOffscreen.width = 64;
        skinOffscreen.height = 64;
        const skinOffCtx = skinOffscreen.getContext('2d');

        /**
         * Load a skin texture from a URL onto the off-screen canvas.
         * Supports both local files and CORS-enabled URLs (e.g. Minotar).
         */
        function loadSkinTexture(url) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                skinOffCtx.clearRect(0, 0, 64, 64);
                skinOffCtx.drawImage(img, 0, 0, 64, 64);
                skinTexture = img;
            };
            img.onerror = () => {
                // Fallback: keep previous texture
                console.warn('Could not load skin from:', url);
            };
            img.src = url;
        }

        // Load the user-provided skin.png as the default
        loadSkinTexture('skin.png');

        function resizeSkinCanvas() {
            skinCanvas.width = skinCanvas.parentElement.clientWidth;
            skinCanvas.height = skinCanvas.parentElement.clientHeight;
        }
        window.addEventListener('resize', resizeSkinCanvas);
        resizeSkinCanvas();

        /*
         * Standard Minecraft 64×64 skin UV map (pixel coordinates):
         * ──────────────────────────────────────────────────────
         * HEAD (8×8×8 pixels):
         *   Top:    (8,0)   8×8     Right:  (0,8)   8×8
         *   Front:  (8,8)   8×8     Left:   (16,8)  8×8
         *   Back:   (24,8)  8×8     Bottom: (16,0)  8×8
         *
         * BODY (8×12×4 pixels):
         *   Top:    (20,16) 8×4     Right:  (16,20) 4×12
         *   Front:  (20,20) 8×12    Left:   (28,20) 4×12
         *   Back:   (32,20) 8×12    Bottom: (28,16) 8×4
         *
         * RIGHT ARM (4×12×4 pixels):
         *   Top:    (44,16) 4×4     Right:  (40,20) 4×12
         *   Front:  (44,20) 4×12    Left:   (48,20) 4×12
         *   Back:   (52,20) 4×12    Bottom: (48,16) 4×4
         *
         * LEFT ARM (4×12×4 pixels – 64x64 skins):
         *   Top:    (36,48) 4×4     Right:  (32,52) 4×12
         *   Front:  (36,52) 4×12    Left:   (40,52) 4×12
         *   Back:   (44,52) 4×12    Bottom: (40,48) 4×4
         *
         * RIGHT LEG (4×12×4 pixels):
         *   Top:    (4,16)  4×4     Right:  (0,20)  4×12
         *   Front:  (4,20)  4×12    Left:   (8,20)  4×12
         *   Back:   (12,20) 4×12    Bottom: (8,16)  4×4
         *
         * LEFT LEG (4×12×4 pixels – 64x64 skins):
         *   Top:    (20,48) 4×4     Right:  (16,52) 4×12
         *   Front:  (20,52) 4×12    Left:   (24,52) 4×12
         *   Back:   (28,52) 4×12    Bottom: (24,48) 4×4
         */

        // UV regions: [sx, sy, sw, sh]  (source x, y, width, height on the 64x64 texture)
        const UV = {
            head: { front: [8, 8, 8, 8], back: [24, 8, 8, 8], left: [16, 8, 8, 8], right: [0, 8, 8, 8], top: [8, 0, 8, 8] },
            body: { front: [20, 20, 8, 12], back: [32, 20, 8, 12], left: [28, 20, 4, 12], right: [16, 20, 4, 12], top: [20, 16, 8, 4] },
            armR: { front: [44, 20, 4, 12], back: [52, 20, 4, 12], left: [48, 20, 4, 12], right: [40, 20, 4, 12], top: [44, 16, 4, 4] },
            armL: { front: [36, 52, 4, 12], back: [44, 52, 4, 12], left: [40, 52, 4, 12], right: [32, 52, 4, 12], top: [36, 48, 4, 4] },
            legR: { front: [4, 20, 4, 12], back: [12, 20, 4, 12], left: [8, 20, 4, 12], right: [0, 20, 4, 12], top: [4, 16, 4, 4] },
            legL: { front: [20, 52, 4, 12], back: [28, 52, 4, 12], left: [24, 52, 4, 12], right: [16, 52, 4, 12], top: [20, 48, 4, 4] },
        };

        /**
         * Draw a textured face (a rectangular region from the skin texture)
         * at a given position and size on the main canvas, with optional shading.
         */
        function drawTexFace(region, dx, dy, dw, dh, shade) {
            if (!skinTexture) return;
            const [sx, sy, sw, sh] = region;
            sCtx.imageSmoothingEnabled = false;
            sCtx.drawImage(skinOffscreen, sx, sy, sw, sh, dx, dy, dw, dh);
            // Apply light/shadow overlay
            if (shade) {
                sCtx.fillStyle = shade;
                sCtx.fillRect(dx, dy, dw, dh);
            }
        }

        /**
         * Draw a full body part (a 3D box) with isometric-style projection.
         *
         * @param {number} ox  – horizontal center offset in model coords
         * @param {number} oy  – vertical center offset (top of the part)
         * @param {number} bw  – box width  in model pixels
         * @param {number} bh  – box height in model pixels
         * @param {number} bd  – box depth  in model pixels
         * @param {object} uv  – UV set with front/back/left/right/top
         * @param {number} cos – cosine of the current rotation
         * @param {number} sin – sine of the current rotation
         * @param {number} s   – render scale
         */
        function drawBodyPart(ox, oy, bw, bh, bd, uv, cos, sin, s) {
            // Normalised rotation angle 0..2π
            const a = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

            // Determine which side faces are visible
            const showFront = (a <= Math.PI * 0.5 || a >= Math.PI * 1.5);
            const showBack = !showFront;
            const showRight = (a >= 0 && a <= Math.PI);
            const showLeft = !showRight;

            // Apparent width of front/back face & side face based on rotation
            const faceW = Math.abs(cos) * bw;
            const sideW = Math.abs(sin) * bd;
            const totalW = (faceW + sideW) * s;

            const drawX = ox * s - totalW / 2;
            const drawY = oy * s;
            const drawH = bh * s;

            // Shading intensities
            const darkShade = 'rgba(0,0,0,0.22)';
            const lightShade = 'rgba(0,0,0,0.08)';

            // Draw the two visible side panels in correct z-order
            if (showFront && showRight) {
                // Right side is farther, draw first
                drawTexFace(uv.right, drawX, drawY, sideW * s, drawH, darkShade);
                drawTexFace(uv.front, drawX + sideW * s, drawY, faceW * s, drawH, lightShade);
            } else if (showFront && showLeft) {
                drawTexFace(uv.left, drawX + faceW * s, drawY, sideW * s, drawH, darkShade);
                drawTexFace(uv.front, drawX, drawY, faceW * s, drawH, lightShade);
            } else if (showBack && showRight) {
                drawTexFace(uv.right, drawX, drawY, sideW * s, drawH, darkShade);
                drawTexFace(uv.back, drawX + sideW * s, drawY, faceW * s, drawH, lightShade);
            } else if (showBack && showLeft) {
                drawTexFace(uv.left, drawX + faceW * s, drawY, sideW * s, drawH, darkShade);
                drawTexFace(uv.back, drawX, drawY, faceW * s, drawH, lightShade);
            }

            // Top face (always visible – pseudo-isometric)
            const topH = Math.abs(sin) * 1.5 * s; // foreshortened top
            if (topH > 0.5) {
                drawTexFace(uv.top, drawX, drawY - topH, totalW, topH, 'rgba(255,255,255,0.08)');
            }
        }

        // Main render loop
        function draw3DCharacter() {
            sCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
            const cx = skinCanvas.width / 2;
            const cy = skinCanvas.height / 2 - 10;
            const s = Math.min(skinCanvas.width, skinCanvas.height) / 110; // adaptive scale

            sCtx.save();
            sCtx.translate(cx, cy);

            const cos = Math.cos(rotationY);
            const sin = Math.sin(rotationY);

            // Floor shadow
            sCtx.beginPath();
            sCtx.ellipse(0, 30 * s, 12 * s, 3 * s, 0, 0, Math.PI * 2);
            sCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            sCtx.fill();

            // Arm swing animation
            const armSwing = Math.sin(Date.now() * 0.003) * 1.5;

            // Draw in back-to-front order depending on rotation
            const a = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const facingForward = (a <= Math.PI * 0.5 || a >= Math.PI * 1.5);

            if (facingForward) {
                // Arms behind -> body -> arms in front
                // Back arm
                drawBodyPart(6, -14 - armSwing, 4, 12, 4, UV.armL, cos, sin, s);
                // Body
                drawBodyPart(0, -14, 8, 12, 4, UV.body, cos, sin, s);
                // Front arm
                drawBodyPart(-6, -14 + armSwing, 4, 12, 4, UV.armR, cos, sin, s);
            } else {
                drawBodyPart(-6, -14 + armSwing, 4, 12, 4, UV.armR, cos, sin, s);
                drawBodyPart(0, -14, 8, 12, 4, UV.body, cos, sin, s);
                drawBodyPart(6, -14 - armSwing, 4, 12, 4, UV.armL, cos, sin, s);
            }

            // Legs (slight swing)
            const legSwing = Math.sin(Date.now() * 0.003) * 0.8;
            drawBodyPart(-2, -2 + legSwing, 4, 12, 4, UV.legR, cos, sin, s);
            drawBodyPart(2, -2 - legSwing, 4, 12, 4, UV.legL, cos, sin, s);

            // Head (always on top)
            drawBodyPart(0, -26, 8, 8, 8, UV.head, cos, sin, s);

            // Username label below feet
            sCtx.fillStyle = '#94a3b8';
            sCtx.font = `${Math.max(10, s * 3)}px "Silkscreen", monospace`;
            sCtx.textAlign = 'center';
            sCtx.fillText(currentSkinUsername, 0, 34 * s);

            sCtx.restore();

            if (autoRotate && !isDragging) {
                rotationY += 0.015;
            }
            requestAnimationFrame(draw3DCharacter);
        }
        draw3DCharacter();

        // Mouse / Touch Drag to Rotate
        skinCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
        });
        skinCanvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            lastMouseX = e.touches[0].clientX;
        }, { passive: true });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            rotationY += (e.clientX - lastMouseX) * 0.01;
            lastMouseX = e.clientX;
        });
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            rotationY += (e.touches[0].clientX - lastMouseX) * 0.01;
            lastMouseX = e.touches[0].clientX;
        }, { passive: true });

        window.addEventListener('mouseup', () => { isDragging = false; });
        window.addEventListener('touchend', () => { isDragging = false; });

        // Controls
        const btnToggleRotate = document.getElementById('btnToggleRotate');
        if (btnToggleRotate) {
            btnToggleRotate.addEventListener('click', () => {
                autoRotate = !autoRotate;
                btnToggleRotate.textContent = autoRotate ? '⏸️' : '▶️';
                soundEngine.playClick();
            });
        }

        const btnResetSkinView = document.getElementById('btnResetSkinView');
        if (btnResetSkinView) {
            btnResetSkinView.addEventListener('click', () => {
                rotationY = 0;
                soundEngine.playClick();
            });
        }

        // Preset skin changer — loads from Minotar API
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const user = chip.dataset.user;
                currentSkinUsername = user;
                const input = document.getElementById('skinUsernameInput');
                if (input) input.value = user;
                loadSkinTexture(`https://minotar.net/skin/${encodeURIComponent(user)}`);
                soundEngine.playOrb();
                showToast(`โหลดสกินของ: ${user}`, '🧍');
            });
        });

        // Fetch skin button
        const btnFetchSkin = document.getElementById('btnFetchSkin');
        if (btnFetchSkin) {
            btnFetchSkin.addEventListener('click', () => {
                const input = document.getElementById('skinUsernameInput');
                if (input && input.value.trim()) {
                    currentSkinUsername = input.value.trim();
                    loadSkinTexture(`https://minotar.net/skin/${encodeURIComponent(currentSkinUsername)}`);
                    soundEngine.playLevelUp();
                    showToast(`ดึงข้อมูลสกิน ${currentSkinUsername} เรียบร้อย!`, '✨');
                }
            });
        }

        // Download skin file
        const btnDownloadSkinFile = document.getElementById('btnDownloadSkinFile');
        if (btnDownloadSkinFile) {
            btnDownloadSkinFile.addEventListener('click', () => {
                // Create a download link from the off-screen canvas
                const link = document.createElement('a');
                link.download = `${currentSkinUsername}_skin.png`;
                link.href = skinOffscreen.toDataURL('image/png');
                link.click();
                soundEngine.playLevelUp();
                showToast(`ดาวน์โหลดสกิน ${currentSkinUsername}.png สำเร็จ!`, '📥');
            });
        }
    }

    // ==========================================================================
    // 9. Tournaments Countdown Timer
    // ==========================================================================
    function updateCountdowns() {
        if (!appData || !appData.events) return;
        appData.events.forEach((ev, idx) => {
            const target = new Date(ev.countdownTarget).getTime();
            const now = Date.now();
            const diff = Math.max(0, target - now);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            const dEl = document.getElementById(`cd-days-${idx}`);
            const hEl = document.getElementById(`cd-hours-${idx}`);
            const mEl = document.getElementById(`cd-mins-${idx}`);
            const sEl = document.getElementById(`cd-secs-${idx}`);

            if (dEl) dEl.textContent = String(days).padStart(2, '0');
            if (hEl) hEl.textContent = String(hours).padStart(2, '0');
            if (mEl) mEl.textContent = String(mins).padStart(2, '0');
            if (sEl) sEl.textContent = String(secs).padStart(2, '0');
        });
    }
    setInterval(updateCountdowns, 1000);

    // ==========================================================================
    // 10. Universal Search Modal (`Ctrl + K`)
    // ==========================================================================
    const searchModal = document.getElementById('searchModal');
    const searchTriggerBtn = document.getElementById('searchTriggerBtn');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const globalSearchInput = document.getElementById('globalSearchInput');
    const searchResultsList = document.getElementById('searchResultsList');

    function openSearch() {
        if (searchModal) {
            searchModal.classList.add('active');
            if (globalSearchInput) {
                globalSearchInput.focus();
                globalSearchInput.value = '';
                renderSearchResults('');
            }
            soundEngine.playClick();
        }
    }

    function closeSearch() {
        if (searchModal) {
            searchModal.classList.remove('active');
        }
    }

    if (searchTriggerBtn) searchTriggerBtn.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchModal && searchModal.classList.contains('active')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });

    function renderSearchResults(query) {
        if (!searchResultsList || !appData) return;
        const q = query.toLowerCase().trim();

        if (!q) {
            searchResultsList.innerHTML = `
                <div style="padding: 20px; color: var(--text-muted); text-align: center;">
                    พิมพ์ชื่อเซิร์ฟเวอร์, มอด, กระทู้ หรือหัวข้อคู่มือเพื่อค้นหาแบบรวดเร็ว
                </div>
            `;
            return;
        }

        const matchServers = appData.servers.filter(s => s.name.toLowerCase().includes(q) || s.ip.toLowerCase().includes(q));
        const matchPosts = appData.posts.filter(p => p.title.toLowerCase().includes(q));
        const matchResources = appData.resources.filter(r => r.title.toLowerCase().includes(q));

        let html = '';
        if (matchServers.length > 0) {
            html += `<h4 style="color: var(--color-emerald); margin: 10px 0 6px; font-size: 0.82rem;">🌐 เซิร์ฟเวอร์ (${matchServers.length})</h4>`;
            matchServers.forEach(s => {
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 6px; cursor: pointer;" onclick="copyIP('${s.ip}'); closeSearch();">
                        <div>
                            <strong>${s.name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${s.ip} • ${s.type}</div>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--color-emerald);">📋 Copy IP</span>
                    </div>
                `;
            });
        }

        if (matchPosts.length > 0) {
            html += `<h4 style="color: #38bdf8; margin: 14px 0 6px; font-size: 0.82rem;">💬 กระทู้ชุมชน (${matchPosts.length})</h4>`;
            matchPosts.forEach(p => {
                html += `
                    <div style="padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 6px;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${p.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">โดย ${p.author} • ${p.category}</div>
                    </div>
                `;
            });
        }

        if (matchResources.length > 0) {
            html += `<h4 style="color: var(--color-gold); margin: 14px 0 6px; font-size: 0.82rem;">📦 มอด & รีซอร์ส (${matchResources.length})</h4>`;
            matchResources.forEach(r => {
                html += `
                    <div style="padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 6px;">
                        <strong>${r.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${r.type} • ${r.version}</div>
                    </div>
                `;
            });
        }

        if (!html) {
            html = `<div style="padding: 20px; color: var(--text-muted); text-align: center;">ไม่พบผลลัพธ์ที่ตรงกับ "${query}"</div>`;
        }

        searchResultsList.innerHTML = html;
    }

    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
    }

    // ==========================================================================
    // 11. Subtle Live Player Fluctuations
    // ==========================================================================
    setInterval(() => {
        if (!appData || !appData.servers) return;
        appData.servers.forEach(s => {
            const delta = Math.floor(Math.random() * 5) - 2;
            s.players = Math.max(10, Math.min(s.maxPlayers, s.players + delta));
            const cardEl = document.getElementById(`server-${s.id}`);
            if (cardEl) {
                const countEl = cardEl.querySelector('.live-count');
                if (countEl) countEl.textContent = `${s.players}/${s.maxPlayers}`;
            }
        });

        // Also update featured server card UI when numbers fluctuate
        updateFeaturedServerUI();
    }, 4000);

    // Initialize Supabase loading
    initSupabaseData();
});
