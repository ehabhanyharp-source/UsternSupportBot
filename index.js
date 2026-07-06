const { Telegraf, Markup } = require('telegraf');

// التوكن الحقيقي بتاعك مدمج وجاهز
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map();

// ==========================================
// قاعدة بيانات المشاكل والحلول الشاملة (HTML تليجرام) كما هي
// ==========================================
const productsData = {
    netflix: {
        name: '🎬 Netflix',
        problems: [
            { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة بدون أي مسافات زائدة.\n2. تأكد من أنك لم تقم بتغيير أي بيانات في الحساب.\n3. إذا استمرت المشكلة، فقد يكون الحساب تحت التحديث المؤقت من المتجر.' },
            { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. هذا يعني أن هناك ضغط مؤقت على الحساب من مستخدمين آخرين.\n2. يرجى الانتظار من 5 إلى 10 دقائق وإعادة المحاولة.\n3. تأكد تماماً من دخولك على الشاشة (Profile) الخاصة بك والمحددة لك فقط عند الشراء.' },
            { id: 'net_3', btn: '🌐 اللغة تغيرت أو اختفت الترجمة العربية', title: 'تغير اللغة أو الترجمة العربية', steps: '1. ادخل إلى إعدادات الحساب من المتصفح (وليس التطبيق) وقم بتغيير لغة الـ Profile الخاص بك إلى العربية.\n2. أثناء تشغيل الفيديو، اضغط على خيار الصوت والترجمة (Audio & Subtitles) وتأكد من اختيار العربية.', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8fed85' },
            { id: 'net_4', btn: '💳 يطلب تحديث طريقة الدفع', title: 'رسالة تحديث طريقة الدفع (Update Payment)', steps: '1. هذه المشكلة تظهر أحياناً بسبب فحص تلقائي من نتفليكس.\n2. يرجى عدم القيام بأي خطوة أو إضافة بطاقتك.\n3. تواصل مع الدعم بالأسفل فوراً ليتم تحديث الاشتراك أو تبديل الحساب لك.' }
        ]
    },
    shahid: {
        name: '🌟 Shahid VIP',
        problems: [
            { id: 'sha_1', btn: '🆓 الحساب رجع مجاني (Free)', title: 'الحساب رجع مجاني', steps: '1. قم بعمل تسجيل خروج (Log out) من الحساب داخل التطبيق.\n2. أغلق تطبيق شاهد تماماً (احذفه من الخلفية).\n3. أعد تشغيل التطبيق وسجل دخولك مجدداً بنفس البيانات المرسلة لك بدقة.' },
            { id: 'sha_2', btn: '📱 حد الأجهزة المشغلة (Device Limit)', title: 'حد الأجهزة الأقصى', steps: '1. سياسة متجرنا تمنحك تشغيل الحساب على (جهاز واحد فقط) في نفس الوقت.\n2. يرجى تسجيل الخروج من أي أجهزة أخرى قمت بالدخول منها.\n3. انتظر 5 دقائق ثم أعد تشغيل الفيديو.' },
            { id: 'sha_3', btn: '🌐 واجهة التطبيق بالإنجليزية / مشكلة لغة', title: 'تغيير لغة واجهة تطبيق شاهد والترجمة', steps: '1. من القائمة الجانبية للتطبيق، اضغط على "الملف الشخصي" أو "الإعدادات".\n2. ستجد خيار "اللغة" (Language)، قم بتحويله إلى العربية.\n3. إذا كانت المشكلة في لغة الصوت أثناء الفيلم، اضغط على علامة الميكروفون أسفل الشاشة واختر الصوت الأصلي أو الدبلجة العربية.' }
        ]
    },
    osn: {
        name: '📺 OSN+',
        problems: [
            { id: 'osn_1', btn: '🔐 كود الدخول لا يصل للموبايل', title: 'عدم وصول كود الدخول / التحقق', steps: '1. إذا كان الحساب يعتمد على كود الموبايل، يرجى التواصل مع الدعم بالأسفل فوراً لإرسال الكود لك حياً.\n2. يفضل تسجيل الدخول عبر الإيميل والباسورد المباشرين إن توفروا.' },
            { id: 'osn_2', btn: '🌐 الترجمة غير متطابقة أو اللغة إنجليزية', title: 'مشكلة الترجمة واللغة في OSN+', steps: '1. افتح الفيديو الذي ترغب في مشاهدته.\n2. اضغط على علامة (CC) أو خيار الترجمة والصوت الموجود أسفل مشغل الفيديو.\n3. اختر اللغة العربية للترجمة (Subtitles)، واجعل الصوت (Audio) باللغة الأصلية أو العربية حسب رغبتك.' },
            { id: 'osn_3', btn: '🔄 الحساب معلق / يطلب اشتراك', title: 'الحساب معلق أو يطلب التجديد', steps: '1. قم بعمل تسجيل خروج ثم إعادة تسجيل الدخول.\n2. إذا استمرت رسالة الاشتراك، فإن الحساب يحتاج لإعادة تفعيل من طرفنا، يرجى إرسال لقطة شاشة للدعم بالأسفل.' }
        ]
    },
    disney: {
        name: '🏰 Disney+',
        problems: [
            { id: 'dis_1', btn: '🔐 الحساب مغلق / الباسورد غير صحيح', title: 'الحساب مغلق أو الباسورد خطأ', steps: '1. ديزني تقوم أحياناً بحظر مؤقت للـ IP عند المحاولات الكثيرة.\n2. انتظر 10 دقائق ثم جرب الدخول مرة أخرى بدقة وبدون مسافات بالرقم السري.' },
            { id: 'dis_2', btn: '🌐 الترجمة العربية أو الدبلجة مفقودة', title: 'اختفاء الترجمة أو الدبلجة العربية في ديزني', steps: '1. أثناء تشغيل الفيلم، اضغط على علامة المربع/الترس الخاصة بالإعدادات (أعلى أو أسفل الشاشة).\n2. توجه إلى خيار (Audio) للدبلجة واختر العربية، أو (Subtitles) للترجمة المكتوبة.\n3. ملحوظة: بعض الأفلام القديمة جداً قد لا تتوفر لها دبلجة عربية من المصدر، لكن الترجمة متوفرة دائماً.' },
            { id: 'dis_3', btn: '🚫 هذا المحتوى غير متوفر في بلدك', title: 'رسالة المحتوى غير متوفر بالمنطقة', steps: '1. تأكد من إغلاق أي تطبيق VPN تماماً.\n2. إذا كنت خارج الدول العربية، قد تحتاج لتشغيل VPN على دولة عربية (مصر أو السعودية) ليعمل الحساب المخصص للشرق الأوسط.' }
        ]
    }
};

const productsList = Object.keys(productsData);

// ==========================================
// الواجهة الرئيسية (Main Keyboard)
// ==========================================
bot.start((ctx) => {
    const firstName = ctx.from.first_name || "عزيزي المستخدم";
    const welcomeMessage = `👋 أهلاً بك يا ${firstName} في بوت الدعم الذكي لـ <b>Ustern</b>!\n\n🤖 أنا هنا لمساعدتك فوراً. يرجى اختيار القسم المناسب:`;

    ctx.reply("🔄 جاري تهيئة البوت الذكي...", { reply_markup: { remove_keyboard: true } }).then(() => {
        return ctx.reply(welcomeMessage, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
                [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guides')],
                [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'pricing')],
                [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
            ])
        });
    });
});

bot.action('faq', (ctx) => {
    ctx.answerCbQuery();
    const buttons = [];
    for (let i = 0; i < productsList.length; i += 2) {
        const row = [Markup.button.callback(productsData[productsList[i]].name, 'prod_' + productsList[i])];
        if (productsList[i + 1]) {
            row.push(Markup.button.callback(productsData[productsList[i + 1]].name, 'prod_' + productsList[i + 1]));
        }
        buttons.push(row);
    }
    buttons.push([Markup.button.callback('🔙 العودة للرئيسية', 'back_home')]);
    return ctx.reply("🛍️ اختر المنتج الذي تواجه مشكلة فيه لعرض الحلول فوراً:", Markup.inlineKeyboard(buttons));
});

productsList.forEach(key => {
    const prod = productsData[key];
    bot.action('prod_' + key, (ctx) => {
        ctx.answerCbQuery();
        const problemButtons = prod.problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        problemButtons.push([Markup.button.callback('🔙 العودة للمنتجات', 'faq')]);
        return ctx.reply(`يرجى تحديد المشكلة المحددة التي تواجهها في ${prod.name}:`, Markup.inlineKeyboard(problemButtons));
    });

    prod.problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.answerCbQuery();
            const txt = `🛠️ <b>حل مشكلة (${p.title}) لـ ${prod.name}:</b>\n\n${p.steps}\n\n💡 إذا قمت بتطبيق الخطوات ولم تُحل المشكلة، يمكنك التحدث مع الموظف المختص:`;
            const extraButtons = { parse_mode: 'HTML', ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 لم تحل المشكلة (تحدث مع الدعم)', 'human_support')],
                [Markup.button.callback('⬅️ العودة لمشاكل المنتج', 'prod_' + key)]
            ])};
            p.image ? ctx.replyWithPhoto(p.image, { caption: txt, ...extraButtons }) : ctx.reply(txt, extraButtons);
        });
    });
});

