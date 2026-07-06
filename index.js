const { Telegraf, Markup } = require('telegraf');

// التوكن الخاص بك
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304'; 
const activeTickets = new Map(); 

// ==========================================
// قاعدة بيانات المنتجات (محتواك الأصلي)
// ==========================================
const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة بدون أي مسافات زائدة.\n2. تأكد من أنك لم تقم بتغيير أي بيانات في الحساب.\n3. إذا استمرت المشكلة، فقد يكون الحساب تحت التحديث المؤقت من المتجر.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. هذا يعني أن هناك ضغط مؤقت على الحساب من مستخدمين آخرين.\n2. يرجى الانتظار من 5 إلى 10 دقائق وإعادة المحاولة.\n3. تأكد تماماً من دخولك على الشاشة (Profile) الخاصة بك والمحددة لك فقط عند الشراء.' },
        { id: 'net_3', btn: '🌐 اللغة تغيرت أو اختفت الترجمة العربية', title: 'تغير اللغة أو الترجمة العربية', steps: '1. ادخل إلى إعدادات الحساب من المتصفح (وليس التطبيق) وقم بتغيير لغة الـ Profile الخاص بك إلى العربية.\n2. أثناء تشغيل الفيديو، اضغط على خيار الصوت والترجمة (Audio & Subtitles) وتأكد من اختيار العربية.', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8fed85' },
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

const productsList = Object.keys(productsData);

// ==========================================
// وظائف المساعدة لنظام التذاكر
// ==========================================
function getQueuePosition(userId) {
    const keys = Array.from(activeTickets.keys());
    return keys.indexOf(userId) + 1;
}

function resetTicketTimer(userId) {
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        clearTimeout(ticket.timer);
        
        // تنبيه بعد 10 دقائق من الخمول
        ticket.timer = setTimeout(async () => {
            try {
                await bot.telegram.sendMessage(userId, "⚠️ **تنبيه:** لم نتلقَ أي رد منك منذ 10 دقائق. سيتم إغلاق التذكرة تلقائياً بعد دقيقة واحدة إذا لم نتلقَ رداً.");
                
                ticket.timer = setTimeout(() => {
                    bot.telegram.sendMessage(userId, "❌ تم إغلاق التذكرة لعدم الاستجابة.");
                    activeTickets.delete(userId);
                }, 60 * 1000); // دقيقة إضافية
            } catch (e) { console.error(e); }
        }, 10 * 60 * 1000); // 10 دقائق
    }
}

// ==========================================
// منطق البوت الأساسي
// ==========================================
bot.start((ctx) => {
    const firstName = ctx.from.first_name || "عزيزي المستخدم";
    const welcomeMessage = `👋 أهلاً بك يا ${firstName} في بوت الدعم الذكي لـ <b>Ustern</b>!\n\n🤖 أنا هنا لمساعدتك فوراً. يرجى اختيار القسم المناسب:`;
    ctx.reply(welcomeMessage, { parse_mode: 'HTML', ...Markup.inlineKeyboard([
        [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
        [Markup.button.callback('🎧 تحدث مع الدعم', 'human_support')]
    ])});
});

bot.action('faq', (ctx) => {
    ctx.answerCbQuery();
    const buttons = [];
    for (let i = 0; i < productsList.length; i += 2) {
        const row = [Markup.button.callback(productsData[productsList[i]].name, 'prod_' + productsList[i])];
        if (productsList[i + 1]) row.push(Markup.button.callback(productsData[productsList[i + 1]].name, 'prod_' + productsList[i + 1]));
        buttons.push(row);
    }
    return ctx.reply("🛍️ اختر المنتج الذي تواجه مشكلة فيه:", Markup.inlineKeyboard(buttons));
});

productsList.forEach(key => {
    const prod = productsData[key];
    bot.action('prod_' + key, (ctx) => {
        ctx.answerCbQuery();
        const problemButtons = prod.problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        return ctx.reply(`يرجى تحديد المشكلة في ${prod.name}:`, Markup.inlineKeyboard(problemButtons));
    });
    prod.problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.answerCbQuery();
            const txt = `🛠️ <b>حل مشكلة (${p.title}) لـ ${prod.name}:</b>\n\n${p.steps}`;
            const extraButtons = { parse_mode: 'HTML', ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 لم تحل المشكلة (تحدث مع الدعم)', 'human_support')]
            ])};
            p.image ? ctx.replyWithPhoto(p.image, { caption: txt, ...extraButtons }) : ctx.reply(txt, extraButtons);
        });
    });
});

// ==========================================
// نظام التذاكر (التنفيذ)
// ==========================================
bot.action('human_support', (ctx) => {
    ctx.answerCbQuery();
    activeTickets.set(ctx.from.id, { messages: [], timer: null });
    resetTicketTimer(ctx.from.id);
    const pos = getQueuePosition(ctx.from.id);
    ctx.reply(`🎯 تم فتح تذكرة دعم.\n🔢 رقمك في قائمة الانتظار: ${pos}\n\nأرسل مشكلتك بالتفصيل وسنتابع معك:`, Markup.inlineKeyboard([Markup.button.callback('❌ إنهاء المحادثة', 'end_chat')]));
});

bot.action('end_chat', (ctx) => {
    ctx.answerCbQuery();
    activeTickets.delete(ctx.from.id);
    ctx.reply("✅ تم إنهاء المحادثة بنجاح.");
});

bot.on('message', async (ctx) => {
    const userId = ctx.from?.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : "لا يوجد";

    // رد الموظف في الجروب
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const match = (ctx.message.reply_to_message.text || "").match(/ID: (\d+)/);
        if (match) {
            const targetId = parseInt(match[1]);
            if (activeTickets.has(targetId)) {
                activeTickets.get(targetId).messages.push(`🎧 الدعم: ${ctx.message.text || "صورة"}`);
                resetTicketTimer(targetId);
                if (ctx.message.text) await bot.telegram.sendMessage(targetId, `🎧 رد الدعم: ${ctx.message.text}`);
                else if (ctx.message.photo) await bot.telegram.sendPhoto(targetId, ctx.message.photo.slice(-1)[0].file_id, { caption: ctx.message.caption });
            }
            ctx.reply("✅ تم الرد.");
        }
    } 
    // رسالة العميل
    else if (userId && activeTickets.has(userId)) {
        resetTicketTimer(userId);
        const ticket = activeTickets.get(userId);
        ticket.messages.push(`👤 ${ctx.from.first_name}: ${ctx.message.text || "صورة"}`);
        
        const msg = `📩 <b>تذكرة جديدة - ID: ${userId}</b>\n👤 العميل: ${ctx.from.first_name}\n🏷 اليوزر: ${username}\n\n${ticket.messages.join('\n')}\n\n---رد بـ Reply للرد على العميل---`;
        
        if (ctx.message.text) await bot.telegram.sendMessage(SUPPORT_GROUP_ID, msg, { parse_mode: 'HTML' });
        else if (ctx.message.photo) await bot.telegram.sendPhoto(SUPPORT_GROUP_ID, ctx.message.photo.slice(-1)[0].file_id, { caption: msg, parse_mode: 'HTML' });
        ctx.reply("✅ تم إرسال رسالتك.");
    }
});

bot.launch();
const express = require("express");
express().listen(3000);
