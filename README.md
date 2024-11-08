# CT648_pokemon_gashapon
## 1. หลักการพัฒนา
การพัฒนาโปรเจกต์นี้ยึดหลักการออกแบบที่เน้นการสร้างระบบ RESTful API ที่ใช้งานง่ายและปลอดภัย โดยมีหลักการสำคัญดังนี้
### แยกหน้าที่ของเซิร์ฟเวอร์และฐานข้อมูล
ใช้ Express เป็นเซิร์ฟเวอร์ในการจัดการคำร้องขอ (request) และ PostgreSQL เป็นฐานข้อมูลหลักในการจัดเก็บข้อมูลผู้ใช้และข้อมูลเกม
### ความปลอดภัย
ใช้ไลบรารี bcrypt เพื่อเข้ารหัสรหัสผ่านผู้ใช้ในการลงทะเบียนและการตรวจสอบความถูกต้องของรหัสผ่านเมื่อเข้าสู่ระบบ ช่วยป้องกันการเข้าถึงข้อมูลสำคัญจากภายนอก
### Transaction Management
ใช้คำสั่ง transaction ของ PostgreSQL เช่น BEGIN และ COMMIT เพื่อให้การอัปเดตข้อมูล เช่น การเพิ่มการ์ดโปเกมอนในคอลเล็กชัน หากผู้เล่นได้รับโปเกมอนใหม่ที่ยังไม่มีในคอลเล็กชัน ระบบจะเพิ่มรายการโปเกมอนในคอลเล็กชันของผู้ใช้ในฐานข้อมูล หากผู้ใช้ได้รับโปเกมอนซ้ำ ระบบจะเพิ่มค่า power_up_points ของโปเกมอนนั้น แทนการเพิ่มการ์ดใหม่
กระบวนการเพิ่มโปเกมอนหรือเพิ่มค่า power_up_points จะดำเนินการใน transaction เดียวกัน เพื่อให้แน่ใจว่าข้อมูลในฐานข้อมูลถูกต้อง
การจัดการข้อผิดพลาด (Error Handling)
### รองรับการแจ้งเตือนเมื่อเกิดข้อผิดพลาดในคำขอ เช่น การเชื่อมต่อฐานข้อมูลหรือการดึงข้อมูลที่ไม่มีอยู่ โดยส่งรหัสสถานะที่เหมาะสม เช่น 404 Not Found และ 500 Internal Server Error เพื่อให้ client เข้าใจสถานะของการดำเนินการได้ง่าย
### รองรับ Cross-Origin Resource Sharing (CORS)
เปิดการใช้งาน CORS เพื่อให้แอปพลิเคชันที่มี frontend อยู่คนละเซิร์ฟเวอร์สามารถเรียกใช้งาน API ได้อย่างปลอดภัยและสะดวก
## 2. API ที่สำคัญ
API ที่พัฒนาขึ้นครอบคลุมทั้งการจัดการข้อมูลผู้ใช้และการเล่นเกม ซึ่งมีรายละเอียดดังนี้
### 2.1 API จัดการข้อมูลผู้ใช้
#### POST /api/register
- ลงทะเบียนผู้ใช้ใหม่โดยรับ user_name และ pass จาก client
- ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่ จากนั้นเข้ารหัสรหัสผ่านด้วย bcrypt ก่อนบันทึกข้อมูลในฐานข้อมูล
- ส่ง user_id ของผู้ใช้ใหม่กลับไปหากการลงทะเบียนสำเร็จ
#### POST /api/login
- ตรวจสอบชื่อผู้ใช้และรหัสผ่านที่เข้ารหัสในฐานข้อมูล โดยใช้ bcrypt.compare() เพื่อตรวจสอบความถูกต้องของรหัสผ่าน
- หากเข้าสู่ระบบสำเร็จ จะส่ง user_id และชื่อผู้ใช้ (user_name) กลับไปในรูปแบบ JSON
#### GET /api/user_wl
- ใช้ user_id ที่ส่งมาผ่าน query string เพื่อดึงข้อมูลชนะ/แพ้ของผู้ใช้จากตาราง user_wl สำหรับแสดงผลสถิติการเล่นของผู้ใช้
#### POST /api/update-history
- อัปเดตประวัติการชนะหรือแพ้ของผู้ใช้ในตาราง user_wl โดยใช้ user_id และ result ที่ส่งมาจาก client เพื่อระบุผลการเล่น (win หรือ loss)
### 2.2 API ที่เกี่ยวข้องกับเกมโปเกมอน
#### GET /api/pokemon
- ดึงข้อมูลโปเกมอนทั้งหมดจากตาราง pokemon ในฐานข้อมูล PostgreSQL เพื่อให้ frontend ใช้แสดงรายการโปเกมอนที่มีอยู่ทั้งหมด
#### GET /api/pic_poke
- รับ pok_name ใน query string เพื่อดึงรูปภาพของโปเกมอนจากตาราง pic_poke และส่งกลับไปในรูปแบบ Base64 เพื่อนำไปแสดงผลในแอปพลิเคชัน
### 2.3 API การสุ่มและสะสมการ์ดโปเกมอน
#### GET /api/random-pokemon
- ทำการสุ่มโปเกมอนและอัปเดตจำนวนครั้งที่สุ่ม (consecutive_pulls) ของผู้ใช้ โดยการสุ่มครั้งที่ 6 จะได้รับการ์ด rare และรีเซ็ต consecutive_pulls เป็น 0
- ดึงรูปภาพโปเกมอนจากตาราง pic_poke และส่งข้อมูลทั้งหมดกลับไปให้ client
#### GET /api/drop-rates
- ส่งอัตราการดรอปการ์ดในแต่ละระดับความหายาก (common, uncommon, rare) กลับไปในรูปแบบ JSON เพื่อให้ client แสดงอัตราการดรอปแก่ผู้ใช้
#### POST /api/duplicate-pokemon
- ใช้ userId และ pokemonId เพื่อเช็คว่าผู้ใช้มีโปเกมอนตัวนี้ในคอลเล็กชันอยู่หรือไม่ หากมีอยู่แล้ว จะเพิ่ม power_up_points ของโปเกมอนตัวนั้นขึ้น หากไม่มี ระบบจะเพิ่มโปเกมอนตัวนี้เข้าไปในคอลเล็กชันของผู้ใช้
### 2.4 API สำหรับจัดการข้อมูลโปเกมอนที่สะสม
#### GET /api/user-collection
- ดึงคอลเล็กชันโปเกมอนทั้งหมดของผู้ใช้ที่มีในตาราง user_pokemon และ pokemon พร้อมดึงรูปภาพที่มีอยู่ในตาราง pic_poke มาด้วย เพื่อนำไปแสดงผลในหน้าคอลเล็กชันของผู้ใช้
#### GET /api/user-pokemon-points
- ดึงข้อมูล power_up_points ของโปเกมอนที่ผู้ใช้สะสมไว้ โดยใช้ user_id และ pokemon_id เป็นตัวระบุเพื่อให้ผู้ใช้ทราบข้อมูลค่าพลังสะสมของโปเกมอนแต่ละตัว
### โครงสร้าง
 ```  CT648_POKEMON_GASHAPON
├── pokemon_ gashapon_front             # โฟลเดอร์ของ Frontend
│   ├── public                          # เก็บไฟล์สาธารณะ เช่น รูปภาพ, ไอคอน
│   ├── src                             # โฟลเดอร์เก็บซอร์สโค้ดหลักของ Frontend
│   ├── bun.lockb                       # ไฟล์ lock ของ Bun
│   ├── bunfig.toml                     # ไฟล์การตั้งค่าสำหรับ Bun
│   ├── Dockerfile                      # ไฟล์ Docker สำหรับสร้าง image ของ Frontend
│   ├── package-lock.json               # ไฟล์ lock ของ npm
│   ├── package.json                    # รายการ dependencies และสคริปต์
│   ├── README.md                       # ไฟล์อธิบายโปรเจกต์
│   ├── tsconfig.json                   # ไฟล์ตั้งค่า TypeScript
│   └── yarn.lock                       # ไฟล์ lock ของ Yarn
│
├── pokemon-gashapon-backend            # โฟลเดอร์ของ Backend
│   ├── .gitignore                      # ระบุไฟล์หรือโฟลเดอร์ที่ไม่ต้องการให้ติดตามใน Git
│   ├── bun.lockb                       # ไฟล์ lock ของ Bun
│   ├── Dockerfile                      # ไฟล์ Docker สำหรับสร้าง image ของ Backend
│   ├── index.ts                        # จุดเริ่มต้นของแอป Backend
│   ├── package-lock.json               # ไฟล์ lock ของ npm
│   ├── package.json                    # รายการ dependencies และสคริปต์
│   ├── README.md                       # ไฟล์อธิบายโปรเจกต์
│   ├── server.js                       # ไฟล์เซิร์ฟเวอร์หลัก
│   └── tsconfig.json                   # ไฟล์ตั้งค่า TypeScript
│
├── docker-compose.yml                  # ไฟล์กำหนดการทำงานของ services ด้วย Docker Compose
├── nginx.conf                          # ไฟล์การตั้งค่า Nginx สำหรับ reverse proxy
└── package.json                        # รายการ dependencies และสคริปต์หลักของโปรเจกต์
  ```
