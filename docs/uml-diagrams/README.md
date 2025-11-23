# UML Діаграми для проекту "Pet Connect"

Цей каталог містить повний набір UML діаграм для системи "Pet Connect" - клієнт-серверної платформи для догляду за домашніми тваринами.

## Структура файлів

```
docs/uml-diagrams/
├── README.md                    # Цей файл з інструкціями
├── ЗВІТ_ППС.md                  # Детальний звіт по всіх діаграмах
├── diagrams/                    # Вихідні файли PlantUML
│   ├── styles.puml              # Загальні стилі та теми
│   ├── 01-use-case.puml         # Use Case Diagram
│   ├── 02-deployment.puml       # Deployment Diagram
│   ├── 03-statechart.puml       # Statechart Diagram
│   ├── 04-activity.puml         # Activity Diagram
│   ├── 05-interaction.puml      # Interaction Diagram
│   ├── 06-sequence.puml         # Sequence Diagram
│   ├── 07-collaboration.puml    # Collaboration Diagram
│   ├── 08-class.puml            # Class Diagram
│   └── 09-component.puml        # Component Diagram
└── images/                      # Згенеровані зображення (створити окремо)
    ├── 01-use-case.png
    ├── 02-deployment.png
    └── ...
```

## Генерація діаграм

### Онлайн-генератор (рекомендовано)

1. Перейдіть на [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
2. Скопіюйте вміст будь-якого `.puml` файлу
3. Вставте в онлайн-редактор
4. Діаграма згенерується автоматично

### Локальна генерація

```bash
# Встановіть PlantUML
# Для Windows: завантажте з https://plantuml.com/download
# Для Linux/Mac: використовуйте пакетний менеджер

# Генерація PNG
plantuml diagrams/01-use-case.puml

# Генерація всіх діаграм
plantuml "diagrams/*.puml"
```

### Visual Studio Code

1. Встановіть розширення "PlantUML"
2. Відкрийте будь-який `.puml` файл
3. Використовуйте команду "PlantUML: Preview Current Diagram"

## Огляд діаграм

### 1. Use Case Diagram (01-use-case.puml)
- **Тема:** Блакитна
- **Опис:** Показує всіх акторів системи та їх взаємодію з функціональністю
- **Актори:** Гість, Клієнт, Менеджер, Адміністратор, Власник тварини (Mobile)
- **Ключові use cases:** Реєстрація, управління товарами, оформлення замовлень, створення нагадувань

### 2. Deployment Diagram (02-deployment.puml)
- **Тема:** Зелена
- **Опис:** Фізичне розгортання компонентів системи
- **Компоненти:** Клієнтські додатки, мікросервіси, бази даних, кеш, message queue
- **Інфраструктура:** Docker, Kubernetes, Nginx

### 3. Statechart Diagram (03-statechart.puml)
- **Тема:** Оранжева
- **Опис:** Стани замовлення та переходи між ними
- **Стани:** Draft → Submitted → AwaitingValidation → StockConfirmed → Paid → Shipped → Cancelled
- **Бізнес-логіка:** Автоматичні та ручні переходи

### 4. Activity Diagram (04-activity.puml)
- **Тема:** Фіолетова
- **Опис:** Процес оформлення замовлення від початку до кінця
- **Процеси:** Додавання товарів, валідація, оплата, виконання
- **Рішення:** Умовні переходи при помилках

### 5. Interaction Diagram (05-interaction.puml)
- **Тема:** Сіра
- **Опис:** Загальна картина взаємодії між компонентами системи
- **Компоненти:** Мікросервіси, інфраструктура, зовнішні сервіси
- **Зв'язки:** REST API, gRPC, Event Bus, Database connections

### 6. Sequence Diagram (06-sequence.puml)
- **Тема:** Бірюзова
- **Опис:** Послідовність створення замовлення з кошика
- **Учасники:** Клієнт → Store Web → Basket API → Ordering API → Catalog API → Payment Gateway
- **Часова послідовність:** Синхронні та асинхронні виклики

### 7. Collaboration Diagram (07-collaboration.puml)
- **Тема:** Коричнева
- **Опис:** Об'єктно-орієнтований погляд на взаємодію при обробці замовлення
- **Об'єкти:** Сервіси, репозиторії, кеш, база даних
- **Повідомлення:** Нумерація викликів методів

### 8. Class Diagram (08-class.puml)
- **Тема:** Синя
- **Опис:** Доменні моделі системи з відносинами
- **Класи:** Item, Brand, Category, Order, OrderItem, Buyer, Address
- **Відносини:** Наслідування, агрегація, асоціація

### 9. Component Diagram (09-component.puml)
- **Тема:** Рожева
- **Опис:** Мікросервіси як компоненти та їх залежності
- **Компоненти:** Catalog API, Basket API, Ordering API, Subscription API
- **Інтерфейси:** REST API, gRPC, Event Bus API, Database API

## Кольорові теми

Кожна діаграма має унікальну кольорову тему для кращої візуальної ідентифікації:

- **Блакитна:** Use Case - користувачі та їх взаємодія
- **Зелена:** Deployment - інфраструктура та розгортання
- **Оранжева:** Statechart - стани та переходи
- **Фіолетова:** Activity - процеси та дії
- **Сіра:** Interaction - загальна взаємодія
- **Бірюзова:** Sequence - послідовність викликів
- **Коричнева:** Collaboration - об'єктна взаємодія
- **Синя:** Class - структура даних
- **Рожева:** Component - архітектура компонентів

## Програмні ресурси

- **PlantUML:** Інструмент для створення UML діаграм з текстових описів
- **Visual Studio Code + PlantUML extension:** IDE для розробки та попереднього перегляду
- **PlantUML Online Server:** Безкоштовний онлайн-генератор діаграм

## Автори

Створено в рамках практичної роботи №6 з дисципліни "Проектування програмних систем":

- Харишин Ігор
- Швачка Денис
- Тугай Анастасія
- Шандрик Андрій
- Рафіков Рінат

