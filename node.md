**I) Các middleware, comeon, basic để tạo server tốt**

1\. vatidition (check format, lenght, min, max,...)

2\. cách dùng sao cho vatidition dùng 1 lần cho tất cả api cần dùng.

3\. try/casch



**II) Luồng hoạt động**

**1. register, login**

1.1 register (thủ công)

client -> gửi dữ liệu -> server nhận -> kiểm tra (đúng dữ liệu cần, đúng format) ->gửi mail veryti(xác thực, có kèm token tạm thời) -> client kiểm tra veryti(lấy token ở param và gửi lên server) -> server kiểm tra đúng token sẽ cho đăng ký và lưu vào data.

1.2 Register (gg)

1.3 Login (thủ công)

client -> gửi dữ liệu ->server nhận -> kiểm tra (đúng như data, format) -> gửi token về (mess: thành công)

1.4 Login (gg)

**2. Notes**

**2.1 Create notes**

client -> gửi dữ liệu -> server nhận ->authenticate -> kiểm tra(đúng dữ liệu cần, đúng vitidator, file .pdf) ->

* có file -> gửi file lên cloudinary -> nhận file url và public -> đem file đó dịch ra và đưa lên gemini(tạo quiz) -> lưu vào data(note, flashcards)
* có content -> đem content cho gemini(tạo quiz) -> lưu vào data(note, flashcards)

**2.2 Get all Note (1 user)**

client -> server -> authenticate -> check (có user\_id) -> resutl.data

**2.3 Get 1 Note**

client -> server -> authenticate -> check (có note\_id) -> resutl.data

**2.4 Update notes**

client -> gửi dữ liệu -> server nhận ->authenticate -> kiểm tra(đúng dữ liệu cần, đúng vitidator, file .pdf) ->

* có file -> gửi file lên cloudinary -> nhận file url và public -> đem file đó dịch ra và đưa lên gemini(tạo quiz) -> update vào data(note, flashcards)
* có content -> đem content cho gemini(tạo quiz) -> update vào data(note, flashcards)
* 
**2.5 Delete notes**

client -> event -> server nhận -> authenticate -> authorticate -> check(note\_id) -> delete data(node\_id)



**III) Middleware**

1. **Authenticate**
2. **Authorticate**
3. **UploadImage**
4. **UploadFile**
5. **Vitidator**
5. 
**6\. ErrorHandle**

**7. successHandle**

**IV> Unit( hàm dùng chung)**

1. **ApiError**
2. **ApiErrorResponse**
3. **ApiSuccess**
4. **ArrayConfig**
5. **CheckUser**
6. **ErrorMessageBase**
7. **HashPassword**
8. **log**
9. **MissingFields**
10. **SendMail**
