const { Telegraf, Markup } = require('telegraf');

// ==========================================
// 1. کنفیگریشن اور ڈیٹا بیس
// ==========================================

// اپنے بوٹ کا ٹوکن یہاں ڈالیں (اگر یہ پہلے سے موجود ہے تو اسے رہنے دیں)
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map(); // Map<userId, { step, clientName, clientPhone, chat: [], msgId }>

// --- قاعدة بيانات المحتوى الأصلي (كاملة) ---
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

const productsList = Object.keys(productsData);

// ==========================================
// 2. وظائف إدارة التذاكر المحدثة
// ==========================================

// دالة إغلاق التذكرة يدوياً بواسطة الدعم
async function closeTicketManually(targetId, adminName) {
    if (activeTickets.has(targetId)) {
        const ticket = activeTickets.get(targetId);
        const clientId = targetId;

        // إشعار العميل
        await bot.telegram.sendMessage(clientId, `✅ تم إغلاق التذكرة بنجاح بواسطة ${adminName}. نشكرك لاستخدام دعم Ustern.`);

        // تحديث رسالة الجروب وإضافة زر التقييم
        const finalMsg = `🎫 تم إغلاق التذكرة بواسطة ${adminName} (ID: ${clientId}).\n\nشكراً لتواصلك معنا، يرجى تقييم مستوى الدعم:`;
        try {
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, finalMsg, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback('⭐ 1', 'rate_1'),
                        Markup.button.callback('⭐⭐ 2', 'rate_2'),
                        Markup.button.callback('⭐⭐⭐ 3', 'rate_3')
                    ],
                    [
                        Markup.button.callback('⭐⭐⭐⭐ 4', 'rate_4'),
                        Markup.button.callback('⭐⭐⭐⭐⭐ 5', 'rate_5')
                    ]
                ])
            });
        } catch (e) { console.error("Error updating group msg on manual close", e); }

        // حذف التذكرة من الذاكرة
        activeTickets.delete(clientId);
    }
}

// دالة إنهاء المحادثة بواسطة العميل
async function closeTicketByClient(userId) {
    if (activeTickets.has(userId)) {
        const ticket = activeTickets.get(userId);
        const clientId = userId;

        // إشعار العميل
        await bot.telegram.sendMessage(clientId, `✅ تم إنهاء المحادثة بنجاح. نشكرك لاستخدام دعم Ustern.`);

        // تحديث رسالة الجروب وإضافة زر التقييم
        const finalMsg = `🎫 تم إنهاء التذكرة بواسطة العميل (ID: ${clientId}).\n\nشكراً لتواصلك معنا، يرجى تقييم مستوى الدعم:`;
        try {
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, finalMsg, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback('⭐ 1', 'rate_1'),
                        Markup.button.callback('⭐⭐ 2', 'rate_2'),
                        Markup.button.callback('⭐⭐⭐ 3', 'rate_3')
                    ],
                    [
                        Markup.button.callback('⭐⭐⭐⭐ 4', 'rate_4'),
                        Markup.button.callback('⭐⭐⭐⭐⭐ 5', 'rate_5')
                    ]
                ])
            });
        } catch (e) { console.error("Error updating group msg on client close", e); }

        // حذف التذكرة من الذاكرة
        activeTickets.delete(clientId);
    }
}

// ==========================================
// 3. منطق القوائم والأزرار الأساسية
// ==========================================

const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل والأسئلة الشائعة', 'faq')],
    [Markup.button.callback('📖 دليل التشغيل والشروحات', 'guide')],
    [Markup.button.callback('🛒 أسعار الاشتراكات وطرق الدفع', 'prices')],
    [Markup.button.callback('⚖️ شروط الاستخدام وسياسة الضمان', 'terms')]
]);

bot.start((ctx) => {
    const name = ctx.from.first_name || 'مستخدمنا العزيز';
    ctx.reply(`👋 أهلاً بك يا ${name} في بوت الدعم الذكي لـ <b>Ustern</b>!\n\n🤖 أنا هنا لمساعدتك. يرجى اختيار القسم المناسب من القائمة التالية:`, { parse_mode: 'HTML', ...mainMenu });
});

