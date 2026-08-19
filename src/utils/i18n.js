import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

export const LANGUAGE_STORAGE_KEY = "app_language";

export const LANGUAGE_OPTIONS = [
    { code: "uz", label: "O'zbekcha" },
    { code: "ru", label: "Ruscha" },
];

const SUPPORTED_LANGUAGES = new Set(LANGUAGE_OPTIONS.map(item => item.code));

const ru = {
    "✖ Yopish": "✖ Закрыть",
    "📦 Yuklanmoqda...": "📦 Загрузка...",
    "1C dan bo'sh ma'lumot keldi. Barcha ma'lumotlar o'chirildi.": "Из 1C пришли пустые данные. Все данные удалены.",
    "1C dan xato javob keldi.": "Из 1C пришел ошибочный ответ.",
    "Ayol": "Женщина",
    "Backenddan xato javob keldi.": "С backend пришел ошибочный ответ.",
    "Bank val:": "Банк вал.:",
    "Bank:": "Банк:",
    "Barcha ma'lumotlar o'chirildi. Qayta yangilang.": "Все данные удалены. Обновите заново.",
    "Barchasidan qidirish...": "Поиск по всем...",
    "Batafsil": "Подробно",
    "Bekor": "Отмена",
    "Bekor qilish": "Отменить",
    "BEKOR QILISH": "ОТМЕНИТЬ",
    "Bir nechtasini tanlash": "Выбрать несколько",
    "Biror nima yozing": "Введите что-нибудь",
    "BOK": "БОК",
    "Bosing va skanerlang": "Нажмите и сканируйте",
    "Bu amalni bajarishga sizda ruxsat mavjud emas": "У вас нет разрешения выполнить это действие",
    "Bu amalni ortga qaytarib bo'lmaydi!": "Это действие нельзя отменить!",
    "Bu amalni ortga qaytarib bo‘lmaydi!": "Это действие нельзя отменить!",
    "Bu bo‘limni ko‘rishga sizda ruxsat yo‘q": "У вас нет доступа к просмотру этого раздела",
    "Buyurtma berish": "Оформить заказ",
    "Buyurtma yuborildi va saqlandi": "Заказ отправлен и сохранен",
    "Buyurtmalar tarixi": "История заказов",
    "Buyurtmani yopish": "Закрыть заказ",
    "BUYURTMA": "ЗАКАЗ",
    "BUYURTMANI YOPISH": "ЗАКРЫТЬ ЗАКАЗ",
    "Click ( $ → So'm ):": "Click ($ → сум):",
    "Click:": "Click (платеж):",
    "Chiqish": "Выход",
    "Chiqishni xohlaysizmi?": "Хотите выйти?",
    "Chiqsangiz, saqlangan buyurtma ma’lumotlari o‘chiriladi.": "Если выйдете, сохраненные данные заказа будут удалены.",
    "Dasturdan chiqish": "Выйти из программы",
    "Data 1:": "Дата 1:",
    "Data 2:": "Дата 2:",
    "DAVOM ETISH": "ПРОДОЛЖИТЬ",
    "Demo login bosilsa offline demo user, yuk beruvchi, mahsulot turi va mahsulotlar qo'shiladi.": "При нажатии Demo login добавятся offline demo user, поставщик, типы товаров и товары.",
    "Demo user, yuk beruvchi, mahsulot turi va mahsulotlar qo'shildi.": "Demo user, поставщик, типы товаров и товары добавлены.",
    "Dev login tayyor": "Dev login готов",
    "Diller": "Дилер",
    "Dt-Kt ($):": "Дт-Кт ($):",
    "Dt-Kt (so'm):": "Дт-Кт (сум):",
    "Erkak": "Мужчина",
    "Excelga yuklash": "Выгрузить в Excel",
    "Exelga kochirish": "Перенести в Excel",
    "Foydalanuvchi:": "Пользователь:",
    "Foydalanuvchi": "Пользователь",
    "Ha": "Да",
    "Ha, chiqish": "Да, выйти",
    "Ha, to'xtatish": "Да, остановить",
    "Ha, yangilash": "Да, обновить",
    "Ha, o'chirish": "Да, удалить",
    "Ha, o‘chirish": "Да, удалить",
    "Hammasi yuklandi (": "Все загружено (",
    "Harajat": "Расход",
    "Harajat muvaffaqiyatli o'chirildi.": "Расход успешно удален.",
    "Harajat nomi": "Название расхода",
    "Harajat tanlanmagan!": "Расход не выбран!",
    "Harajat turi": "Тип расхода",
    "Harajat turi:": "Тип расхода:",
    "Harajat o'chirilsinmi?": "Удалить расход?",
    "Harajatlar royxati": "Список расходов",
    "Harajatlar ro'yxati": "Список расходов",
    "Harajatlar tarixi": "История расходов",
    "Hech narsa topilmadi": "Ничего не найдено",
    "Hisobotlar": "Отчеты",
    "Hisobotlar (Mahsulot qoldig'i)": "Отчеты (остаток товара)",
    "Hisobotlar (Mijoz qarzdorligi)": "Отчеты (задолженность клиента)",
    "Hisobotlar (MijozSolishtirma ro'yhati)": "Отчеты (акт сверки клиента)",
    "Hisobotlar (Savdo ro'yhati)": "Отчеты (список продаж)",
    "Hisobotlar (Solishtirma dalolatnoma)": "Отчеты (акт сверки)",
    "Hozircha harajat mavjud emas": "Пока расходов нет",
    "Hozircha to'lovlar mavjud emas": "Пока платежей нет",
    "Hudud nomi": "Название региона",
    "Hudud:": "Регион:",
    "Hududni tanlang": "Выберите регион",
    "Iltimos kimligini tekshiring": "Пожалуйста, проверьте кто вошел",
    "Iltimos, mijozni tanlang": "Пожалуйста, выберите клиента",
    "Ilova tili": "Язык приложения",
    "IP saqlandi": "IP сохранен",
    "IP saqlash": "Сохранить IP",
    "Izoh": "Комментарий",
    "Izox:": "Комментарий:",
    "Jami summa dollarda:": "Общая сумма в долларах:",
    "Jami summa so'mda:": "Общая сумма в сумах:",
    "Jami summa:": "Общая сумма:",
    "Jami to'lov :": "Итого оплата:",
    "Jami to'lov:": "Итого оплата:",
    "Jinsi": "Пол",
    "Jinsni tanlang": "Выберите пол",
    "Kafolat": "Гарантия",
    "KIRISH": "ВОЙТИ",
    "Kirish": "Войти",
    "Kirishga ruxsat yo‘q": "Нет доступа",
    "Kod:": "Код:",
    "Korzinka bo'sh": "Корзина пуста",
    "Kurs:": "Курс:",
    "Ko'proq (": "Еще (",
    "Limit to'lgan!": "Лимит заполнен!",
    "Location": "Локация",
    "Location mavjud emas": "Локация отсутствует",
    "Google xarita": "Google карта",
    "Lokatsiya xato:": "Ошибка локации:",
    "Ma'lumot buzilgan!": "Данные повреждены!",
    "Ma'lumot yo'q": "Данных нет",
    "Ma'lumot yo'q!": "Данных нет!",
    "Ma'lumotlarni 1C dan yangilashni xohlaysizmi?": "Хотите обновить данные из 1C?",
    "Mahsulot": "Товар",
    "Mahsulot guruhi:": "Группа товара:",
    "Mahsulot guruhini tanlang": "Выберите группу товара",
    "Mahsulot narxi:": "Цена товара:",
    "Mahsulot qaytarildi": "Товар возвращен",
    "Mahsulot qaytarib olish": "Вернуть товар",
    "Mahsulot qoldigi": "Остаток товара",
    "Mahsulot qoldig'i:": "Остаток товара:",
    "Mahsulot topilmadi": "Товар не найден",
    "Mahsulot:": "Товар:",
    "MahsulotGrouplar royxati": "Список групп товаров",
    "Mahsulotni qaytarish": "Возврат товара",
    "Mahsulotni tanlang": "Выберите товар",
    "Manzil": "Адрес",
    "Mijoz": "Клиент",
    "Mijoz nomi": "Имя клиента",
    "Mijoz nomi:": "Имя клиента:",
    "Mijoz qarzdorligi": "Задолженность клиента",
    "Mijoz saqlandi": "Клиент сохранен",
    "Mijoz tanlanmagan!": "Клиент не выбран!",
    "Mijoz yaratish": "Создать клиента",
    "Mijozlar royxati": "Список клиентов",
    "Mijozni tanlang": "Выберите клиента",
    "Mijoz nomi yoki nomeri": "Имя или номер клиента",
    "Muvaffaqiyatli!": "Успешно!",
    "Muvofaqiyatli!": "Успешно!",
    "Naqd ( $ → So'm ):": "Наличные ($ → сум):",
    "Naqd ( so'm → $ ):": "Наличные (сум → $):",
    "Naqd:": "Наличные:",
    "Narx": "Цена",
    "Next": "Далее",
    "No": "Нет",
    "Nomi": "Название",
    "Nomsiz": "Без названия",
    "Noma'lum harajat": "Неизвестный расход",
    "Noma'lum mijoz": "Неизвестный клиент",
    "Nusxa olish": "Копировать",
    "Ok": "ОК",
    "OK": "ОК",
    "PDF": "PDF файл",
    "Orqaga": "Назад",
    "Other": "Другое",
    "Papka yaratish": "Создать папку",
    "Papkaga kochirish": "Переместить в папку",
    "Parolni kiriting": "Введите пароль",
    "Parol noto'g'ri": "Неверный пароль",
    "Partiya royxati": "Список партий",
    "Partiya:": "Партия:",
    "Partya": "Партия",
    "PINni tasdiqlang": "Подтвердите PIN",
    "Plastik ( $ → So'm ):": "Пластик ($ → сум):",
    "Plastik:": "Пластик:",
    "Prev": "Назад",
    "Profil": "Профиль",
    "Qarzdorlik": "Задолженность",
    "Qaytarish": "Возврат",
    "Qaytarish ro‘yxati": "Список возвратов",
    "Qidirish (ctrl + spase)": "Поиск (ctrl + пробел)",
    "Qidirish...": "Поиск...",
    "Qoldiq": "Остаток",
    "Qoshish": "Добавить",
    "QR kodni ramkaga to'g'rilang": "Поместите QR-код в рамку",
    "QR yoki shtrix kodni ramkaga to'g'rilang": "Поместите QR или штрих-код в рамку",
    "Qo'shildi!": "Добавлено!",
    "Qo'shish": "Добавить",
    "Regionlar royxati": "Список регионов",
    "Ruscha": "Русский",
    "Ruxsat yo‘q": "Нет разрешения",
    "Sana:": "Дата:",
    "Sanaga:": "На дату:",
    "Saqlandi!": "Сохранено!",
    "Saqlash": "Сохранить",
    "SAQLASH": "СОХРАНИТЬ",
    "SAQLANMOQDA...": "СОХРАНЯЕТСЯ...",
    "SAVATCHA": "КОРЗИНА",
    "Savatcha": "Корзина",
    "Savdo": "Продажа",
    "SAVDO": "ПРОДАЖА",
    "Savdo ro'yhati": "Список продаж",
    "Savdolar ro'yxati": "Список продаж",
    "Server ga ulanib bo'lmadi! WiFi ni tekshiring.": "Не удалось подключиться к серверу! Проверьте Wi-Fi.",
    "Server IP": "IP сервера",
    "Secret parol": "Секретный пароль",
    "Secret sozlamalar": "Секретные настройки",
    "Skaner": "Сканер",
    "Solishtirma dalolatnoma": "Акт сверки",
    "Miqdor": "Количество",
    "Miqdor:": "Количество:",
    "Sotilgan mahsulot miqdori:": "Количество проданного товара:",
    "Sotuvchi": "Продавец",
    "Sozlamalar": "Настройки",
    "So'm": "Сум",
    "SO'M": "СУМ",
    "so'm": "сум",
    "ta natija topildi": "результатов найдено",
    "ta qoldi)": "осталось)",
    "ta)": "шт.)",
    "Tahrirlandi!": "Изменено!",
    "Tahrirlash": "Изменить",
    "Tanlangan": "Выбрано",
    "Tel 1": "Тел. 1",
    "Tel 2": "Тел. 2",
    "Tekshirilmoqda...": "Проверяется...",
    "Telefon raqami": "Номер телефона",
    "Telefon raqami 2": "Номер телефона 2",
    "Til": "Язык",
    "Til sozlamalari": "Настройки языка",
    "Tolovlar tarixi": "История платежей",
    "To'lov": "Оплата",
    "To’lov": "Оплата",
    "To‘lov muvaffaqiyatli o‘chirildi.": "Платеж успешно удален.",
    "To‘lov o‘chirilsinmi?": "Удалить платеж?",
    "To‘lovlar va harajatlar serverga yuboriladi": "Платежи и расходы будут отправлены на сервер",
    "To'xtatildi": "Остановлено",
    "To'xtatish": "Остановить",
    "Tovarlar": "Товары",
    "Tovarlar guruhi": "Группы товаров",
    "Tovarlar ro‘yxati": "Список товаров",
    "Tug'ilgan sana": "Дата рождения",
    "Ulanish xatosi!": "Ошибка подключения!",
    "Ulushi": "Доля",
    "Umumiy": "Общий",
    "UMUMIY": "ОБЩИЙ",
    "Valyuta": "Валюта",
    "Viloyat": "Область",
    "Xato!": "Ошибка!",
    "Xatolik!": "Ошибка!",
    "Xatolik:": "Ошибка:",
    "Xisobot": "Отчет",
    "Yana bir foydalanuvchi tizimga kirdi": "В систему вошел другой пользователь",
    "Yangi mijoz qo’shish": "Добавить нового клиента",
    "Yangilandi!": "Обновлено!",
    "Yangilash": "Обновить",
    "Yangi PIN o'rnating": "Установите новый PIN",
    "Yaroqlilik muddati:": "Срок годности:",
    "Yaroqlilik Muddati:": "Срок годности:",
    "Yetarli mahsulot yo'q!": "Недостаточно товара!",
    "Yonilg‘i turlari": "Типы топлива",
    "Yuboriladigan amallar yoq!": "Нет действий для отправки!",
    "Yuborildi!": "Отправлено!",
    "Yuborilmagan to'lovlar": "Неотправленные платежи",
    "Yuborilmagan to'lovlar ro'yxati": "Список неотправленных платежей",
    "Yuborilmagan xarajatlar": "Неотправленные расходы",
    "Yuborilmoqda...": "Отправка...",
    "YUBORILMOQDA...": "ОТПРАВЛЯЕТСЯ...",
    "Yuborish": "Отправить",
    "YUBORISH": "ОТПРАВИТЬ",
    "Yuborishni hohlaysizmi?": "Хотите отправить?",
    "Yuklanishni to'xtatishni xohlaysizmi?": "Хотите остановить загрузку?",
    "Yuklanmoqda...": "Загрузка...",
    "Yuklash": "Загрузить",
    "Yopish": "Закрыть",
    "Yo'q": "Нет",
    "Yo‘q": "Нет",
    "Yo'q, davom etsin": "Нет, продолжить",
    "Shahar": "Город",
    "O'zbekcha": "Узбекский",
    "O'zgartirish": "Изменить",
    "O'chirildi!": "Удалено!",
    "O‘chirildi!": "Удалено!",
    "O'chirilsinmi?": "Удалить?",
    "O'chirish": "Удалить",
    "Add": "Добавить",
    "Add to Home Screen": "Добавить на экран Домой",
    "Allaqachon qo'shilgan": "Уже добавлено",
    "Brauzer menyusidan Install app yoki Add to Home Screen ni tanlang.": "Выберите Install app или Add to Home Screen в меню браузера.",
    "Bosh menu": "Главное меню",
    "Буюртма": "Заказ",
    "Dashboard": "Панель",
    "Dev login": "Dev вход",
    "Excel fayl yaratishda xato yuz berdi": "Ошибка при создании файла Excel",
    "Harajatlar yuklanmoqda...": "Расходы загружаются...",
    "Havolani Safari'da oching.": "Откройте ссылку в Safari.",
    "Hozircha savdolar mavjud emas": "Пока продаж нет",
    "Hududlar": "Регионы",
    "Hududlar yuklanmoqda...": "Регионы загружаются...",
    "Install app": "Установить приложение",
    "iOS ga o'rnatish": "Установка на iOS",
    "iOS ilovani avtomatik o'rnatishga ruxsat bermaydi.": "iOS не позволяет установить приложение автоматически.",
    "iPhone ga qo'shish": "Добавить на iPhone",
    "iPhone/iPad uchun saytni Safari'da ochish kerak.": "Для iPhone/iPad сайт нужно открыть в Safari.",
    "Ilovani o'rnatish": "Установить приложение",
    "Kurs yuklanmoqda...": "Курс загружается...",
    "Lorem ipsum dolor sit amet.": "",
    "Ma'lumotlar backenddan olinmoqda...": "Данные загружаются с backend...",
    "Mahsulot guruhlari": "Группы товаров",
    "Mahsulot guruhlari yuklanmoqda...": "Группы товаров загружаются...",
    "Mijozlar": "Клиенты",
    "Mijozlar yuklanmoqda...": "Клиенты загружаются...",
    "Partiya topilmadi": "Партия не найдена",
    "Pastdagi ulashish belgisini bosing.": "Нажмите значок поделиться внизу.",
    "Qaytarish ro'yxati topilmadi": "Список возвратов не найден",
    "Qo'shimcha ma'lumotlar saqlanmoqda...": "Дополнительные данные сохраняются...",
    "Route xatosi": "Ошибка маршрута",
    "Savdo muvaffaqiyatli o'chirildi.": "Продажа успешно удалена.",
    "Savdo o'chirilsinmi?": "Удалить продажу?",
    "Savdo yuborilmagan savdolarga qo'shildi": "Продажа добавлена в неотправленные продажи",
    "Savdolar, to'lovlar va harajatlar serverga yuboriladi": "Продажи, платежи и расходы будут отправлены на сервер",
    "Savdoni saqlash": "Сохранить продажу",
    "Serverga yuborilmoqda...": "Отправка на сервер...",
    "Server IP yoki domen": "IP или домен сервера",
    "192.168.1.103 yoki api.domain.uz": "192.168.1.103 или api.domain.uz",
    "Chiqsangiz, saqlangan buyurtma ma'lumotlari o'chiriladi.": "Если выйдете, сохраненные данные заказа будут удалены.",
    "Tushunarli": "Понятно",
    "Tovarlar yuklanmoqda...": "Товары загружаются...",
    "Тўлов": "Оплата",
    "Ulashish belgisi ->": "Значок поделиться ->",
    "Xodimlar": "Сотрудники",
    "Xodimlar yuklanmoqda...": "Сотрудники загружаются...",
    "Yaroqlilik muddati": "Срок годности",
    "Yordam": "Помощь",
    "Янгилаш": "Обновить",
    "Yuborilmagan savdolar": "Неотправленные продажи",
    "Yuborilmagan savdolar ro'yxati": "Список неотправленных продаж",
    "Yuklash yakunlandi": "Загрузка завершена",
    "Вазврат": "Возврат",
    "Жўнатиш": "Отправить",
    "Хисобот": "Отчет",
    "ta mahsulot": "товаров",
    "tugmasini bosing.": "нажмите кнопку.",
    "ni tanlang.": "выберите.",
    "Eski ma'lumotlar o'chirilmoqda...": "Старые данные удаляются...",
    "Yangi ta'minotchi qo’shish": "Добавить нового поставщика",
    "Yuk beruvchi": "Поставщик",
    "KIRIM": "ПРИХОД",
    "Yaratish": "Создать",
    "Mijozlar ro'yxati": "Список клиентов",
    "Invoyslar ro'yxati": "Список накладных",
    "Yangi invoys yaratish": "Создать новую накладную",
    "Bu ta'minotchi uchun invoys topilmadi": "Для этого поставщика накладные не найдены",
    "Yopiq": "Закрыта",
    "Ochiq": "Открыта",
    "Invoys raqami kiritilmagan!": "Номер накладной не введен!",
    "Ta'minotchi": "Поставщик",
    "Invoys raqami": "Номер накладной",
    "Sana": "Дата",
    "Saqlanmoqda...": "Сохраняется...",
    "Ta'minotchi tanlanmagan!": "Поставщик не выбран!",
    "Iltimos, ta'minotchini tanlang": "Пожалуйста, выберите поставщика",
    "Mahsulot kirimi": "Приход товара",
    "Ta'minotchi nomi": "Название поставщика",
    "Invoys": "Накладная",
    "Ta'minotchilar ro'yxati": "Список поставщиков",
    "Mahsulot nomi kiritilmagan!": "Название товара не введено!",
    "Mahsulot guruhi tanlanmagan!": "Группа товара не выбрана!",
    "Mahsulot yaratildi!": "Товар создан!",
    "Yangi mahsulot yaratish": "Создать новый товар",
    "Mahsulot nomi": "Название товара",
    "Mahsulot nomini kiriting": "Введите название товара",
    "Mahsulot guruhi": "Группа товара",
    "Guruhni tanlang": "Выберите группу",
    "Mijoz tanlash": "Выбор клиента",
    "Kirim narxini kiriting!": "Введите закупочную цену!",
    "Yaroqlilik muddatini kiriting!": "Введите срок годности!",
    "Kirim narxi:": "Закупочная цена:",
    "Miqdori (": "Количество (",
    "QO'SHISH": "ДОБАВИТЬ",
    "Mahsulot kirimini yuborish": "Отправить приход товара",
    "Mahsulot kirimi yuborildi": "Приход товара отправлен",
    "Kirim savati": "Корзина прихода",
    "Mahsulot yaratish": "Создать товар",
    "Backend JSON qaytarmadi. Server manzil yoki endpointni tekshiring.": "Backend не вернул JSON. Проверьте адрес сервера или endpoint.",
    "Kontragent": "Контрагент",

    // Qo'shimcha tarjimalar (i18n audit)
    "To'lovlar serverga yuborilmoqda...": "Платежи отправляются на сервер...",
    "Xarajatlar serverga yuborilmoqda...": "Расходы отправляются на сервер...",
    "Savdolar serverga yuborilmoqda...": "Продажи отправляются на сервер...",
    "Yuborilmagan ma'lumotlar yuborilmoqda...": "Неотправленные данные отправляются...",
    "Yangi ma'lumotlar yuklab olinmoqda...": "Новые данные загружаются...",
    "Boshlang’ich qoldiq": "Начальный остаток",
    "Boshlang'ich qoldiq": "Начальный остаток",
    "Tugmani suring yoki burchagidan cho'zing": "Перетащите кнопку или растяните за угол",
    "Standart": "Стандарт",
    "Tartiblash": "Упорядочить",
    "Tayyor": "Готово",
    "Noma'lum xato": "Неизвестная ошибка",
    "Backenddan bo'sh ma'lumot keldi": "От backend пришли пустые данные",
    "Mahsulot guruhlari saqlanmoqda...": "Группы товаров сохраняются...",
    "Yuklash to'xtatildi": "Загрузка остановлена",
    "Tovarlar saqlanmoqda...": "Товары сохраняются...",
    "Server tasdiqlangan ID qaytarmadi. Queue xavfsizligi uchun ma'lumotlar o'chirilmadi.": "Сервер не вернул подтвержденный ID. Данные не удалены для безопасности очереди.",
    "IP manzil bo'sh bo'lmasin": "IP адрес не должен быть пустым",
    "IP localStoragega saqlanmadi": "IP не сохранился в localStorage",
    "IP localStoragedan qayta o'qilmadi": "IP не удалось повторно прочитать из localStorage",
    "Video elementi topilmadi": "Элемент video не найден",
    "PIN mos kelmadi, qaytadan kiriting": "PIN не совпадает, введите заново",
    "IP yoki domen localStorage.server_address ga saqlanadi. Keyingi backend so'rovlari shu manzilga ketadi.": "IP или домен сохраняется в localStorage.server_address. Следующие запросы к backend будут отправляться на этот адрес.",
    "Qisman yangilandi": "Частично обновлено",
    "Kamera ochilmadi. Ruxsatni tekshiring.": "Камера не открылась. Проверьте разрешение.",
    "QOLDIQ": "ОСТАТОК",
    "Internetga ulaning": "Подключитесь к интернету",
    "Internet aloqasi yo'q. Ulanish tiklangach davom etadi.": "Нет подключения к интернету. Продолжится после восстановления соединения.",
    "Guruh nomini kiriting!": "Введите название группы!",
    "Guruh yaratildi!": "Группа создана!",
    "Yangi guruh qo'shish": "Добавить новую группу",
    "Guruh nomi": "Название группы",
    "Guruh nomini kiriting": "Введите название группы",
    "Boshlang'ich qoldiqni yuborish": "Отправить начальный остаток",
    "Boshlang’ich qoldiqni yuborish": "Отправить начальный остаток",
    "Boshlang'ich qoldiq yuborildi": "Начальный остаток отправлен",
    "Boshlang’ich qoldiq yuborildi": "Начальный остаток отправлен",
    "Izoh (ixtiyoriy)...": "Комментарий (необязательно)...",
    "Qoldiq savati": "Корзина остатков",
    "Yaroqlilik muddati (ixtiyoriy):": "Срок годности (необязательно):",
};

