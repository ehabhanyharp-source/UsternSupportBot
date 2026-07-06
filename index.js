const { Telegraf, Markup } = require('telegraf');

// ==========================================
// الإعدادات
// ==========================================
const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304'; 
const activeTickets = new Map(); 

// قاعدة البيانات (كما هي تماماً)
const productsData = {
    netflix: { name: '🎬 Netflix', problems: [
        { id: 'net_1', btn: '🔐 الباسورد غلط / الحساب مقفل', title: 'الباسورد غلط أو الحساب مقفل', steps: '1. تأكد من نسخ الإيميل والباسورد بدقة بدون أي مسافات زائدة.\n2. تأكد من أنك لم تقم بتغيير أي بيانات في الحساب.' },
        { id: 'net_2', btn: '📺 حد الشاشات (Too Many Screens)', title: 'حد الشاشات الأقصى', steps: '1. هذا يعني أن هناك ضغط مؤقت على الحساب.\n2. يرجى الانتظار من 5 إلى 10 دقائق.' },
        { id: 'net_3', btn: '🌐 اللغة تغيرت أو اختفت الترجمة العربية', title: 'تغير اللغة أو الترجمة العربية', steps: '1. ادخل إلى إعدادات الحساب من المتصفح.\n2. تأكد من اختيار العربية في إعدادات الترجمة.', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8fed85' },
        { id: 'net_4', btn: '💳 يطلب تحديث طريقة الدفع', title: 'رسالة تحديث طريقة الدفع', steps: '1. لا تقم بأي خطوة. تواصل مع الدعم فوراً.' }
    ]},
    shahid: { name: '🌟 Shahid VIP', problems: [
        { id: 'sha_1', btn: '🆓 الحساب رجع مجاني (Free)', title: 'الحساب رجع مجاني', steps: '1. سجل خروج وأغلق التطبيق تماماً.\n2. أعد تسجيل الدخول.' },
        { id: 'sha_2', btn: '📱 حد الأجهزة المشغلة (Device Limit)', title: 'حد الأجهزة الأقصى', steps: '1. يرجى تسجيل الخروج من أي أجهزة أخرى.' },
        { id: 'sha_3', btn: '🌐 واجهة التطبيق بالإنجليزية', title: 'تغيير لغة واجهة تطبيق شاهد', steps: '1. من الإعدادات اختر الملف الشخصي.\n2. قم بتحويل اللغة للعربية.' }
    ]},
    osn: { name: '📺 OSN+', problems: [
        { id: 'osn_1', btn: '🔐 كود الدخول لا يصل للموبايل', title: 'عدم وصول كود الدخول', steps: '1. يرجى التواصل مع الدعم فوراً.' },
        { id: 'osn_2', btn: '🌐 الترجمة غير متطابقة', title: 'مشكلة الترجمة واللغة في OSN+', steps: '1. اضغط على علامة (CC) واختر العربية.' },
        { id: 'osn_3', btn: '🔄 الحساب معلق', title: 'الحساب معلق', steps: '1. يرجى إرسال لقطة شاشة للدعم.' }
    ]},
    disney: { name: '🏰 Disney+', problems: [
        { id: 'dis_1', btn: '🔐 الحساب مغلق', title: 'الحساب مغلق', steps: '1. انتظر 10 دقائق ثم جرب مرة أخرى.' },
        { id: 'dis_2', btn: '🌐 الترجمة العربية مفقودة', title: 'اختفاء الترجمة في ديزني', steps: '1. من إعدادات الفيديو (Audio/Subtitles) اختر العربية.' },
        { id: 'dis_3', btn: '🚫 المحتوى غير متوفر', title: 'رسالة المحتوى غير متوفر', steps: '1. تأكد من إغلاق الـ VPN.' }
    ]}
};

// ==========================================
// معالجة الأوامر والرسائل (هذا الجزء يصحح مشكلة التوقف)
// ==========================================
bot.start((ctx) => {
    ctx.reply("👋 أهلاً بك في Ustern! اختر قسماً:", Markup.inlineKeyboard([
        [Markup.button.callback('❓ حلول المشاكل', 'faq')],
        [Markup.button.callback('🎧 تحدث مع الدعم', 'human_support')]
    ]));
});

bot.action('faq', (ctx) => {
    const buttons = Object.keys(productsData).map(key => [Markup.button.callback(productsData[key].name, 'prod_' + key)]);
    ctx.editMessageText("اختر المنتج:", Markup.inlineKeyboard([...buttons, [Markup.button.callback('🔙 رجوع', 'back_home')]]));
});

// المنطق الأساسي للرد (تم دمج كل شيء هنا لضمان الاستجابة)
bot.on('message', async (ctx) => {
    // 1. التعامل مع رسائل الموظف في الجروب
    if (ctx.chat.id.toString() === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const text = ctx.message.reply_to_message.text;
        const match = text.match(/ID: (\d+)/);
        if (match) {
            await bot.telegram.sendMessage(match[1], `🎧 رد الدعم: ${ctx.message.text}`);
            ctx.reply("✅ تم الرد على العميل.");
        }
    }
    // 2. التعامل مع رسائل العميل (إذا كان في حالة دعم)
    else if (activeTickets.has(ctx.from?.id)) {
        await bot.telegram.sendMessage(SUPPORT_GROUP_ID, `📩 رسالة من: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}\n📝: ${ctx.message.text}\n\n(رد بـ Reply)`);
        ctx.reply("✅ تم إرسال رسالتك لفريق الدعم.");
    }
});

bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { status: 'waiting' });
    ctx.reply("🎯 اكتب مشكلتك الآن وسيرد عليك موظف.");
});

bot.launch().then(() => console.log("Bot running..."));

// سيرفر صغير لـ Railway
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000);
