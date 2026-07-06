const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map();

// --- قاعدة البيانات الكاملة ---
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

// --- القوائم الأساسية ---
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

bot.start((ctx) => ctx.reply('👋 أهلاً بك في دعم Ustern، اختر قسماً:', mainMenu));
bot.action('main_menu', (ctx) => ctx.editMessageText('👋 أهلاً بك في دعم Ustern، اختر قسماً:', mainMenu));

// --- منطق القوائم (faq) ---
bot.action('faq', (ctx) => {
    const buttons = productsList.map(p => [Markup.button.callback(productsData[p].name, 'prod_' + p)]);
    buttons.push([Markup.button.callback('🔙 عودة', 'main_menu')]);
    ctx.editMessageText("🛍️ اختر المنتج الذي تواجه مشكلة فيه:", Markup.inlineKeyboard(buttons));
});

productsList.forEach(key => {
    bot.action('prod_' + key, (ctx) => {
        const btns = productsData[key].problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        btns.push([Markup.button.callback('🔙 عودة', 'faq')]);
        ctx.editMessageText(`🛠️ اختر المشكلة في ${productsData[key].name}:`, Markup.inlineKeyboard(btns));
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

// --- صفحات ثابتة (Guide, Prices, Terms) ---
bot.action('guide', (ctx) => ctx.editMessageText('📖 دليل التشغيل:\n1. حمل التطبيق.\n2. سجل الدخول ببياناتك.', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));
bot.action('prices', (ctx) => ctx.editMessageText('🛒 الأسعار:\n- اشتراك شهر: 5$\n- اشتراك سنة: 50$.', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));
bot.action('terms', (ctx) => ctx.editMessageText('⚖️ الشروط:\n- يمنع مشاركة الحساب.\n- الضمان سارٍ طوال فترة الاشتراك.', Markup.inlineKeyboard([[Markup.button.callback('🔙 عودة', 'main_menu')]])));

// --- نظام التذاكر المطور ---
bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { step: 'CHAT', msgId: null });
    ctx.reply("🎯 اكتب رسالتك للدعم وسنقوم بالرد عليك في الجروب.");
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    // 1. العميل يرسل رسالة
    if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID) {
        const ticket = activeTickets.get(userId);
        
        if (!ticket.msgId) {
            const text = `📩 تذكرة رقم: 1001\n🆔 ID: ${userId}\n👤 العميل: ${userName}\n\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            const msg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, text);
            activeTickets.set(userId, { ...ticket, msgId: msg.message_id });
        } else {
            const oldMsg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, "."); // مجرد حيلة لجلب سياق
            const newText = (await bot.telegram.getChat(SUPPORT_GROUP_ID).then(() => bot.telegram.sendMessage(SUPPORT_GROUP_ID, "temp").then(m => bot.telegram.deleteMessage(SUPPORT_GROUP_ID, m.message_id)), {})) || "";
            // التحديث المباشر للمسج
            try {
                const chat = await bot.telegram.getChat(SUPPORT_GROUP_ID);
                const msg = await bot.telegram.forwardMessage(SUPPORT_GROUP_ID, ctx.chat.id, ctx.message.message_id);
                // تجميع النص
                await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, (prev) => {
                    return prev.replace('\n\n---رد بـ Reply للرد---', '') + `\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
                }).catch(() => {});
            } catch(e) {}
        }
        ctx.reply("✅ تم إرسال رسالتك.");
    }
    // 2. الموظف يرد
    else if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const reply = ctx.message.reply_to_message;
        const match = reply.text.match(/ID:\s*(\d+)/);
        if (match) {
            await bot.telegram.sendMessage(match[1], `🎧 الدعم: ${ctx.message.text}`);
            const newText = reply.text.replace('\n\n---رد بـ Reply للرد---', '') + `\n🎧 الدعم: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, reply.message_id, null, newText).catch(() => {});
        }
    }
});

bot.launch().then(() => console.log('Bot is running...'));
