const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8892358205:AAHVe-QrqCVc5yZAUpNGUWbfm6hhQJd7SE4');
const SUPPORT_GROUP_ID = '-1003902142304';
const activeTickets = new Map();

// تنظيف النصوص لمنع الأكواد
const sanitize = (text) => text.replace(/<[^>]*>?/gm, '').replace('---رد بـ Reply للرد---', '');

// قاعدة البيانات (كما طلبت تماماً)
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

// الرد على الرسائل وتحديث التذاكر
bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id.toString();
    const userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userMsg = sanitize(ctx.message.text || 'إرفاق ملف');

    // 1. العميل يرسل (تحديث نفس الرسالة)
    if (activeTickets.has(userId) && chatId !== SUPPORT_GROUP_ID) {
        const ticket = activeTickets.get(userId);
        
        if (!ticket.msgId) {
            const text = `📩 تذكرة رقم: 1001\n🆔 ID: ${userId}\n👤 العميل: ${userName}\n\n👤 ${userName}: ${userMsg}\n\n---رد بـ Reply للرد---`;
            const msg = await bot.telegram.sendMessage(SUPPORT_GROUP_ID, text);
            activeTickets.set(userId, { ...ticket, msgId: msg.message_id });
        } else {
            // جلب الرسالة الحالية وتعديلها
            const msg = await bot.telegram.getMessage(SUPPORT_GROUP_ID, ticket.msgId);
            const newText = msg.text.replace(/\n---رد بـ Reply للرد---/, '') + `\n👤 ${userName}: ${userMsg}\n\n---رد بـ Reply للرد---`;
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, ticket.msgId, null, newText).catch(() => {});
        }
        ctx.reply("✅ تم إرسال رسالتك.");
    }
    // 2. الموظف يرد (تحديث نفس الرسالة)
    else if (chatId === SUPPORT_GROUP_ID && ctx.message.reply_to_message) {
        const reply = ctx.message.reply_to_message;
        const match = reply.text.match(/ID:\s*(\d+)/);
        if (match) {
            await bot.telegram.sendMessage(match[1], `🎧 الدعم: ${userMsg}`);
            const newText = reply.text.replace(/\n---رد بـ Reply للرد---/, '') + `\n🎧 الدعم: ${userMsg}\n\n---رد بـ Reply للرد---`;
            await bot.telegram.editMessageText(SUPPORT_GROUP_ID, reply.message_id, null, newText).catch(() => {});
        }
    }
});

// تفعيل الأوامر
bot.start((ctx) => ctx.reply('مرحباً، اختر قسماً:', Markup.inlineKeyboard([
    [Markup.button.callback('❓ حلول المشاكل', 'faq')],
    [Markup.button.callback('🛒 الأسعار', 'prices')]
])));

bot.action('human_support', (ctx) => {
    activeTickets.set(ctx.from.id, { msgId: null });
    ctx.reply("🎯 اكتب رسالتك للدعم:");
});

bot.launch();
