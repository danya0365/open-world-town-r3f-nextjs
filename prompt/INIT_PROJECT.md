ผมต้องการ TODO สำหรับโปรเจค /Users/marosdeeuma/top-down-r3f-nextjs

โดยผมต้องการสร้างโปรเจค ชื่อ Open World Town

โดยเอาแรงบันดาลใจจากเกม GatherTown https://www.gather.town/ ที่แสดงผลแบบ Top-Down และสามารถปรับแต่งเมืองได้แบบอิสระ

ใช้ React Three Fiber ในการ render 3D canvas เปรียบเสมือน GameEngine

ใช้ Tailwind CSS UI ที่เกี่ยวกับ html

ใช้ colyseus ในการทำ real time multiplayer

ใช้ peerjs ในส่วยที่ต้องใช้ WebRTC https://github.com/peers/peerjs เช่น video/screen sharing

ใช้ SunnySide UI asset, tiles และ sprite https://danieldiggle.itch.io/sunnyside

โดยทุกครั้งที่สร้าง page.tsx ต้องทำตาม rule ที่เขียนไว้ที่ /Users/marosdeeuma/top-down-r3f-nextjs/prompt/CREATE_PAGE_PATTERN.md

ถ้าหาก TODO มีเนื้อหาเยอะเกินไป ให้เขียนแยก TODO_FEATURES ออกมา

จากนั้น สร้างหน้า MainLayout พร้อม Header Footer และใส่ Theme Toggle

จากนั้นสร้างหน้า Landing พร้อม master data และ mock data ที่จะใช้ใน หน้า landing ได้เลย