bot.action('main_menu', (ctx) => {
    ctx.answerCbQuery();
    const name = ctx.from.first_name || 'مستخدمنا العزيز';
    ctx.editMessageText(`👋 أهلاً بك يا ${name} في بوت الدعم الذكي لـ <b>Ustern</b>!\n\n🤖 أنا هنا لمساعدتك. يرجى اختيار القسم المناسب من القائمة التالية:`, { parse_mode: 'HTML', ...mainMenu });
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
    buttons.push([Markup.button.callback('🔙 العودة للقائمة الرئيسية', 'main_menu')]);
    ctx.editMessageText("🛍️ اختر المنتج الذي تواجه مشكلة فيه:", Markup.inlineKeyboard(buttons));
});

// ==========================================
// 4. منطق المنتجات والمشاكل (الأصلي بدون تغيير)
// ==========================================

productsList.forEach(key => {
    const prod = productsData[key];
    bot.action('prod_' + key, (ctx) => {
        ctx.answerCbQuery();
        const problemButtons = prod.problems.map(p => [Markup.button.callback(p.btn, 'err_' + p.id)]);
        problemButtons.push([Markup.button.callback('🔙 العودة لاختيار المنتج', 'faq')]);
        return ctx.editMessageText(`يرجى تحديد المشكلة في ${prod.name}:`, Markup.inlineKeyboard(problemButtons));
    });

    prod.problems.forEach(p => {
        bot.action('err_' + p.id, (ctx) => {
            ctx.answerCbQuery();
            const txt = `🛠️ <b>حل مشكلة (${p.title}) لـ ${prod.name}:</b>\n\n${p.steps}`;
            const buttons = {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📞 لم تحل المشكلة؟ (تحدث مع الدعم)', 'human_support')]
                ])
            };
            ctx.editMessageText(txt, buttons);
        });
    });
});

// ==========================================
// 5. نظام التذاكر المطور (المحادثة المستمرة)
// ==========================================

// العميل يضغط على "تحدث مع الدعم"
bot.action('human_support', (ctx) => {
    ctx.answerCbQuery();
    // بدء عملية التحدث: نحفظ الـ ID والمرحلة
    activeTickets.set(ctx.from.id, { step: 'GATHERING_INFO', chat: [], msgId: null });
    ctx.reply("🎯 لخدمتك بشكل أسرع، يرجى كتابة رقم الواتساب الخاص بك والمشكلة بالتفصيل (يمكنك إرفاق صورة):");
});

// التعامل مع أزرار التحكم في الجروب (الإغلاق بواسطة الدعم)
bot.action(/close_admin_(.+)/, async (ctx) => {
    const adminName = ctx.from.first_name;
    const targetId = parseInt(ctx.match[1]);
    await closeTicketManually(targetId, adminName);
});

// التعامل مع زر إنهاء المحادثة (للعميل)
bot.action('close_client', async (ctx) => {
    const userId = ctx.from.id;
    await closeTicketByClient(userId);
});

// التعامل مع التقييم
bot.action(/rate_(.+)/, async (ctx) => {
    const rate = ctx.match[1];
    ctx.answerCbQuery(`✅ شكراً لك، تم التقييم بـ ${rate} نجوم.`);
    await ctx.editMessageText(`🎫 شكراً لتواصلك معنا، تم تقييم مستوى الدعم: <b>${rate} ⭐</b>`, { parse_mode: 'HTML' });
});

// ==========================================
// 6. معالج الرسائل الرئيسي (القلب النابض)
// ==========================================

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.first_name;
    const userUsername = ctx.from.username ? `(@${ctx.from.username})` : 'بدون يوزر';

    // 1. رد الموظف في الجروب
    if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const replyText = ctx.message.reply_to_message.text;
        // استخراج ID العميل من رسالة التذكرة الأصلية
        const match = replyText.match(/ID:\s*(\d+)/);
        if (match) {
            const targetId = parseInt(match[1]);
            const
