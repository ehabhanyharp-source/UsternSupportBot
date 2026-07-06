const { Telegraf, Markup } = require('telegraf');

// ==========================================
// 1. الإعدادات وقاعدة البيانات
// ==========================================
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map(); 

const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة.\n2. لا تغير بيانات الحساب.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. انتظر 10 دقائق.\n2. تأكد من دخول البروفايل الخاص بك.' }
    ]},
    shahid: { name: '🌟 Shahid VIP', problems: [
        { id: 'sha_1', btn: '🆓 الحساب رجع مجاني', title: 'الحساب رجع مجاني', steps: '1. قم بتسجيل الخروج وأعد الدخول.' },
        { id: 'sha_2', btn: '📱 حد الأجهزة', title: 'حد الأجهزة', steps: '1. لا تشغل الحساب على أكثر من جهاز.' }
    ]}
};

const productsList = Object.keys(productsData);

// ==========================================
// 2. القوائم والمنطق الأساسي
// ==========================================
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

bot.start((ctx) => {
    ctx.reply('👋 أهلاً بك في دعم Ustern، اختر قسماً:', mainMenu);
});

bot.action('main_menu', (ctx) => {
    ctx.editMessageText('👋 أهلاً بك في دعم Ustern، اختر قسماً:', mainMenu);
});

bot.action('faq', (ctx) => {
    const buttons = productsList.map(p => [Markup.button.callback(productsData[p].name, 'prod_' + p)]);
    buttons.push([Markup.button.callback('🔙 عودة', 'main_menu')]);
    ctx.editMessageText("🛍️ اختر المنتج الذي تواجه مشكلة فيه:", Markup.inlineKeyboard(buttons));
});

// منطق عرض المشاكل
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

// ==========================================
// 3. نظام التذاكر المتطور (المحادثة في رسالة واحدة)
// ==========================================
bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { step: 'CHAT' });
    ctx.reply("🎯 اكتب رسالتك للدعم وسنقوم بالرد عليك في الجروب.");
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    // 1. رسالة العميل الأولى (إنشاء تذكرة)
    if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID && !activeTickets.get(userId).msgId) {
        const textToGroup = `📩 تذكرة رقم: 1001\n🆔 ID: ${userId}\n👤 العميل: ${userName}\n\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
        const msg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, textToGroup);
        activeTickets.set(userId, { ...activeTickets.get(userId), msgId: msg.message_id });
        ctx.reply("✅ تم إرسال رسالتك للدعم.");
    }
    // 2. رسالة العميل المتابعة (تحديث نفس التذكرة)
    else if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID) {
        const ticket = activeTickets.get(userId);
        const newText = ctx.message.reply_to_message ? `${ctx.message.text}` : `👤 ${userName}: ${ctx.message.text}`;
        
        // جلب نص الرسالة الحالية وتحديثها
        const currentMsg = await bot.telegram.getChat(SUPPORT_GROUP_ID); // كجزء من المنطق
        // تحديث الرسالة الأصلية مباشرة
        try {
            const originalMsg = await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, (prev) => {
                 let updated = prev.replace(/\n---رد بـ Reply للرد---/, '');
                 return updated + `\n👤 ${userName}: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            });
            ctx.reply("✅ تم إرسال رسالتك.");
        } catch (e) {}
    }
    // 3. رد الموظف في الجروب
    else if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const replyText = ctx.message.reply_to_message.text;
        const match = replyText.match(/ID:\s*(\d+)/);
        
        if (match) {
            const targetId = match[1];
            await bot.telegram.sendMessage(targetId, `🎧 الدعم: ${ctx.message.text}`);
            
            // تحديث رسالة الجروب لتظهر الرد تحت بعضه
            let updatedText = replyText.replace(/\n---رد بـ Reply للرد---/, '');
            updatedText += `\n🎧 الدعم: ${ctx.message.text}\n\n---رد بـ Reply للرد---`;
            
            try {
                await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ctx.message.reply_to_message.message_id, null, updatedText);
            } catch (e) {}
        }
    }
});

bot.launch().then(() => console.log('Bot is running...'));
