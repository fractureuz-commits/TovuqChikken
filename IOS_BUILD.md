# iOS build qilish

Bu loyiha Capacitor iOS platformasi bilan tayyorlangan. Windows'da web build va `ios/` projectni sync qilish mumkin, lekin `.ipa` yaratish va iPhone'ga o'rnatiladigan qilib imzolash uchun macOS + Xcode kerak.

## Windows yoki Mac'da sync

```bash
npm install
npm run ios:sync
```

## Mac'da Xcode ochish

```bash
npm run ios:open
```

Xcode ochilgach:

1. `App` targetni tanlang.
2. `Signing & Capabilities` ichida Apple Developer Team tanlang.
3. `Bundle Identifier` unikalligini tekshiring.
4. Real iPhone ulangan bo'lsa `Run` bilan test qiling.
5. Tarqatish uchun `Product > Archive` qiling.
6. `Distribute App` orqali `TestFlight`, `Ad Hoc` yoki `Enterprise` usulini tanlang.

## Telegram orqali tarqatish haqida

iOS Android kabi oddiy `.apk` faylni bosib o'rnatishga ruxsat bermaydi. Telegramga `.ipa` tashlashning o'zi foydalanuvchi telefoniga app o'rnatib bermaydi.

Ishlaydigan yo'llar:

- `TestFlight`: eng toza va xavfsiz yo'l.
- `Ad Hoc`: har bir iPhone UDID ro'yxatga kiritiladi, keyin signed `.ipa` beriladi.
- `Enterprise/MDM`: tashkilot ichida tarqatish uchun.

## Qo'shilgan iOS ruxsatlari

- Kamera: QR va shtrix kod skanerlash uchun.
- Lokatsiya: mijoz joylashuvini saqlash uchun.
- Local/http networking: lokal server IP bilan ishlashi uchun.
