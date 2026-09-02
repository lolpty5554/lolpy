-- ==============================================================================
-- SiamCraft Hub - Supabase Database Schema & Seed Data
-- ==============================================================================
-- คำแนะนำ:
-- 1. ไปที่ Supabase Dashboard (https://supabase.com/dashboard)
-- 2. เลือกโปรเจกต์ของคุณ -> ไปที่เมนู "SQL Editor" ด้านซ้าย
-- 3. คลิก "New query" -> วางโค้ด SQL ด้านล่างนี้ทั้งหมด -> กดปุ่ม "Run" (หรือ Ctrl + Enter)
-- ==============================================================================

-- 1. ลบตารางเดิมหากมีอยู่ (เรียงตามลำดับ foreign key)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS servers CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS stats CASCADE;

-- ------------------------------------------------------------------------------
-- 2. สร้างตาราง Stats (สถิติเว็บไซต์)
-- ------------------------------------------------------------------------------
CREATE TABLE stats (
    id SERIAL PRIMARY KEY,
    "totalOnlinePlayers" INT DEFAULT 18420,
    "activeServers" INT DEFAULT 142,
    "communityMembers" INT DEFAULT 98560,
    "resourcesShared" INT DEFAULT 1250
);

-- ------------------------------------------------------------------------------
-- 3. สร้างตาราง Servers (รายการเซิร์ฟเวอร์ Minecraft)
-- ------------------------------------------------------------------------------
CREATE TABLE servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    port TEXT DEFAULT '25565',
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    players INT DEFAULT 0,
    "maxPlayers" INT DEFAULT 100,
    ping INT DEFAULT 20,
    votes INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    "isCrossplay" BOOLEAN DEFAULT false,
    description TEXT,
    banner TEXT,
    icon TEXT
);

-- ------------------------------------------------------------------------------
-- 4. สร้างตาราง Posts (กระทู้ชุมชน)
-- ------------------------------------------------------------------------------
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT DEFAULT 'สมาชิก',
    avatar TEXT,
    time TEXT,
    category TEXT NOT NULL,
    tag TEXT,
    content TEXT NOT NULL,
    image TEXT,
    likes INT DEFAULT 0,
    liked BOOLEAN DEFAULT false,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. สร้างตาราง Comments (ความคิดเห็นในกระทู้)
-- ------------------------------------------------------------------------------
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    avatar TEXT,
    time TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. สร้างตาราง Resources (มอด เชดเดอร์ เท็กซ์เจอร์แพ็ก ดาต้าแพ็ก)
-- ------------------------------------------------------------------------------
CREATE TABLE resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    version TEXT,
    author TEXT,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    downloads TEXT,
    size TEXT,
    image TEXT,
    badge TEXT,
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 7. สร้างตาราง Events (กิจกรรมและการแข่งขัน)
-- ------------------------------------------------------------------------------
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT,
    "countdownTarget" TEXT,
    prize TEXT,
    participants TEXT,
    status TEXT,
    "badgeColor" TEXT,
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 8. สร้างตาราง Guides (คู่มือและบทความสอนเล่น)
-- ------------------------------------------------------------------------------
CREATE TABLE guides (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "readTime" TEXT,
    icon TEXT,
    summary TEXT
);

-- ------------------------------------------------------------------------------
-- 9. เปิดใช้งาน Row Level Security (RLS) และสร้างนโยบายความปลอดภัย (Policies)
-- ------------------------------------------------------------------------------
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access (SELECT)
CREATE POLICY "Public Read stats" ON stats FOR SELECT USING (true);
CREATE POLICY "Public Read servers" ON servers FOR SELECT USING (true);
CREATE POLICY "Public Read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public Read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public Read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read guides" ON guides FOR SELECT USING (true);

-- Allow Public Insert Access (INSERT)
CREATE POLICY "Public Insert posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Allow Public Update Access (UPDATE for votes, likes)
CREATE POLICY "Public Update servers" ON servers FOR UPDATE USING (true);
CREATE POLICY "Public Update posts" ON posts FOR UPDATE USING (true);


-- ==============================================================================
-- 10. นำเข้าข้อมูลเริ่มต้น (Seed Data)
-- ==============================================================================

-- Stats
INSERT INTO stats (id, "totalOnlinePlayers", "activeServers", "communityMembers", "resourcesShared")
VALUES (1, 18420, 142, 98560, 1250);