## 3. วิธี Deploy
## 3.1 นำโค้ดทั้งหมดขึ้นมาไว้ที่ GitHub
โดยมีไฟล์ที่นี้มีบทบาทสำคัญในการ จัดการการทำงานและการรันโปรเจกต์ในสภาพแวดล้อมของ Docker ดังนี้

Dockerfile (ทั้งใน Path ของ backend และ frontend)
- ใช้กำหนดวิธีการสร้าง Docker image ของแต่ละส่วนของโปรเจกต์ (backend และ frontend)
- ทำให้แอปพลิเคชันแต่ละส่วนสามารถรันในสภาพแวดล้อมที่เหมือนกันทุกครั้ง ไม่ว่าจะรันที่ไหนก็ตาม
## docker-compose.yml
- รวบรวมทุกบริการ (frontend, backend, database, reverse proxy) ไว้ในไฟล์เดียว
- ทำให้การจัดการและการรันหลายบริการพร้อมกันง่ายขึ้น โดยสามารถใช้คำสั่งเดียวในการรันทั้งโปรเจกต์
## nginx.conf
- ใช้กำหนดค่าการทำงานของ Nginx เป็น reverse proxy เพื่อเชื่อมต่อและจัดการการเข้าถึงระหว่าง frontend และ backend
- ช่วยให้ผู้ใช้เข้าถึงแอปพลิเคชันได้อย่างราบรื่นและมีประสิทธิภาพมากขึ้น
## 3.1 Clone โปรเจกต์
- เชื่อมต่อไปยังเซิร์ฟเวอร์ ใช้ SSH เพื่อเข้าถึงเซิร์ฟเวอร์ (เช่น AWS EC2)
- Clone โปรเจกต์จาก GitHub ลงเซิร์ฟเวอร์
     ```
        git clone https://github.com/ohmfordev/hathairatjan-CT648_pick_pokemon.git
     ```
   
    ```
       cd CT648_pokemon_gashapon/
     ```
## 3.2 Build และ Start Services
 ```
 sudo docker-compose up
  ```
     
หรือ 

  ```
  sudo docker-compose up --build -d
 ```
## 3.3 เข้าใช้งาน
- เข้าใช้งานหน้าเว็บโดย URL หรือ IP ของเครื่องที่ให้รัน Frontend: http://localhost:3000
- Backend: http://localhost:3001
- http://13.215.67.233:3000/login

