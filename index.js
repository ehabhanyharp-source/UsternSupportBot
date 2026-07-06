const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map();

// --- قاعدة البيانات الأصلية كما طلبت ---
const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة.\n2. تأكد من عدم تغيير بيانات الحساب.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: 'يرجى الانتظار 5-10 دقائق.' },
        { id: 'net_3', btn: '🌐 اللغة تغيرت أو اختفت الترجمة', title: 'تغير اللغة', steps: 'قم بتغييرها من إعدادات الحساب.' },
        { id: 'net_4', btn: '💳 يطلب تحديث طريقة الدفع', title: 'تحديث الدفع', steps: 'تواصل مع الدعم فوراً.' }
    ]},
    shahid: { name: '🌟 Shahid VIP', problems: [
        { id: 'sha_1', btn: '🆓 الحساب رجع مجاني', title: 'الحساب مجاني', steps: 'سجل خروج وأعد الدخول.' },
        { id: 'sha_2', btn: '📱 حد الأجهزة المشغلة', title: 'حد الأجهزة', steps: 'سجل خروج من الأجهزة الأخرى.' },
        { id: 'sha_3', btn: '🌐 واجهة التطبيق بالإنجليزية', title: 'تغيير اللغة', steps: 'من الإعدادات داخل التطبيق.' }
    ]},
    osn: { name: '📺 OSN+', problems: [
        { id: 'osn_1', btn: '🔐 كود الدخول لا يصل', title: 'عدم وصول الكود', steps: 'تواصل مع الدعم لإرسال الكود.' },
        { id: 'osn_2', btn: '🌐 الترجمة غير متطابقة', title: 'مشكلة الترجمة', steps: 'اختر اللغة العربية من الإعدادات.' },
        { id: 'osn_3', btn: '🔄 الحساب معلق', title: 'حساب معلق', steps: 'سجل خروج وأعد الدخول.' }
    ]},
    disney: { name: '🏰 Disney+', problems: [
        { id: 'dis_1', btn: '🔐 الحساب مغلق', title: 'حساب مغلق', steps: 'انتظر 10 دقائق.' },
        { id: 'dis_2', btn: '🌐 الترجمة مفقودة', title: 'مشكلة الترجمة', steps: 'من إعدادات الفيديو.' },
        { id: 'dis_3', btn: '🚫 محتوى غير متوفر', title: 'غير متوفر', steps: 'تأكد من إغلاق الـ VPN.' }
    ]}
};

// --- نظام التوقيت ---
function setupIdleTimer(userId) {
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        clearTimeout(ticket.timer);
        ticket.timer = setTimeout(async () => {
            await bot.telegram.sendMessage(userId, "⚠️ تنبيه: لم يصلنا رد منذ 5 دقائق. سيتم إغلاق التذكرة بعد 5 دقائق أخرى.");
            ticket.timer = setTimeout(() => {
                if (activeTickets.has(userId)) {
                    bot.telegram.sendMessage(userId, "❌ تم إغلاق التذكرة لعدم الاستجابة.");
                    activeTickets.delete(userId);
                }
            }, 5 * 60 * 1000);
        }, 5 * 60 * 1000);
    }
}

// --- القائمة الرئيسية (بدون زر الدعم) ---
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

bot.start((ctx) => ctx.reply(`👋 أهلاً بك يا ${ctx.from.first_name} في بوت Ustern!`, mainMenu));

// --- منطق المنتجات ---
bot.action('faq', (ctx) => {
    const btns = Object.keys(productsData).map(key => [Markup.button.callback(productsData[key].name, 'prod_' + key)]);
    ctx.editMessageText("اختر المنتج:", Markup.inlineKeyboard(btns));
});

Object.keys(productsData).forEach(key => {
    bot.action('prod_' + key, (ctx) => {
        const btns = productsData[key].problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        ctx.editMessageText(`حدد مشكلة ${productsData[key].name}:`, Markup.inlineKeyboard(btns));
    });
    productsData[key].problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.reply(`${p.title}\n${p.steps}`, Markup.inlineKeyboard([[Markup.button.callback('📞 لم تحل المشكلة؟ تواصل مع الدعم', 'start_support_flow')]]));
        });
    });
});

// --- تدفق الدعم ---
bot.action('start_support_flow', (ctx) => {
    activeTickets.set(ctx.from.id, { step: 'ASK_WHATSAPP' });
    ctx.reply("يرجى إدخال رقم الواتساب الخاص بك:");
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    // رد الموظف
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const match = ctx.message.reply_to_message.text.match(/ID: (\d+)/);
        if (match) {
            const targetId = parseInt(match[1]);
            if (activeTickets.has(targetId)) {
                await bot.telegram.sendMessage(targetId, `🎧 الدعم: ${ctx.message.text}`);
                setupIdleTimer(targetId);
            }
        }
        return;
    }

    // تدفق العميل
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        if (ticket.step === 'ASK_WHATSAPP') {
            ticket.whatsapp = ctx.message.text;
            ticket.step = 'ASK_ISSUE';
            ctx.reply("شكراً. الآن أرسل وصف مشكلتك وصورة (اختياري):");
        } else if (ticket.step === 'ASK_ISSUE') {
            ticket.issue = ctx.message.text || ctx.message.caption;
            ticket.step = 'ACTIVE';
            setupIdleTimer(userId);
            const msg = `📩 تذكرة جديدة\n🆔 ID: ${userId}\n📱 واتساب: ${ticket.whatsapp}\n📝 المشكلة: ${ticket.issue}`;
            if (ctx.message.photo) await bot.telegram.sendPhoto(SUPPORT_GROUP_ID, ctx.message.photo[0].file_id, { caption: msg });
            else await bot.telegram.sendMessage(SUPPORT_GROUP_ID, msg);
            ctx.reply("✅ تم إرسال طلبك.");
        }
    }
});

bot.launch();