const ruPatterns = [
    [/^Ko'proq \((\d+) ta qoldi\)$/u, (_, count) => `Еще (${count} осталось)`],
    [/^(\d+) ta natija topildi$/u, (_, count) => `Найдено результатов: ${count}`],
    [/^(\d+) ta mahsulot saqlandi\.$/u, (_, count) => `Сохранено товаров: ${count}.`],
    [/^(\d+) ta mahsulot yuboriladi$/u, (_, count) => `Будет отправлено товаров: ${count}`],
    [/^(\d+) ta to['‘]lov sinxron qilindi$/u, (_, count) => `Синхронизировано платежей: ${count}`],
    [/^(\d+) ta harajat sinxron qilindi$/u, (_, count) => `Синхронизировано расходов: ${count}`],
    [/^(\d+) ta to['‘]lov, (\d+) ta harajat sinxron qilindi$/u, (_, pay, expense) => `Синхронизировано платежей: ${pay}, расходов: ${expense}`],
    [/^(.+) ta mahsulot saqlandi\.$/u, (_, count) => `Сохранено товаров: ${count}.`],
    [/^(.+) ta mahsulot yuboriladi$/u, (_, count) => `Будет отправлено товаров: ${count}`],
    [/^Yuklanmoqda(\.*)$/u, (_, dots) => `Загрузка${dots}`],
    [/^Yuborilmoqda(\.*)$/u, (_, dots) => `Отправка${dots}`],
    [/^🔒 (\d+) soniyadan so'ng urinib ko'ring$/u, (_, seconds) => `🔒 Попробуйте через ${seconds} секунд`],
    [/^❌ Noto'g'ri parol \((\d+)\/(\d+)\)$/u, (_, attempt, max) => `❌ Неверный пароль (${attempt}/${max})`],
    [/^Noto'g'ri parol \((\d+)\/(\d+)\)$/u, (_, attempt, max) => `Неверный пароль (${attempt}/${max})`],
    [/^Xatolik: (.+)$/u, (_, error) => `Ошибка: ${error}`],
    [/^Miqdor: (.+)$/u, (_, value) => `Количество: ${value}`],
    [/^Kod: (.+)$/u, (_, value) => `Код: ${value}`],
    [/^Hammasi yuklandi \((\d+) ta\)$/u, (_, count) => `Все загружено (${count} шт.)`],
    [/^(.+) yuklanmoqda\.\.\.$/u, (_, label) => `${translateText(label, "ru")} загружается...`],
    [/^(.+) yuklanmadi\.\s*(.*)$/u, (_, label, error) => `${translateText(label, "ru")} не загрузилось. ${error}`.trim()],
    [/^(\d+) ta guruh, (\d+) ta tovar saqlandi\.$/u, (_, groups, products) => `Сохранено групп: ${groups}, товаров: ${products}.`],
    [/^(\d+) ta guruh, (\d+) ta tovar tayyor\. Xato bo'lgan route'lar saqlanmadi\.$/u, (_, groups, products) => `Готово групп: ${groups}, товаров: ${products}. Ошибочные маршруты не сохранены.`],
    [/^(\d+) ta mahsulot yuborilmagan savdolarga qo'shiladi$/u, (_, count) => `Товаров будет добавлено в неотправленные продажи: ${count}`],
    [/^(\d+) ta savdo sinxron qilindi$/u, (_, count) => `Синхронизировано продаж: ${count}`],
    [/^(\d+) ta savdo, (\d+) ta to['‘]lov, (\d+) ta harajat sinxron qilindi$/u, (_, sales, pay, expense) => `Синхронизировано продаж: ${sales}, платежей: ${pay}, расходов: ${expense}`],
    [/^Qoldiq: (.+)$/u, (_, value) => `Остаток: ${value}`],
    [/^Allaqachon qo'shilgan: (.+)\. Qoldiq: (.+)$/u, (_, current, left) => `Уже добавлено: ${current}. Остаток: ${left}`],
    [/^(.+) muvaffaqiyatli qo['‘]shildi$/u, (_, name) => `${name} успешно добавлено`],
    [/^Narx (\d+)$/u, (_, n) => `Цена ${n}`],
    [/^(.+) — invoyslar$/u, (_, name) => `${translateText(name, "ru")} — накладные`],
    [/^HTTP xato: (.+)$/u, (_, status) => `HTTP ошибка: ${status}`],
    [/^Noma['‘]lum endpoint: (.+)$/u, (_, endpoint) => `Неизвестный endpoint: ${endpoint}`],
    [/^(\d+) ta mahsulot kirim sifatida yuboriladi$/u, (_, count) => `Будет отправлено товаров в приход: ${count}`],
    [/^(\d+) ta mahsulot boshlang['‘]ich qoldiq sifatida yuboriladi$/u, (_, count) => `Будет отправлено товаров как начальный остаток: ${count}`],
    [/^IP yoki domen localStorage\.(.+) ga saqlanadi\. Keyingi backend so['‘]rovlari shu manzilga ketadi\.$/u, (_, key) => `IP или домен сохраняется в localStorage.${key}. Следующие запросы к backend будут отправляться на этот адрес.`],
    [/^Xato: ([\s\S]+?)(?: URL: (.+))?$/u, (_, msg, url) => url ? `Ошибка: ${msg}\n\nURL: ${url}` : `Ошибка: ${msg}`],
    [/^(.+) — (.+)$/u, (_, name, value) => `${translateText(name, "ru")} — ${translateText(value, "ru")}`],
    [/^(\d+)-batch yuborilmoqda\.\.\.$/u, (_, n) => `Отправка партии ${n}...`],
    [/^(\d+) ta yuborildi$/u, (_, n) => `Отправлено: ${n}`],
    [/^(.+) localStoragega saqlandi\.$/u, (_, addr) => `${addr} сохранён в localStorage.`],
    [/^(\d+) ta ma['‘]lumot saqlandi\.$/u, (_, count) => `Сохранено данных: ${count}.`],
    [/^1C xato qaytardi: ([\s\S]+)$/u, (_, msg) => `1C вернул ошибку: ${msg}`],
    [/^Kamera ochilmadi: ([\s\S]+)$/u, (_, msg) => `Камера не открылась: ${msg}`],
];

const dictionaries = { ru };
const textNodeOriginals = new WeakMap();
const translatedAttributes = ["placeholder", "aria-label", "title", "alt"];
let observer = null;
let applying = false;

export const getLanguage = () => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(saved) ? saved : "uz";
};

export const setLanguage = (language) => {
    const nextLanguage = SUPPORTED_LANGUAGES.has(language) ? language : "uz";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.dispatchEvent(new CustomEvent("app-language-change", {
        detail: { language: nextLanguage },
    }));
};

const translateCore = (core, language) => {
    if (!core || language === "uz") return core;

    const dictionary = dictionaries[language];
    if (!dictionary) return core;

    if (dictionary[core]) return dictionary[core];

    for (const [regex, replacer] of ruPatterns) {
        const match = core.match(regex);
        if (match) return replacer(...match);
    }

    return core;
};

export const translateText = (value, language = getLanguage()) => {
    const text = String(value ?? "");
    const leading = text.match(/^\s*/u)?.[0] ?? "";
    const trailing = text.match(/\s*$/u)?.[0] ?? "";
    const core = text.trim().replace(/\s+/gu, " ");
    const translated = translateCore(core, language);
    return `${leading}${translated}${trailing}`;
};

const swalTextKeys = new Set([
    "title",
    "titleText",
    "text",
    "confirmButtonText",
    "cancelButtonText",
    "denyButtonText",
    "inputLabel",
    "inputPlaceholder",
    "validationMessage",
    "footer",
]);

const htmlTranslatedAttributes = ["placeholder", "aria-label", "title", "alt"];
let swalTranslatorInstalled = false;
let alertTranslatorInstalled = false;

const translateHtmlString = (html, language) => {
    if (typeof html !== "string") return html;
    if (typeof document === "undefined" || !html.includes("<")) {
        return translateText(html, language);
    }

    const template = document.createElement("template");
    template.innerHTML = html;

    const walker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(node) {
                if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    let node = walker.nextNode();
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = translateText(node.nodeValue, language);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const attr of htmlTranslatedAttributes) {
                if (node.hasAttribute(attr)) {
                    node.setAttribute(attr, translateText(node.getAttribute(attr), language));
                }
            }
        }
        node = walker.nextNode();
    }

    return template.innerHTML;
};

const translateSwalValue = (key, value, language) => {
    if (typeof value !== "string") return value;
    if (key === "html") return translateHtmlString(value, language);
    if (swalTextKeys.has(key)) return translateText(value, language);
    return value;
};

const translateSwalOptions = (options, language = getLanguage()) => {
    if (!options || typeof options !== "object" || Array.isArray(options)) return options;

    const translated = { ...options };

    for (const key of Object.keys(translated)) {
        translated[key] = translateSwalValue(key, translated[key], language);
    }

    const originalDidOpen = translated.didOpen;
    translated.didOpen = (...args) => {
        originalDidOpen?.(...args);
        applyTranslations(args[0] || document.body, language);
    };

    return translated;
};

const installSwalTranslator = () => {
    if (swalTranslatorInstalled || !Swal?.fire) return;
    swalTranslatorInstalled = true;

    const originalFire = Swal.fire.bind(Swal);
    Swal.fire = (...args) => {
        const language = getLanguage();

        if (args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
            return originalFire(translateSwalOptions(args[0], language));
        }

        const translatedArgs = args.map((arg, index) => (
            typeof arg === "string" && index <= 1 ? translateText(arg, language) : arg
        ));

        return originalFire(...translatedArgs);
    };

    if (Swal.showValidationMessage) {
        const originalShowValidationMessage = Swal.showValidationMessage.bind(Swal);
        Swal.showValidationMessage = (message) =>
            originalShowValidationMessage(translateText(message, getLanguage()));
    }
};

const installAlertTranslator = () => {
    if (alertTranslatorInstalled || typeof window === "undefined" || !window.alert) return;
    alertTranslatorInstalled = true;

    const originalAlert = window.alert.bind(window);
    window.alert = (message) => originalAlert(translateText(message, getLanguage()));
};

const attrStoreName = (attr) => `data-i18n-original-${attr.replace(/[^a-z0-9]/gi, "-")}`;

const isKnownTranslationVariant = (original, current) => {
    if (current === original) return true;

    return Object.keys(dictionaries).some(language =>
        current === translateText(original, language)
    );
};

const shouldSkipElement = (element) => {
    if (!element?.tagName) return false;
    if (element.closest("[data-i18n-skip]")) return true;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(element.tagName);
};

const translateTextNode = (node, language) => {
    const current = node.nodeValue;
    let original = textNodeOriginals.get(node);

    if (original === undefined) {
        original = current;
        textNodeOriginals.set(node, original);
    } else if (!isKnownTranslationVariant(original, current)) {
        original = current;
        textNodeOriginals.set(node, original);
    }

    const nextValue = translateText(original, language);
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
};

const translateElementAttributes = (element, language) => {
    for (const attr of translatedAttributes) {
        if (!element.hasAttribute(attr)) continue;

        const storeName = attrStoreName(attr);
        let original = element.getAttribute(storeName);
        const current = element.getAttribute(attr);

        if (original !== null) {
            if (!isKnownTranslationVariant(original, current)) {
                original = current;
            }
        } else {
            original = current;
        }

        if (!element.hasAttribute(storeName)) {
            element.setAttribute(storeName, original);
        } else if (element.getAttribute(storeName) !== original) {
            element.setAttribute(storeName, original);
        }

        const nextValue = translateText(original, language);
        if (element.getAttribute(attr) !== nextValue) {
            element.setAttribute(attr, nextValue);
        }
    }
};

export const applyTranslations = (root = document.body, language = getLanguage()) => {
    if (!root || applying) return;

    applying = true;
    document.documentElement.lang = language;

    try {
        if (root.nodeType === Node.TEXT_NODE) {
            translateTextNode(root, language);
            return;
        }

        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
            return;
        }

        if (root.nodeType === Node.ELEMENT_NODE && shouldSkipElement(root)) return;

        if (root.nodeType === Node.ELEMENT_NODE) {
            translateElementAttributes(root, language);
        }

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && shouldSkipElement(node)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                },
            }
        );

        let node = walker.nextNode();
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                translateTextNode(node, language);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                translateElementAttributes(node, language);
            }
            node = walker.nextNode();
        }
    } finally {
        applying = false;
    }
};

export const setupDomTranslator = () => {
    if (typeof window === "undefined" || observer) return;

    installSwalTranslator();
    installAlertTranslator();

    const root = document.body || document.documentElement;

    const scheduleTranslate = () => {
        if (applying) return;
        window.requestAnimationFrame(() => applyTranslations(document.body || document.documentElement));
    };

    observer = new MutationObserver(scheduleTranslate);
    observer.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: translatedAttributes,
    });

    window.addEventListener("app-language-change", () => {
        applyTranslations(document.body || document.documentElement);
    });

    window.addEventListener("storage", (event) => {
        if (event.key === LANGUAGE_STORAGE_KEY) {
            applyTranslations(document.body || document.documentElement);
        }
    });

    applyTranslations(root);
};

export const useLanguage = () => {
    const [language, setLanguageState] = useState(getLanguage);

    useEffect(() => {
        const handleChange = () => setLanguageState(getLanguage());
        window.addEventListener("app-language-change", handleChange);
        window.addEventListener("storage", handleChange);
        return () => {
            window.removeEventListener("app-language-change", handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, []);

    const changeLanguage = useCallback((nextLanguage) => {
        setLanguage(nextLanguage);
        setLanguageState(getLanguage());
    }, []);

    return { language, setLanguage: changeLanguage };
};