bot.action('guides', (ctx) => { ctx.answerCbQuery(); /* أضف منطقك هنا */ });
bot.action('pricing', (ctx) => { ctx.answerCbQuery(); /* أضف منطقك هنا */ });
bot.action('terms', (ctx) => { ctx.answerCbQuery(); /* أضف منطقك هنا */ });

// ==========================================
// منطق الدعم البشري (المدمج)
// ==========================================
bot.action('human_support', (ctx) => {
    ctx.answerCbQuery();
    activeTickets.set(ctx.from.id, { name: ctx.from.first_name });
    ctx.reply("🎯 <b>تم تفعيل وضع الدعم البشري بـ Ustern:</b>\n\nيرجى كتابة مشكلتك بالتفصيل أو إرسال صورة، وسيقوم الموظف المختص بالرد عليك فوراً. ⏳", { parse_mode: 'HTML' });
});

bot.on('message', async (ctx) => {
    // رد الموظف في الجروب
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const text = ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption || "";
        const match = text.match(/ID: (\d+)/);
        if (match) {
            const userId = match[1];
            if (ctx.message.text) await bot.telegram.sendMessage(userId, `🎧 رد الدعم: ${ctx.message.text}`);
            else if (ctx.message.photo) await bot.telegram.sendPhoto(userId, ctx.message.photo[ctx.message.photo.length - 1].file_id, { caption: ctx.message.caption });
            ctx.reply("✅ تم إرسال ردك للعميل.");
        }
    }
    // رسالة العميل للبوت
    else if (activeTickets.has(ctx.from?.id)) {
        if (ctx.message.text) await bot.telegram.sendMessage(SUPPORT_GROUP_ID, `📩 تذكرة من: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}\n📝: ${ctx.message.text}\n\n(رد بـ Reply)`);
        else if (ctx.message.photo) await bot.telegram.sendPhoto(SUPPORT_GROUP_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, { caption: `📩 صورة من: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}` });
        ctx.reply("✅ تم إرسال رسالتك لفريق الدعم.");
    }
});

bot.action('back_home', (ctx) => {
    ctx.answerCbQuery(); ctx.deleteMessage();
    return ctx.reply("🔙 أهلاً بك مجدداً في القائمة الرئيسية:");
});

bot.launch();
const express = require("express");
express().listen(3000);
