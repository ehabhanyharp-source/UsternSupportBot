const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304'; 
const activeTickets = new Map(); 

// ==========================================
// القائمة الأصلية (كما ظهرت في 2916.jpg)
// ==========================================
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')],
    [Markup.button.callback('🎧 تحدث مع الدعم', 'human_support')]
]);

// قاعدة بيانات المنتجات الأصلية
const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة بدون أي مسافات زائدة.\n2. تأكد من أنك لم تقم بتغيير أي بيانات في الحساب.\n3. إذا استمرت المشكلة، فقد يكون الحساب تحت التحديث المؤقت من المتجر.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. هذا يعني أن هناك ضغط مؤقت على الحساب من مستخدمين آخرين.\n2. يرجى الانتظار من 5 إلى 10 دقائق وإعادة المحاولة.\n3. تأكد تماماً من دخولك على الشاشة (Profile) الخاصة بك والمحددة لك فقط عند الشراء.' },
        { id: 'net_3', btn: '🌐 اللغة تغيرت أو اختفت الترجمة العربية', title: 'تغير اللغة أو الترجمة العربية', steps: '1. ادخل إلى إعدادات الحساب من المتصفح (وليس التطبيق) وقم بتغيير لغة الـ Profile الخاص بك إلى العربية.\n2. أثناء تشغيل الفيديو، اضغط على خيار الصوت والترجمة (Audio & Subtitles) وتأكد من اختيار العربية.' },
        { id: 'net_4', btn: '💳 يطلب تحديث طريقة الدفع', title: 'رسالة تحديث طريقة الدفع (Update Payment)', steps: '1. هذه المشكلة تظهر أحياناً بسبب فحص تلقائي من نتفليكس.\n2. يرجى عدم القيام بأي خطوة أو إضافة بطاقتك.\n3. تواصل مع الدعم بالأسفل فوراً ليتم تحديث الاشتراك أو تبديل الحساب لك.' }
    ]},
    shahid: { name: '🌟 Shahid VIP', problems: [
        { id: 'sha_1', btn: '🆓 الحساب رجع مجاني (Free)', title: 'الحساب رجع مجاني', steps: '1. قم بعمل تسجيل خروج (Log out) من الحساب داخل التطبيق.\n2. أغلق تطبيق شاهد تماماً (احذفه من الخلفية).\n3. أعد تشغيل التطبيق وسجل دخولك مجدداً بنفس البيانات المرسلة لك بدقة.' },
        { id: 'sha_2', btn: '📱 حد الأجهزة المشغلة (Device Limit)', title: 'حد الأجهزة الأقصى', steps: '1. سياسة متجرنا تمنحك تشغيل الحساب على (جهاز واحد فقط) في نفس الوقت.\n2. يرجى تسجيل الخروج من أي أجهزة أخرى قمت بالدخول منها.\n3. انتظر 5 دقائق ثم أعد تشغيل الفيديو.' },
        { id: 'sha_3', btn: '🌐 واجهة التطبيق بالإنجليزية / مشكلة لغة', title: 'تغيير لغة واجهة تطبيق شاهد والترجمة', steps: '1. من القائمة الجانبية للتطبيق، اضغط على "الملف الشخصي" أو "الإعدادات".\n2. ستجد خيار "اللغة" (Language)، قم بتحويله إلى العربية.\n3. إذا كانت المشكلة في لغة الصوت أثناء الفيلم، اضغط على علامة الميكروفون أسفل الشاشة واختر الصوت الأصلي أو الدبلجة العربية.' }
    ]},
    osn: { name: '📺 OSN+', problems: [
        { id: 'osn_1', btn: '🔐 كود الدخول لا يصل للموبايل', title: 'عدم وصول كود الدخول / التحقق', steps: '1. إذا كان الحساب يعتمد على كود الموبايل، يرجى التواصل مع الدعم بالأسفل فوراً لإرسال الكود لك حياً.\n2. يفضل تسجيل الدخول عبر الإيميل والباسورد المباشرين إن توفروا.' },
        { id: 'osn_2', btn: '🌐 الترجمة غير متطابقة أو اللغة إنجليزية', title: 'مشكلة الترجمة واللغة في OSN+', steps: '1. افتح الفيديو الذي ترغب في مشاهدته.\n2. اضغط على علامة (CC) أو خيار الترجمة والصوت الموجود أسفل مشغل الفيديو.\n3. اختر اللغة العربية للترجمة (Subtitles)، واجعل الصوت (Audio) باللغة الأصلية أو العربية حسب رغبتك.' },
        { id: 'osn_3', btn: '🔄 الحساب معلق / يطلب اشتراك', title: 'الحساب معلق أو يطلب التجديد', steps: '1. قم بعمل تسجيل خروج ثم إعادة تسجيل الدخول.\n2. إذا استمرت رسالة الاشتراك، فإن الحساب يحتاج لإعادة تفعيل من طرفنا، يرجى إرسال لقطة شاشة للدعم بالأسفل.' }
    ]},
    disney: { name: '🏰 Disney+', problems: [
        { id: 'dis_1', btn: '🔐 الحساب مغلق / الباسورد غير صحيح', title: 'الحساب مغلق أو الباسورد خطأ', steps: '1. ديزني تقوم أحياناً بحظر مؤقت للـ IP عند المحاولات الكثيرة.\n2. انتظر 10 دقائق ثم جرب الدخول مرة أخرى بدقة وبدون مسافات بالرقم السري.' },
        { id: 'dis_2', btn: '🌐 الترجمة العربية أو الدبلجة مفقودة', title: 'اختفاء الترجمة أو الدبلجة العربية في ديزني', steps: '1. أثناء تشغيل الفيلم، اضغط على علامة المربع/الترس الخاصة بالإعدادات (أعلى أو أسفل الشاشة).\n2. توجه إلى خيار (Audio) للدبلجة واختر العربية، أو (Subtitles) للترجمة المكتوبة.\n3. ملحوظة: بعض الأفلام القديمة جداً قد لا تتوفر لها دبلجة عربية من المصدر، لكن الترجمة متوفرة دائماً.' },
        { id: 'dis_3', btn: '🚫 هذا المحتوى غير متوفر في بلدك', title: 'رسالة المحتوى غير متوفر بالمنطقة', steps: '1. تأكد من إغلاق أي تطبيق VPN تماماً.\n2. إذا كنت خارج الدول العربية، قد تحتاج لتشغيل VPN على دولة عربية (مصر أو السعودية) ليعمل الحساب المخصص للشرق الأوسط.' }
    ]}
};

