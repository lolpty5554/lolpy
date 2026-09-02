// ฐานข้อมูลจำลองสำหรับ SiamCraft Hub (ข้อมูลภาษาไทย)
const SiamCraftData = {
    stats: {
        totalOnlinePlayers: 18420,
        activeServers: 142,
        communityMembers: 98560,
        resourcesShared: 1250
    },
    
    servers: [
        {
            id: "siam-mmo",
            name: "SiamCraft MMORPG & Survival",
            ip: "play.siamcraft.in.th",
            port: "25565",
            version: "1.21.x - 1.20.x",
            type: "Survival MMO",
            tags: ["Survival", "MMORPG", "เควสต์", "ระบบกิลด์", "ดันเจี้ยน"],
            players: 342,
            maxPlayers: 500,
            ping: 18,
            votes: 14890,
            featured: true,
            isCrossplay: true,
            description: "เซิร์ฟเวอร์ Survival MMORPG สัญชาติไทย ระบบเควสต์เนื้อเรื่องกว่า 500+ เควสต์ ตะลุยบอสดันเจี้ยน ตลาดประมูลไอเทม และสงครามกิลด์วอร์สุดมันส์!",
            banner: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80",
            icon: "⚔️"
        },
        {
            id: "thaipixel-bedwars",
            name: "ThaiPixel Network",
            ip: "mc.thaipixel.net",
            port: "19132",
            version: "1.8.9 - 1.21.x",
            type: "Minigames",
            tags: ["Bedwars", "Skywars", "Minigames", "PVP", "Crossplay"],
            players: 615,
            maxPlayers: 1000,
            ping: 12,
            votes: 21530,
            featured: true,
            isCrossplay: true,
            description: "ศูนย์รวมมินิเกมอันดับ 1 ของไทย Bedwars ไม่มีแล็ก ระบบจัดอันดับ Elo แรงกิ้ง สกินคาแรคเตอร์ และไอเทมคอสเมติกสะสมเพียบ!",
            banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
            icon: "🏆"
        },
        {
            id: "skyblock-reborn",
            name: "SkyBlock Reborn Thailand",
            ip: "play.skyblock-th.com",
            port: "25565",
            version: "1.21.1",
            type: "Skyblock",
            tags: ["Skyblock", "ฟาร์มออโต้", "เศรษฐกิจสมดุล", "Minions"],
            players: 188,
            maxPlayers: 300,
            ping: 24,
            votes: 8940,
            featured: false,
            isCrossplay: false,
            description: "สกายบล็อกยุคใหม่ ระบบมินเนี่ยนช่วยฟาร์ม เกาะส่วนตัวขยายได้ไม่จำกัด แลกเปลี่ยนไอเทมกับผู้เล่นแบบเรียลไทม์",
            banner: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
            icon: "☁️"
        },
        {
            id: "towny-earth-th",
            name: "Siam Earth 1:500 Real Map",
            ip: "earth.siamtowny.org",
            port: "25565",
            version: "1.20.4 - 1.21",
            type: "Towny",
            tags: ["Towny", "แผนที่โลกจริง", "สร้างประเทศ", "การค้า", "Roleplay"],
            players: 145,
            maxPlayers: 250,
            ping: 32,
            votes: 6720,
            featured: false,
            isCrossplay: true,
            description: "สร้างอาณาจักรบนแผนที่โลกขนาด 1:500 จำลองภูมิประเทศจริง ตั้งถิ่นฐานที่สยาม ค้าขายระหว่างทวีป และสร้างประวัติศาสตร์ของคุณเอง",
            banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            icon: "🌍"
        },
        {
            id: "vanilla-hardcore",
            name: "Pure Thailand Vanilla+",
            ip: "vanilla.mc-thai.club",
            port: "25565",
            version: "1.21.1 (Snapshot Sync)",
            type: "Vanilla",
            tags: ["Vanilla+", "ไม่มีกล่องสุ่ม", "คอมมูนิตี้เป็นกันเอง", "Hard"],
            players: 94,
            maxPlayers: 150,
            ping: 15,
            votes: 4310,
            featured: false,
            isCrossplay: false,
            description: "สัมผัสประสบการณ์ไมน์คราฟต์แท้เดิมๆ ไม่มีการเสกไอเทม ไร้ระบบโกง เหมาะสำหรับผู้เล่นที่รักความท้าทายและการสร้างสรรค์แบบดั้งเดิม",
            banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
            icon: "🌱"
        },
        {
            id: "pixelmon-adventure",
            name: "Pixelmon Thailand Generations",
            ip: "play.pixelmon-siam.com",
            port: "25565",
            version: "1.20.2 (Modpack)",
            type: "Pixelmon",
            tags: ["Pixelmon", "จับโปเกมอน", "ยิมลีดเดอร์", "ทัวร์นาเมนต์"],
            players: 220,
            maxPlayers: 400,
            ping: 28,
            votes: 11200,
            featured: true,
            isCrossplay: false,
            description: "ออกเดินทางจับโปเกมอนกว่า 900+ ชนิด ท้าดวลยิม 8 แห่งทั่วสยาม และชิงความเป็นแชมป์เปี้ยนในการแข่งลีคสุดยิ่งใหญ่ประจำเดือน!",
            banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
            icon: "⚡"
        }
    ],

    posts: [
        {
            id: "post-1",
            title: "แจกแบบแปลน: วัดพระแก้วและพระปรางค์จำลองใน Minecraft 1.21 (Schematic & World Download)",
            author: "MasterBuilder_TH",
            role: "สถาปนิกขั้นเทพ",
            avatar: "https://minotar.net/avatar/Notch/64.png",
            time: "2 ชั่วโมงที่แล้ว",
            category: "Showcase",
            tag: "ผลงานสร้างสรรค์",
            content: "สวัสดีครับเพื่อนๆ ทุกคน ใช้เวลาสร้างกว่า 3 สัปดาห์เก็บรายละเอียดสถาปัตยกรรมไทย ลายกนก และยอดมณฑปจำลองด้วยบล็อก Copper และ Prismarine ล่าสุด ใครอยากเอาไปวางในเซิร์ฟเวอร์โหลดไฟล์ .schem และ world save ได้เลยครับ!",
            image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
            likes: 248,
            liked: false,
            views: 1820,
            comments: [
                {
                    id: "c1",
                    author: "Oak_Crafter",
                    avatar: "https://minotar.net/avatar/Steve/48.png",
                    time: "1 ชั่วโมงที่แล้ว",
                    text: "สวยงามและเก็บรายละเอียดหลังคาซ้อนชั้นได้อลังการมากครับ สุดยอดฝีมือคนไทยจริงๆ!"
                },
                {
                    id: "c2",
                    author: "DiamondGamer",
                    avatar: "https://minotar.net/avatar/Alex/48.png",
                    time: "30 นาทีที่แล้ว",
                    text: "ใช้ Texture pack อะไรเปิดคู่กันถึงได้แสงเงาทองอร่ามขนาดนี้ครับ?"
                }
            ]
        },
        {
            id: "post-2",
            title: "เทคนิคทำฟาร์มเหล็กอัตโนมัติ (Iron Golem Farm) เวอร์ชั่น 1.21 ปั๊ม 1,200 เหล็กต่อชั่วโมง!",
            author: "Redstone_Engineer_99",
            role: "ผู้เชี่ยวชาญเรดสโตน",
            avatar: "https://minotar.net/avatar/MumboJumbo/64.png",
            time: "4 ชั่วโมงที่แล้ว",
            category: "Redstone",
            tag: "เทคนิค & ฟาร์ม",
            content: "แชร์ผังวงจรฟาร์มเหล็กแบบกะทัดรัด 9x9 บล็อก ไม่ต้องใช้เรดสโตนซับซ้อน ใช้เพียงชาวบ้าน 3 คนและซอมบี้ 1 ตัว พร้อมระบบจัดเรียงไอเทมและคัดแยกดอกป๊อปปี้ไปเผาอัตโนมัติ ทำตามง่ายแน่นอนครับ",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            likes: 185,
            liked: false,
            views: 2450,
            comments: [
                {
                    id: "c3",
                    author: "NoobNoMore",
                    avatar: "https://minotar.net/avatar/Grian/48.png",
                    time: "2 ชั่วโมงที่แล้ว",
                    text: "ลองสร้างตามในโหมด Survival แล้ว ใช้งานได้จริง 100% เลยครับขอบคุณมากๆ"
                }
            ]
        },
        {
            id: "post-3",
            title: "หาเพื่อนร่วมทีม 2 คนลงแข่ง Siam Speedrun Cup 2026 ชิงเงินรางวัลรวม 30,000 บาท",
            author: "EndCity_Hunter",
            role: "นักล่ามังกร",
            avatar: "https://minotar.net/avatar/Dream/64.png",
            time: "6 ชั่วโมงที่แล้ว",
            category: "LFG",
            tag: "หาเพื่อนเล่น / ทีม",
            content: "ตอนนี้ทีมเรามี 2 คน ขาดสาย Nether Hunt และสายหา Stronghold ที่ซ้อมวิ่งจบเกมต่ำกว่า 20 นาทีเป็นประจำ ใครสนใจทักดิสคอร์ดมาเทสวิ่งด้วยกันได้เลยครับ!",
            image: "",
            likes: 92,
            liked: false,
            views: 940,
            comments: []
        },
        {
            id: "post-4",
            title: "สรุปข่าวอัปเดต Minecraft 1.21.2 มีอะไรใหม่บ้าง? สัตว์ชนิดใหม่ อาวุธ Mace และบล็อก Crafter!",
            author: "Admin_SiamCraft",
            role: "แอดมินคอมมูนิตี้",
            avatar: "https://minotar.net/avatar/Dinnerbone/64.png",
            time: "1 วันที่แล้ว",
            category: "News",
            tag: "ข่าวสารเกม",
            content: "เจาะลึกอัปเดตระบบ Trial Chambers การใช้งานอาวุธค้อน Mace แบบคอมโบดาเมจจากที่สูง และสูตรการทำงานของเครื่อง Auto-Crafter ที่จะเปลี่ยนโลกแห่งการฟาร์มไปตลอดกาล!",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
            likes: 412,
            liked: false,
            views: 5600,
            comments: [
                {
                    id: "c4",
                    author: "MaceMaster",
                    avatar: "https://minotar.net/avatar/Technoblade/48.png",
                    time: "18 ชั่วโมงที่แล้ว",
                    text: "ค้อน Mace ร่วงลงมาจากความสูงแล้วทุบทีเดียวนี่สะใจสุดๆ ครับ"
                }
            ]
        }
    ],

    resources: [
        {
            id: "res-1",
            title: "BSL Shaders - Ultra Siam Edition",
            type: "Shaders",
            version: "1.21.x / Iris & OptiFine",
            author: "CaptTatsu / Modded by SiamVoxel",
            rating: 4.9,
            downloads: "128.4K",
            size: "14.2 MB",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
            badge: "ยอดนิยม",
            description: "เชดเดอร์แสงเงาที่ปรับจูนความอบอุ่นของแสงแดด ผิวน้ำสะท้อนโปร่งใสสมจริง และกินสเปกเครื่องน้อย เหมาะกับการเล่นแบบประจำวัน"
        },
        {
            id: "res-2",
            title: "Faithful 32x / 64x Thai Font HD",
            type: "Texture Packs",
            version: "1.20 - 1.21",
            author: "Faithful Team & Thai Translators",
            rating: 4.8,
            downloads: "95.1K",
            size: "28.5 MB",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
            badge: "แนะนำ",
            description: "Texture Pack สไตล์ Vanilla ดั้งเดิมแต่คมชัดขึ้น 2 เท่า พร้อมฟอนต์ภาษาไทยอ่านง่าย คมชัด ไม่มีสระลอย"
        },
        {
            id: "res-3",
            title: "Sodium + Iris Shaders Optimization Pack",
            type: "Mods",
            version: "Fabric 1.21.1",
            author: "CaffeineMC",
            rating: 5.0,
            downloads: "240.8K",
            size: "8.6 MB",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
            badge: "ต้องมี!",
            description: "ชุดมอดเพิ่มความลื่นไหล (FPS Boost) เพิ่มเฟรมเรตได้สูงขึ้นถึง 300% เล่นเกมไม่สะดุดแม้คอมพิวเตอร์สเปกเริ่มต้น"
        },
        {
            id: "res-4",
            title: "Terralith 2.0 World Generation",
            type: "Datapacks",
            version: "1.21.x Datapack",
            author: "Starmute",
            rating: 4.9,
            downloads: "64.2K",
            size: "18.1 MB",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
            badge: "ใหม่",
            description: "ดาต้าแพ็กเนรมิตภูมิประเทศใหม่กว่า 85 ไบโอม ภูเขาสูงตระหง่าน หุบเขาเรืองแสง และถ้ำมหัศจรรย์โดยไม่ต้องลงมอดเสริม"
        }
    ],

    events: [
        {
            id: "ev-1",
            title: "Siam Speedrun Cup 2026: ศึกชิงเจ้าแห่ง The End",
            date: "15 กันยายน 2026",
            countdownTarget: new Date(Date.now() + 14 * 86400000 + 15 * 3600000).toISOString(),
            prize: "฿30,000 บาท + ถ้วยรางวัลเกียรติยศ",
            participants: "48 / 64 ทีม",
            status: "เปิดรับสมัคร",
            badgeColor: "#10b981",
            description: "การแข่งขันสปีดรันแบบ Random Seed Glitchless ค้นหาทีมที่สามารถโค่น Ender Dragon ได้เร็วที่สุดในประเทศไทย ถ่ายทอดสดพร้อมนักพากย์ตลอดงาน!"
        },
        {
            id: "ev-2",
            title: "Thailand Voxel Building Contest: มหัศจรรย์วรรณคดีไทย",
            date: "30 กันยายน 2026",
            countdownTarget: new Date(Date.now() + 29 * 86400000 + 8 * 3600000).toISOString(),
            prize: "฿20,000 บาท + Minecraft Java Cape พิเศษ",
            participants: "112 ผู้เข้าแข่งขัน",
            status: "เตรียมเปิดรับ",
            badgeColor: "#06b6d4",
            description: "การประกวดสร้างสรรค์สิ่งปลูกสร้างในโหมด Creative ในหัวข้อ 'วรรณคดีไทยในโลกบล็อก' เช่น ป่าหิมพานต์, ปราสาทลงกา หรือเมืองบาดาล"
        }
    ],

    guides: [
        {
            id: "g1",
            title: "คู่มือผู้เล่นใหม่: เริ่มต้นอย่างไรให้รอดในคืนแรกแบบโปร",
            readTime: "5 นาที",
            icon: "🪵",
            summary: "วิธีเก็บไม้ คราฟต์เตียง ขุดหาถ่าน และสร้างที่หลบภัยชั่วคราวเพื่อเอาชีวิตรอดจากฝูงมอนสเตอร์ในคืนแรก"
        },
        {
            id: "g2",
            title: "หลักการเรดสโตนเบื้องต้น: สัญญาณ, Repeater, Comparator และ Logic Gates",
            readTime: "8 นาที",
            icon: "🔴",
            summary: "ทำความเข้าใจการส่งกระแสสัญญาณเรดสโตน เทคนิคการทดสัญญาณ และการตรวจจับสถานะด้วย Comparator"
        },
        {
            id: "g3",
            title: "วิธีเปิดเซิร์ฟเวอร์ Minecraft เล่นกับเพื่อนฟรี (PaperMC / Fabric)",
            readTime: "10 นาที",
            icon: "🖥️",
            summary: "ขั้นตอนการตั้งค่า Server Properties, การฟอร์เวิร์ดพอร์ต, และการติดตั้งปลั๊กอิน EssentialsX / LuckPerms"
        },
        {
            id: "g4",
            title: "พิกัดและวิธีค้นหาห้องสมบัติโบราณ Trial Chambers ใน Minecraft 1.21",
            readTime: "6 นาที",
            icon: "🗝️",
            summary: "วิธีเทรดแผนที่จากชาวบ้าน Cartographer, การเคลียร์ Spawner และการไขกุญแจ Ominous Vault รับของรางวัลระดับตำนาน"
        }
    ]
};

if (typeof window !== 'undefined') {
    window.SiamCraftData = SiamCraftData;
}
