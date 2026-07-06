const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map();
let ticketCounter = 1000;

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

const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

function startReminderTimer(userId) {
    const ticket = activeTickets.get(userId);
    if (!ticket) return;
    if (ticket.timer) clearTimeout(ticket.timer);
    ticket.timer = setTimeout(async () => {
        try { await bot.telegram.sendMessage(userId, "⚠️ نحن في انتظار ردك بخصوص استفسارك، هل تم حل المشكلة؟"); } 
        catch (e) { console.log("تعذر إرسال التنبيه"); }
    }, 5 * 60 * 1000);
}

bot.start((ctx) => ctx.reply(`👋 أهلاً بك يا ${ctx.from.first_name} في بوت Ustern!`, mainMenu));

bot.action('faq', (ctx) => {
    const btns = Object.keys(productsData).map(key => [Markup.button.callback(productsData[key].name, 'prod_' + key)]);
    ctx.editMessageText("🛍 اختر المنتج:", Markup.inlineKeyboard(btns));
});

Object.keys(productsData).forEach(key => {
    bot.action('prod_' + key, (ctx) => {
        const btns = productsData[key].problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        ctx.editMessageText(`📺 المشاكل في ${productsData[key].name}:`, Markup.inlineKeyboard(btns));
    });
    productsData[key].problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.reply(`🛠️ <b>${p.title}</b>\n\n${p.steps}`, { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('📞 تحدث مع الدعم', 'start_support_flow')]]) });
        });
    });
});

bot.action('start_support_flow', (ctx) => {
    const ticketId = ++ticketCounter;
    const queueNumber = activeTickets.size + 1;
    activeTickets.set(ctx.from.id, { step: 'ASK_PHONE', chat: [], ticketId: ticketId, queue: queueNumber });
    ctx.reply(`🎯 تم فتح تذكرة دعم.\n🔢 رقم التذكرة: ${ticketId}\n⏳ ترتيبك في الانتظار: ${queueNumber}\n⏱️ متوسط وقت الرد المتوقع: 15-30 دقيقة.\n\nيرجى إدخال رقم الواتساب الخاص بك:`);
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name;
    const username = ctx.from.username ? `(@${ctx.from.username})` : "";
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const match = ctx.message.reply_to_message.text.match(/ID: (\d+)/);
        if (match) {
            const targetId = parseInt(match[1]);
            const ticket = activeTickets.get(targetId);
            if (ticket) {
                ticket.chat.push(`🎧 الدعم: ${ctx.message.text || "صورة"}`);
                await bot.telegram.sendMessage(targetId, `🎧 الدعم: ${ctx.message.text || "صورة"}`);
                await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ctx.message.reply_to_message.message_id, null, 
                    `📩 تذكرة رقم: ${ticket.ticketId}\n👤 العميل: ${name} ${username}\n📱 واتساب: ${ticket.phone}\n\n${ticket.chat.join('\n')}\n\n---رد بـ Reply للرد---`);
                startReminderTimer(targetId);
            }
        }
        return;
    }
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        const text = ctx.message.text || ctx.message.caption || "رسالة";
        if (ticket.step === 'ASK_PHONE') {
            ticket.phone = text;
            ticket.step = 'ACTIVE';
            const init = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, 
                `📩 تذكرة رقم: ${ticket.ticketId}\n🆔 ID: ${userId}\n👤 العميل: ${name} ${username}\n📱 واتساب: ${ticket.phone}\n\n---انتظار الرد---`);
            ticket.msgId = init.message_id;
            ctx.reply("✅ تم استلام طلبك، سيقوم الدعم بالرد عليك قريباً.");
        } else {
            ticket.chat.push(`👤 ${name}: ${text}`);
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, 
                `📩 تذكرة رقم: ${ticket.ticketId}\n🆔 ID: ${userId}\n👤 العميل: ${name} ${username}\n📱 واتساب: ${ticket.phone}\n\n${ticket.chat.join('\n')}\n\n---رد بـ Reply للرد---`);
            ctx.reply("✅ تم إرسال رسالتك للدعم.");
        }
    }
});

bot.launch();