// ==========================================
// وظائف التذاكر المحدثة
// ==========================================
function resetTicketTimer(userId) {
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        if (ticket.timer) clearTimeout(ticket.timer);
        ticket.timer = setTimeout(async () => {
            try {
                await bot.telegram.sendMessage(userId, "⚠️ تنبيه: لم يصلنا رد منذ 5 دقائق. سيتم إغلاق التذكرة بعد 5 دقائق أخرى.");
                ticket.timer = setTimeout(() => {
                    if (activeTickets.has(userId)) {
                        bot.telegram.sendMessage(userId, "❌ تم إغلاق التذكرة لعدم الاستجابة.");
                        activeTickets.delete(userId);
                    }
                }, 5 * 60 * 1000);
            } catch (e) { console.error(e); }
        }, 5 * 60 * 1000);
    }
}

// ==========================================
// منطق البوت
// ==========================================
bot.start((ctx) => ctx.reply(`👋 أهلاً بك يا ${ctx.from.first_name} في بوت Ustern!`, mainMenu));

bot.action('faq', (ctx) => {
    ctx.answerCbQuery();
    const buttons = Object.keys(productsData).map(key => [Markup.button.callback(productsData[key].name, 'prod_' + key)]);
    buttons.push([Markup.button.callback('🔙 العودة للرئيسية', 'start')]);
    ctx.editMessageText("🛍 اختار المنتج الذي تواجه مشكلة فيه:", Markup.inlineKeyboard(buttons));
});

bot.action('start', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText(`👋 أهلاً بك يا ${ctx.from.first_name} في بوت Ustern!`, mainMenu);
});

// تفعيل أزرار المنتجات والمشاكل
Object.keys(productsData).forEach(key => {
    bot.action('prod_' + key, (ctx) => {
        ctx.answerCbQuery();
        const buttons = productsData[key].problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        buttons.push([Markup.button.callback('🔙 العودة للمنتجات', 'faq')]);
        ctx.editMessageText(`📺 يرجى تحديد المشكلة في ${productsData[key].name}:`, Markup.inlineKeyboard(buttons));
    });
    productsData[key].problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.answerCbQuery();
            ctx.reply(`🛠️ <b>${p.title}</b>\n\n${p.steps}`, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('🎧 تحدث مع الدعم', 'human_support')]]) });
        });
    });
});

// التعامل مع الدعم
bot.action('human_support', (ctx) => {
    ctx.answerCbQuery();
    activeTickets.set(ctx.from.id, { messages: [], timer: null });
    resetTicketTimer(ctx.from.id);
    ctx.reply("🎯 تم فتح تذكرة دعم. أرسل مشكلتك بالتفصيل وسنتابع معك:", Markup.inlineKeyboard([Markup.button.callback('❌ إنهاء المحادثة', 'end_chat')]));
});

bot.action('end_chat', (ctx) => {
    ctx.answerCbQuery();
    activeTickets.delete(ctx.from.id);
    ctx.reply("✅ تم إنهاء المحادثة.");
});

// منطق الرد المضمون
bot.on('message', async (ctx) => {
    const userId = ctx.from?.id;
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const text = ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption || "";
        const match = text.match(/ID:\s*(\d+)/);
        if (match) {
            const targetId = parseInt(match[1]);
            if (activeTickets.has(targetId)) {
                resetTicketTimer(targetId);
                await bot.telegram.sendMessage(targetId, `🎧 رد الدعم: ${ctx.message.text}`);
                ctx.reply("✅ تم إرسال الرد للعميل.");
            }
        }
    } else if (userId && activeTickets.has(userId)) {
        resetTicketTimer(userId);
        const ticket = activeTickets.get(userId);
        ticket.messages.push(`👤 ${ctx.from.first_name}: ${ctx.message.text}`);
        await bot.telegram.sendMessage(SUPPORT_GROUP_ID, `📩 <b>تذكرة - ID: ${userId}</b>\n👤: ${ctx.from.first_name}\n\n${ticket.messages.join('\n')}\n\n---رد بـ Reply للرد---`, { parse_mode: 'HTML' });
        ctx.reply("✅ تم إرسال رسالتك.");
    }
});

bot.launch();
const express = require("express");
express().listen(3000);
