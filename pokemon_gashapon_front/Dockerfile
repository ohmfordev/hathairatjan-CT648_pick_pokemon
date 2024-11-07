# ใช้ Node.js version 18 เป็นพื้นฐาน
FROM node:18

# ตั้งค่า directory ทำงานใน container
WORKDIR /app

# ติดตั้ง Bun และตั้งค่า PATH
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# ตรวจสอบว่า Bun ติดตั้งเรียบร้อย
RUN bun --version

# คัดลอกไฟล์ package.json และติดตั้ง dependencies ด้วย Bun
COPY package.json ./
RUN bun install

# คัดลอกไฟล์ทั้งหมดใน frontend
COPY . .

# เปิดพอร์ต 3002 สำหรับ frontend
EXPOSE 3002

# สั่งให้ container รัน frontend ด้วย Bun
CMD ["bun", "dev"]