-- Servers
INSERT INTO servers (id, name, ip, port, version, type, tags, players, "maxPlayers", ping, votes, featured, "isCrossplay", description, banner, icon) VALUES
('siam-mmo', 'SiamCraft MMORPG & Survival', 'play.siamcraft.in.th', '25565', '1.21.x - 1.20.x', 'Survival MMO', '["Survival", "MMORPG", "เควสต์", "ระบบกิลด์", "ดันเจี้ยน"]'::jsonb, 342, 500, 18, 14890, true, true, 'เซิร์ฟเวอร์ Survival MMORPG สัญชาติไทย ระบบเควสต์เนื้อเรื่องกว่า 500+ เควสต์ ตะลุยบอสดันเจี้ยน ตลาดประมูลไอเทม และสงครามกิลด์วอร์สุดมันส์!', 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80', '⚔️'),
('thaipixel-bedwars', 'ThaiPixel Network', 'mc.thaipixel.net', '19132', '1.8.9 - 1.21.x', 'Minigames', '["Bedwars", "Skywars", "Minigames", "PVP", "Crossplay"]'::jsonb, 615, 1000, 12, 21530, true, true, 'ศูนย์รวมมินิเกมอันดับ 1 ของไทย Bedwars ไม่มีแล็ก ระบบจัดอันดับ Elo แรงกิ้ง สกินคาแรคเตอร์ และไอเทมคอสเมติกสะสมเพียบ!', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', '🏆'),
('skyblock-reborn', 'SkyBlock Reborn Thailand', 'play.skyblock-th.com', '25565', '1.21.1', 'Skyblock', '["Skyblock", "ฟาร์มออโต้", "เศรษฐกิจสมดุล", "Minions"]'::jsonb, 188, 300, 24, 8940, false, false, 'สกายบล็อกยุคใหม่ ระบบมินเนี่ยนช่วยฟาร์ม เกาะส่วนตัวขยายได้ไม่จำกัด แลกเปลี่ยนไอเทมกับผู้เล่นแบบเรียลไทม์', 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80', '☁️'),
('towny-earth-th', 'Siam Earth 1:500 Real Map', 'earth.siamtowny.org', '25565', '1.20.4 - 1.21', 'Towny', '["Towny", "แผนที่โลกจริง", "สร้างประเทศ", "การค้า", "Roleplay"]'::jsonb, 145, 250, 32, 6720, false, true, 'สร้างอาณาจักรบนแผนที่โลกขนาด 1:500 จำลองภูมิประเทศจริง ตั้งถิ่นฐานที่สยาม ค้าขายระหว่างทวีป และสร้างประวัติศาสตร์ของคุณเอง', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', '🌍'),
('vanilla-hardcore', 'Pure Thailand Vanilla+', 'vanilla.mc-thai.club', '25565', '1.21.1 (Snapshot Sync)', 'Vanilla', '["Vanilla+", "ไม่มีกล่องสุ่ม", "คอมมูนิตี้เป็นกันเอง", "Hard"]'::jsonb, 94, 150, 15, 4310, false, false, 'สัมผัสประสบการณ์ไมน์คราฟต์แท้เดิมๆ ไม่มีการเสกไอเทม ไร้ระบบโกง เหมาะสำหรับผู้เล่นที่รักความท้าทายและการสร้างสรรค์แบบดั้งเดิม', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', '🌱'),
('pixelmon-adventure', 'Pixelmon Thailand Generations', 'play.pixelmon-siam.com', '25565', '1.20.2 (Modpack)', 'Pixelmon', '["Pixelmon", "จับโปเกมอน", "ยิมลีดเดอร์", "ทัวร์นาเมนต์"]'::jsonb, 220, 400, 28, 11200, true, false, 'ออกเดินทางจับโปเกมอนกว่า 900+ ชนิด ท้าดวลยิม 8 แห่งทั่วสยาม และชิงความเป็นแชมป์เปี้ยนในการแข่งลีคสุดยิ่งใหญ่ประจำเดือน!', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80', '⚡');

-- Posts
INSERT INTO posts (id, title, author, role, avatar, time, category, tag, content, image, likes, liked, views, created_at) VALUES
('post-1', 'แจกแบบแปลน: วัดพระแก้วและพระปรางค์จำลองใน Minecraft 1.21 (Schematic & World Download)', 'MasterBuilder_TH', 'สถาปนิกขั้นเทพ', 'https://minotar.net/avatar/Notch/64.png', '2 ชั่วโมงที่แล้ว', 'Showcase', 'ผลงานสร้างสรรค์', 'สวัสดีครับเพื่อนๆ ทุกคน ใช้เวลาสร้างกว่า 3 สัปดาห์เก็บรายละเอียดสถาปัตยกรรมไทย ลายกนก และยอดมณฑปจำลองด้วยบล็อก Copper และ Prismarine ล่าสุด ใครอยากเอาไปวางในเซิร์ฟเวอร์โหลดไฟล์ .schem และ world save ได้เลยครับ!', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', 248, false, 1820, NOW() - INTERVAL '2 hours'),
('post-2', 'เทคนิคทำฟาร์มเหล็กอัตโนมัติ (Iron Golem Farm) เวอร์ชั่น 1.21 ปั๊ม 1,200 เหล็กต่อชั่วโมง!', 'Redstone_Engineer_99', 'ผู้เชี่ยวชาญเรดสโตน', 'https://minotar.net/avatar/MumboJumbo/64.png', '4 ชั่วโมงที่แล้ว', 'Redstone', 'เทคนิค & ฟาร์ม', 'แชร์ผังวงจรฟาร์มเหล็กแบบกะทัดรัด 9x9 บล็อก ไม่ต้องใช้เรดสโตนซับซ้อน ใช้เพียงชาวบ้าน 3 คนและซอมบี้ 1 ตัว พร้อมระบบจัดเรียงไอเทมและคัดแยกดอกป๊อปปี้ไปเผาอัตโนมัติ ทำตามง่ายแน่นอนครับ', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', 185, false, 2450, NOW() - INTERVAL '4 hours'),
('post-3', 'หาเพื่อนร่วมทีม 2 คนลงแข่ง Siam Speedrun Cup 2026 ชิงเงินรางวัลรวม 30,000 บาท', 'EndCity_Hunter', 'นักล่ามังกร', 'https://minotar.net/avatar/Dream/64.png', '6 ชั่วโมงที่แล้ว', 'LFG', 'หาเพื่อนเล่น / ทีม', 'ตอนนี้ทีมเรามี 2 คน ขาดสาย Nether Hunt และสายหา Stronghold ที่ซ้อมวิ่งจบเกมต่ำกว่า 20 นาทีเป็นประจำ ใครสนใจทักดิสคอร์ดมาเทสวิ่งด้วยกันได้เลยครับ!', '', 92, false, 940, NOW() - INTERVAL '6 hours'),
('post-4', 'สรุปข่าวอัปเดต Minecraft 1.21.2 มีอะไรใหม่บ้าง? สัตว์ชนิดใหม่ อาวุธ Mace และบล็อก Crafter!', 'Admin_SiamCraft', 'แอดมินคอมมูนิตี้', 'https://minotar.net/avatar/Dinnerbone/64.png', '1 วันที่แล้ว', 'News', 'ข่าวสารเกม', 'เจาะลึกอัปเดตระบบ Trial Chambers การใช้งานอาวุธค้อน Mace แบบคอมโบดาเมจจากที่สูง และสูตรการทำงานของเครื่อง Auto-Crafter ที่จะเปลี่ยนโลกแห่งการฟาร์มไปตลอดกาล!', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 412, false, 5600, NOW() - INTERVAL '1 day');

-- Comments
INSERT INTO comments (id, post_id, author, avatar, time, text, created_at) VALUES
('c1', 'post-1', 'Oak_Crafter', 'https://minotar.net/avatar/Steve/48.png', '1 ชั่วโมงที่แล้ว', 'สวยงามและเก็บรายละเอียดหลังคาซ้อนชั้นได้อลังการมากครับ สุดยอดฝีมือคนไทยจริงๆ!', NOW() - INTERVAL '1 hour'),
('c2', 'post-1', 'DiamondGamer', 'https://minotar.net/avatar/Alex/48.png', '30 นาทีที่แล้ว', 'ใช้ Texture pack อะไรเปิดคู่กันถึงได้แสงเงาทองอร่ามขนาดนี้ครับ?', NOW() - INTERVAL '30 minutes'),
('c3', 'post-2', 'NoobNoMore', 'https://minotar.net/avatar/Grian/48.png', '2 ชั่วโมงที่แล้ว', 'ลองสร้างตามในโหมด Survival แล้ว ใช้งานได้จริง 100% เลยครับขอบคุณมากๆ', NOW() - INTERVAL '2 hours'),
('c4', 'post-4', 'MaceMaster', 'https://minotar.net/avatar/Technoblade/48.png', '18 ชั่วโมงที่แล้ว', 'ค้อน Mace ร่วงลงมาจากความสูงแล้วทุบทีเดียวนี่สะใจสุดๆ ครับ', NOW() - INTERVAL '18 hours');

-- Resources
INSERT INTO resources (id, title, type, version, author, rating, downloads, size, image, badge, description) VALUES
('res-1', 'BSL Shaders - Ultra Siam Edition', 'Shaders', '1.21.x / Iris & OptiFine', 'CaptTatsu / Modded by SiamVoxel', 4.9, '128.4K', '14.2 MB', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', 'ยอดนิยม', 'เชดเดอร์แสงเงาที่ปรับจูนความอบอุ่นของแสงแดด ผิวน้ำสะท้อนโปร่งใสสมจริง และกินสเปกเครื่องน้อย เหมาะกับการเล่นแบบประจำวัน'),
('res-2', 'Faithful 32x / 64x Thai Font HD', 'Texture Packs', '1.20 - 1.21', 'Faithful Team & Thai Translators', 4.8, '95.1K', '28.5 MB', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', 'แนะนำ', 'Texture Pack สไตล์ Vanilla ดั้งเดิมแต่คมชัดขึ้น 2 เท่า พร้อมฟอนต์ภาษาไทยอ่านง่าย คมชัด ไม่มีสระลอย'),
('res-3', 'Sodium + Iris Shaders Optimization Pack', 'Mods', 'Fabric 1.21.1', 'CaffeineMC', 5.0, '240.8K', '8.6 MB', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', 'ต้องมี!', 'ชุดมอดเพิ่มความลื่นไหล (FPS Boost) เพิ่มเฟรมเรตได้สูงขึ้นถึง 300% เล่นเกมไม่สะดุดแม้คอมพิวเตอร์สเปกเริ่มต้น'),
('res-4', 'Terralith 2.0 World Generation', 'Datapacks', '1.21.x Datapack', 'Starmute', 4.9, '64.2K', '18.1 MB', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', 'ใหม่', 'ดาต้าแพ็กเนรมิตภูมิประเทศใหม่กว่า 85 ไบโอม ภูเขาสูงตระหง่าน หุบเขาเรืองแสง และถ้ำมหัศจรรย์โดยไม่ต้องลงมอดเสริม');

-- Events
INSERT INTO events (id, title, date, "countdownTarget", prize, participants, status, "badgeColor", description) VALUES
('ev-1', 'SiamSpeedrun Cup 2026: ศึกชิงเจ้าแห่ง The End', '15 กันยายน 2026', '2026-09-15T18:00:00.000Z', '฿30,000 บาท + ถ้วยรางวัลเกียรติยศ', '48 / 64 ทีม', 'เปิดรับสมัคร', '#10b981', 'การแข่งขันสปีดรันแบบ Random Seed Glitchless ค้นหาทีมที่สามารถโค่น Ender Dragon ได้เร็วที่สุดในประเทศไทย ถ่ายทอดสดพร้อมนักพากย์ตลอดงาน!'),
('ev-2', 'Thailand Voxel Building Contest: มหัศจรรย์วรรณคดีไทย', '30 กันยายน 2026', '2026-09-30T18:00:00.000Z', '฿20,000 บาท + Minecraft Java Cape พิเศษ', '112 ผู้เข้าแข่งขัน', 'เตรียมเปิดรับ', '#06b6d4', 'การประกวดสร้างสรรค์สิ่งปลูกสร้างในโหมด Creative ในหัวข้อ ''วรรณคดีไทยในโลกบล็อก'' เช่น ป่าหิมพานต์, ปราสาทลงกา หรือเมืองบาดาล');

-- Guides
INSERT INTO guides (id, title, "readTime", icon, summary) VALUES
('g1', 'คู่มือผู้เล่นใหม่: เริ่มต้นอย่างไรให้รอดในคืนแรกแบบโปร', '5 นาที', '🪵', 'วิธีเก็บไม้ คราฟต์เตียง ขุดหาถ่าน และสร้างที่หลบภัยชั่วคราวเพื่อเอาชีวิตรอดจากฝูงมอนสเตอร์ในคืนแรก'),
('g2', 'หลักการเรดสโตนเบื้องต้น: สัญญาณ, Repeater, Comparator และ Logic Gates', '8 นาที', '🔴', 'ทำความเข้าใจการส่งกระแสสัญญาณเรดสโตน เทคนิคการทดสัญญาณ และการตรวจจับสถานะด้วย Comparator'),
('g3', 'วิธีเปิดเซิร์ฟเวอร์ Minecraft เล่นกับเพื่อนฟรี (PaperMC / Fabric)', '10 นาที', '🖥️', 'ขั้นตอนการตั้งค่า Server Properties, การฟอร์เวิร์ดพอร์ต, และการติดตั้งปลั๊กอิน EssentialsX / LuckPerms'),
('g4', 'พิกัดและวิธีค้นหาห้องสมบัติโบราณ Trial Chambers ใน Minecraft 1.21', '6 นาที', '🗝️', 'วิธีเทรดแผนที่จากชาวบ้าน Cartographer, การเคลียร์ Spawner และการไขกุญแจ Ominous Vault รับของรางวัลระดับตำนาน');

-- ==============================================================================
-- 11. เปิดใช้งาน Supabase Realtime (PubSub) สำหรับทุกตาราง
-- ==============================================================================
-- คำสั่งด้านล่างนี้จะเปิดให้ Supabase ยิงข้อมูลสด (Realtime) มาที่เว็บไซต์ทันทีที่มีการ INSERT / UPDATE / DELETE
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE posts REPLICA IDENTITY FULL;
ALTER TABLE servers REPLICA IDENTITY FULL;
ALTER TABLE stats REPLICA IDENTITY FULL;
ALTER TABLE resources REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE guides REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE comments;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE servers;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE stats;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE resources;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE guides;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

