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
// 2. القوائم والمنطق
// ==========================================
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل', 'guide')],
    [Markup.button.callback('🛒 الأسعار', 'prices')],
    [Markup.button.callback('⚖️ الشروط', 'terms')]
]);

bot.start((ctx) => ctx.reply('مرحباً بك في دعم Ustern، اختر قسماً:', mainMenu));
bot.action('main_menu', (ctx) => ctx.editMessageText('اختر قسماً:', mainMenu));

bot.action('faq', (ctx) => {
    const buttons = productsList.map(p => [Markup.button.callback(productsData[p].name, 'prod_' + p)]);
    buttons.push([Markup.button.callback('🔙 عودة', 'main_menu')]);
    ctx.editMessageText("🛍️ اختر المنتج:", Markup.inlineKeyboard(buttons));
});

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

bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { step: 'CHAT' });
    ctx.reply("🎯 اكتب رسالتك للدعم وسنقوم بالرد عليك في الجروب.");
});

// ==========================================
// 3. معالج الرسائل المنسق (نظام التذاكر)
// ==========================================
bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    // رسائل العميل (إرسال للجروب)
    if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID) {
        const textToGroup = `📩 تذكرة رقم: 1001\n🆔 ID: ${userId}\n👤 العميل: ${userName}\n\n👤 ${userName}: ${ctx.message.text || 'إرفاق ملف'}\n\n---رد بـ Reply للرد---`;
        const msg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, textToGroup);
        
        // حفظ رقم الرسالة للرد عليها لاحقاً
        activeTickets.set(userId, { ...activeTickets.get(userId), msgId: msg.message_id });
        ctx.reply("✅ تم إرسال رسالتك للدعم.");
    } 
    // ردود الموظف في الجروب
    else if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const replyText = ctx.message.reply_to_message.text;
        const match = replyText.match(/ID:\s*(\d+)/);
        
        if (match) {
            const targetId = match[1];
            // إرسال رد الدعم للعميل
            await bot.telegram.sendMessage(targetId, `🎧 الدعم: ${ctx.message.text}`);
            
            // تحديث رسالة الجروب لتظهر كأن الدعم رد
            const updatedText = replyText + `\n🎧 الدعم: ${ctx.message.text}`;
            try {
                await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ctx.message.reply_to_message.message_id, null, updatedText);
            } catch (e) {}
        }
    }
});

bot.launch().then(() => console.log('Bot is running successfully...'));
