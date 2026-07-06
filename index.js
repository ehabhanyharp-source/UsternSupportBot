const { Telegraf, Markup } = require('telegraf');

// ==========================================
// 1. الإعدادات وقاعدة البيانات (كما كانت)
// ==========================================
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map(); 

const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة.\n2. لا تغير بيانات الحساب.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. انتظر 10 دقائق.\n2. تأكد من دخول البروفايل الخاص بك.' },
        { id: 'net_3', btn: '🌐 اللغة والترجمة', title: 'تغير اللغة', steps: '1. من الإعدادات اختر اللغة العربية.' },
        { id: 'net_4', btn: '💳 تحديث الدفع', title: 'تحديث طريقة الدفع', steps: '1. لا تضف أي بطاقة، تواصل مع الدعم فوراً.' }
    ]},
    shahid: { name: '🌟 Shahid VIP', problems: [
        { id: 'sha_1', btn: '🆓 الحساب رجع مجاني', title: 'الحساب رجع مجاني', steps: '1. قم بتسجيل الخروج وأعد الدخول.' },
        { id: 'sha_2', btn: '📱 حد الأجهزة', title: 'حد الأجهزة', steps: '1. لا تشغل الحساب على أكثر من جهاز.' },
        { id: 'sha_3', btn: '🌐 لغة التطبيق', title: 'تغيير اللغة', steps: '1. من الملف الشخصي اختر العربية.' }
    ]},
    osn: { name: '📺 OSN+', problems: [
        { id: 'osn_1', btn: '🔐 كود الدخول', title: 'كود الدخول', steps: '1. تواصل مع الدعم لإرسال الكود.' },
        { id: 'osn_2', btn: '🌐 الترجمة', title: 'مشكلة الترجمة', steps: '1. اختر اللغة العربية من إعدادات الفيديو.' },
        { id: 'osn_3', btn: '🔄 الحساب معلق', title: 'الحساب معلق', steps: '1. أرسل لقطة شاشة للدعم.' }
    ]},
    disney: { name: '🏰 Disney+', problems: [
        { id: 'dis_1', btn: '🔐 الحساب مغلق', title: 'الحساب مغلق', steps: '1. انتظر 10 دقائق.' },
        { id: 'dis_2', btn: '🌐 الترجمة العربية', title: 'مشكلة الترجمة', steps: '1. اختر العربية من خيارات الصوت.' },
        { id: 'dis_3', btn: '🚫 محتوى غير متوفر', title: 'المحتوى غير متوفر', steps: '1. تأكد من إغلاق الـ VPN.' }
    ]}
};

const productsList = Object.keys(productsData);

// ==========================================
// 2. القوائم (نفس العناوين)
// ==========================================
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

bot.start((ctx) => ctx.reply('مرحباً بك في دعم Ustern، اختر قسماً:', mainMenu));
bot.action('main_menu', (ctx) => ctx.editMessageText('مرحباً بك في دعم Ustern، اختر قسماً:', mainMenu));

bot.action('faq', (ctx) => {
    const buttons = productsList.map(p => [Markup.button.callback(productsData[p].name, 'prod_' + p)]);
    buttons.push([Markup.button.callback('🔙 عودة', 'main_menu')]);
    ctx.editMessageText("🛍️ اختر المنتج:", Markup.inlineKeyboard(buttons));
});

// المنطق (نفس المنطق)
productsList.forEach(key => {
    bot.action('prod_' + key, (ctx) => {
        const btns = productsData[key].problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        btns.push([Markup.button.callback('🔙 عودة', 'faq')]);
        ctx.editMessageText(`مشاكل ${productsData[key].name}:`, Markup.inlineKeyboard(btns));
    });

    productsData[key].problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.editMessageText(`🛠️ ${p.title}:\n\n${p.steps}`, Markup.inlineKeyboard([
                [Markup.button.callback('📞 تحدث مع الدعم', 'human_support')],
                [Markup.button.callback('🔙 عودة', 'prod_' + key)]
            ]));
        });
    });
});

bot.action('guide', (ctx) => ctx.editMessageText('📖 دليل التشغيل:\n[محتوى الدليل]', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));
bot.action('prices', (ctx) => ctx.editMessageText('🛒 الأسعار:\n[محتوى الأسعار]', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));
bot.action('terms', (ctx) => ctx.editMessageText('⚖️ الشروط:\n[محتوى الشروط]', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));

// ==========================================
// 3. نظام التذاكر (التعديل التصحيحي)
// ==========================================
bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { step: 'CHAT' });
    ctx.reply("🎯 اكتب رسالتك للدعم وسنقوم بالرد عليك في الجروب.");
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    // رد العميل
    if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID) {
        const ticket = activeTickets.get(userId);
        
        if (!ticket.msgId) {
            const text = `📩 تذكرة رقم: 1001\n🆔 ID: ${userId}\n👤 العميل: ${userName}\n\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            const msg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, text);
            activeTickets.set(userId, { ...ticket, msgId: msg.message_id });
            ctx.reply("✅ تم إرسال رسالتك للدعم.");
        } else {
            const oldMsg = await bot.telegram.getChatMember(SUPPORT_GROUP_ID, bot.botInfo.id); // التحقق
            const old = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, "."); 
            const msg = await bot.telegram.getMessage(SUPPORT_GROUP_ID, ticket.msgId);
            const newText = msg.text.replace('\n\n---رد بـ Reply للرد---', '') + `\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, newText).catch(()=>{});
            ctx.reply("✅ تم إرسال رسالتك.");
        }
    } 
    // رد الدعم
    else if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const reply = ctx.message.reply_to_message;
        const match = reply.text.match(/ID:\s*(\d+)/);
        if (match) {
            await bot.telegram.sendMessage(match[1], `🎧 الدعم: ${ctx.message.text}`);
            const newText = reply.text.replace('\n\n---رد بـ Reply للرد---', '') + `\n🎧 الدعم: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, reply.
