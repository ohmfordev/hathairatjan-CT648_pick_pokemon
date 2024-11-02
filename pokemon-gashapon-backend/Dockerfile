# ใช้ Node.js เป็น base image
FROM node:18

# ตั้งค่า working directory
WORKDIR /app

# ติดตั้ง Bun
RUN curl -fsSL https://bun.sh/install | bash

# เพิ่ม Bun ลงใน PATH
ENV PATH="/root/.bun/bin:${PATH}"

# คัดลอกไฟล์ package.json และ bun.lockb (ถ้ามี)
COPY package.json ./
#COPY bun.lockb ./

# ติดตั้ง dependencies
RUN bun install

# คัดลอกไฟล์ทั้งหมดไปยัง container
COPY . .

# เปิดพอร์ตที่เซิร์ฟเวอร์จะทำงาน
EXPOSE 3001

# รันเซิร์ฟเวอร์
CMD ["bun", "run", "server.js"]
