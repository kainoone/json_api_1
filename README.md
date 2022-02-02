# JSON API Readme ru
## Инструкция на русском

#### Методы API

#### 1. Получение списка объявлений
  ###### 1.1 Получение стнаницы без сортировки
Для получения списка объявлений, необходимо отправить __GET__ запрос формата:
__"[адрес]:[порт]/api/page/[номер нужной страницы]"__
Адрес и порт по умолчанию: _localhost:3001_
_Пример:_
```
GET: localhost:3001/api/page/1
```
Ответом сервера будет текст в формате JSON, содержащий в поле "data" массив из 10-ти объявлений, соответсвующих странице, без учета сортировки.

```
{
    "response": "give page",
    "posts count": 10,
    "page": 1,
    "data": [
        {
            "title": "New test post",
            "price": 1001,
            "main_photo": "sdfsafsf"
        },..    
    ],
    "info": {
        "total posts count": 21,
        "total pages count": 3
    }
}
```

В случае некоректного запроса будет возвращено сообщение об ошибке. В зависимости от ошибки.
```
{
    "status": "error!",
    "message": "Page 5 is no found! Base has 3 pages",
    "info": {
        "total posts count": 21,
        "total pages count": 3
    }
}
```

  ###### 1.2 Использование сортировки

Для использования сортировки, в конце запроса нужно добавить __два обязательных query параметра__ ___"sort"___ и ___"direction"___ .
```
GET: localhost:3001/api/page/1?sort=price&direction=up
```
  * ___sort___ – отвечает за тип сортировки и может принимать 2 параметра: ___"price"___ – _"сортировка по цене"_ или ___"date"___ – _"сортировка по времени создания"_ .
  * ___direction___ – отвечает за направление выдачи сортировки. Имеет 2 возможных параметра: ___"up"___ – _"по возрастанию"_ и  ___"down"___ – _"по убыванию"_

  ```
  GET: localhost:3001/api/page/2?sort=date&direction=down

  GET: localhost:3001/api/page/3?sort=price&direction=up
  ```
  Ответом сервера будет текст в формате JSON, содержащий в поле "data" массив из 10-ти объявлений, соответсвующих странице, с учётом сортировки.

  ___Примечание:___
    _"На крайней странице может быть меньше 10-ти объявлений. Поэтому, количество полученых позиций всегда можно узнать с помощью поля "posts count"_

  ```
  {
    "status": "give sort page",
    "posts count": 1,
    "sort": "price up",
    "page": 3,
    "data": [
        {
            "title": "New test post 4",
            "price": 2305,
            "main_photo": "sdfsafsf"
        }
    ],
    "info": {
        "total posts count": 21,
        "total pages count": 3
    }
}
  ```

  ###### 1.3 Получение быстрой информации

  Для быстрого получения общего количества объявлений и страниц можно отправть __GET__ запрос по адресу: __"[адрес]:[порт]/api/info"__
  ```
  GET: localhost:3001/api/info
  ```
  Сервер вернёт json объект содержащий общее количество записей и страниц в коллекции.

  ```
  {
    "info": {
        "total posts count": 21,
        "total pages count": 3
    }
  }
  ```
#### 2. Получение одного объявления по ID

###### 2.1 Получение базовых полей

Для получения одного объявления по его ID, необходимо отправить __GET__ запрос формата __"[адрес]:[порт]/api/one[ID нужного объявления]"__ .

_Пример:_
```
GET: localhost:3001/api/one/61f97528aad8390498e03955
```
_Стандартный ответ содержит базовыве поля (заголовок, ссылка на главное фото, цена):_

```
{
    "title": "New test post 4",
    "price": 2305,
    "main_photo": "sdfsafsf"
}
```

>___Примечание:___
    _"ID объявления можно получить при создании публикации. Подробнее в разделе №3"_
    _"Отображение поля "id" в выдаче списка, можно включить, изменив значение \_id:0 на \_id:1 в объекте "db_filter" в начале файла server.js"_
    

###### 2.1 Получение дополнительных полей

С помощью передачи _query параметров_ ___"fields"___ можно получить два дополнительных поля: _"описание"_ – ___"fields=description"___ и _"ссылки на все фото"_ – ___"fields=photo_links"___ .

Параметры можно использовать как вместе:
```
GET: localhost:3001/api/one/61f97528aad8390498e03955?fields=description&fields=photo_links
```
_ответ:_
```
{
    "title": "New test post 4",
    "description": "main description for test article 2",
    "photo_links": [
        "sdfsafsf",
        "rerafdsf",
        "fdsfasdf"
    ],
    "price": 2305,
    "main_photo": "sdfsafsf"
}
```
так и по отдельности:
```
GET: localhost:3001/api/one/61f97528aad8390498e03955?fields=description
```
```
{
    "title": "New test post 4",
    "description": "main description for test article 2",
    "price": 2305,
    "main_photo": "sdfsafsf"
}
```
```
GET: localhost:3001/api/one/61f97528aad8390498e03955?fields=photo_links
```
```
{
    "title": "New test post 4",
    "photo_links": [
        "sdfsafsf",
        "rerafdsf",
        "fdsfasdf"
    ],
    "price": 2305,
    "main_photo": "sdfsafsf"
}
```
#### 3. Создание объявления

Для создания объявления необходимо отправить __POST__ запрос на адрес формата __"[адрес]:[порт]/api/create"__ с телом запроса в формате JSON, содержащим объект будущего объявления.
_запрос:_
```
POST: localhost:3001/api/create
```
_тело запроса:_
```
{
    "title": "New publication title",
    "description": "Publication description",
    "photo_links": ["asdfasdfasdf","asdfasdf","dfsfadfsdf"], 
    "price":1770
}
```
Тело запроса должно обязательно содержать те же поля что в примере:
* ___title___: _Заголовок объявления (лимит 200 символов)_;
* ___description___: _Описание(лимит 1000 символов)_;
* ___photo_links___: _Массив ссылок на фото(максимум 3 эллемета)_;
* ___price___: _Цена_; 

После успешного прохождения валидации на сервере, объявление добавляется в базу данных, а клиету возвращается JSON объект со статусом и ID новой публикации.

```
{
    "status": "Publication created successfully",
    "id": "61faafb2d750770eec1d42df"
}
```
В случае некоректного тела запроса возвращается объект с сообщением об ошибках.

```
{
    "status": "reject",
    "message": "Invalid keys in object"
}
```
```
{
    "status": "reject",
    "message": "Wrong number of properties"
}
```
```
{
    "status": "reject",
    "message": "Dont valid! Errors Object title is long. Limit 200"
}
```