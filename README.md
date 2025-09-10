# task-management-website

Website giúp các nhóm sinh viên **quản lý dự án, phân công công việc và theo dõi tiến độ** một cách hiệu quả mà không phải trả phí.  
Được xây dựng trong khuôn khổ dự án nhóm để thực hiện **các project như đồ án, ...** và làm việc nhóm.

## Demo:
Link Demo: https://task-management-website-theta.vercel.app/

### Các tính năng chính:
- **Xác thực & Quản lý tài khoản**: Đăng ký, đăng nhập, quên mật khẩu, login bằng Google, xác minh người dùng.  
- **Tính năng chung của Người dùng**: Cập nhật thông tin, ảnh đại diện, đổi mật khẩu.  
- **Quản lý Dự án**: Tạo, chỉnh sửa, tìm kiếm, lọc, lưu trữ, khôi phục, xoá vĩnh viễn.  
- **Quản lý Thành viên trong dự án**: Thêm/xoá thành viên, rời khỏi dự án.  
- **Quản lý Nhiệm vụ**: Giao việc, chỉnh sửa, thay đổi trạng thái, lưu trữ, xem dashboard, biểu đồ tiến độ.  
- **Quản lý Nhãn (Labels)**: Tạo, chỉnh sửa, xoá, phân loại công khai/riêng tư.  
- **Dashboard**: Thống kê tổng quan dự án, nhiệm vụ, biểu đồ trực quan.  
- **Tính năng Admin**: Quản lý tổng quan người dùng, quản lý tổng quan dự án, xuất dữ liệu Excel.  

#### Công nghệ sử dụng
- **Frontend**: ReactJS, Tailwindcss, Antd
- **Backend**: JSON Server (Fake API)
- **Triển khai**: Vercel

##### Cài đặt & sử dụng

**Clone dự án**: 
git clone https://github.com/phwnganh/task-management-website.git

**Cài đặt dependencies**: npm install

**Chạy database JSON Server**: json-server --watch src/database/database.json --port 9999

**Chạy môi trường dev**: npm run dev

###### Cấu trúc dự án

- components / # các UI component tái sử dụng
- layouts / # bố cục chung của trang web (VD: Header, Sidebar)
- pages / # giao diện chính (Page-level component)
- routes / # định tuyến
- database / # JSON database
- services / # API & logic
- security / # xác minh người dùng
- context / # phân quyền
- constants / # hằng số dùng chung
- assets / # hình ảnh, video

###### Mức độ đóng góp dự án
- Phương Anh: nhánh develop
- Anh Tuấn: nhánh TuanTV
- Hoàng: nhánh HoangTVHE173429
- Mạnh: nhánh manhndt
- Phú: nhánh phuvd
- Dương: nhánh BuiDuong

###### Cải tiến Tính năng
- **Tích hợp AI** (đề xuất nhiệm vụ, tìm kiếm bằng giọng nói, kiểm tra nội dung bình luận)
- **Hệ thống thông báo**
- **Thêm reCAPTCHA để tăng tính bảo mật**
- **Tích hợp đa ngôn ngữ**

###### Timeline: 
- Tuần 2–3: Học công nghệ, thiết kế Figma, ERD.

- Tuần 4–6: Phát triển tính năng chính (Auth, Dự án, Nhiệm vụ, Dashboard).

- Tuần 7: Fix bug, tích hợp thông báo, đa ngôn ngữ, AI.

- Tuần 8–9: Kiểm thử, hoàn thiện và thuyết trình.

# English Version

# Task Management Website

A web application that helps student teams **manage projects, assign tasks, and track progress** effectively. This project was developed as a group assignment to do **capstone project** and teamwork skills.

## Demo

Link Demo: https://task-management-website-theta.vercel.app/

### Main Features
 - **Authentication**: Register, login, Google Login, Forgot/Reset password, Human verification.
 - **User Features**: Update profile, avatar, change password
 - **Project Management**: Create, update, archive, restore, search, filter, sort projects.
 - **Member Management Inside Project**: add/remove members, leave project
 - **Task Management**: assign tasks, edit, change status, archive, dashboards, charts.
 - **Labels Management**: create, edit, delete, public/private labels
 - **Dashboard**: project & task statistics, charts
 - **Admin Features**: manage users & projects, export data to Excel

 #### Tech Stack
 - **Frontend**: ReactJS, Tailwindcss, Antd
 - **Backend**: JSON Server (Fake API)
 - **Deployment**: Vercel

 ##### Installation

**clone the repository**
 git clone https://github.com/phwnganh/task-management-website.git

**install dependencies**
 npm install

 **Run database JSON Server**: json-server --watch src/database/database.json --port 9999

**run development server**
 npm run dev

 ###### Folder Structure
 - components/ # reusable UI components
 - layouts/ # common layouts (Header, Sidebar)
 - pages/ # Page-level components
 - routes/ # routing
 - database/ # JSON database
 - services/ # API & logic
 - security/ # human verification
 - context/ # user roles & permissions
 - constants/ # global constants
 - assets/ # images, videos

 ###### Team members
 - Phương Anh: develop branch
- Anh Tuấn: TuanTV branch
- Hoàng: HoangTVHE173429 branch
- Mạnh: manhndt branch
- Phú: phuvd branch
- Dương: BuiDuong branch

###### Future Improvements
- AI Integration (task suggestion, voice search, comment validation)
- Notification system
- reCAPTCHA for better security

###### Project Timeline
- Week 2–3: Learning tech stack, Figma design, ERD.

- Week 4–6: Core features (Auth, Projects, Tasks, Dashboard).

- Week 7: Bug fixing, notifications, multi-language, AI integration.

- Week 8–9: Testing, final refinements, presentation.

