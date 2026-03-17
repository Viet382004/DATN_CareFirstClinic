# 🏥 Software Requirements Specification (SRS)
## Project: CareFirst Clinic — Intelligent Hospital Management System with AI Chatbot

---

## 1. Introduction

### 1.1 Document Purpose
Tài liệu này mô tả chi tiết các yêu cầu phần mềm cho hệ thống quản lý phòng khám thông minh tích hợp AI Chatbot. Nó là cơ sở cho việc thiết kế, phát triển, kiểm thử và triển khai hệ thống, đảm bảo tất cả các bên liên quan (bệnh nhân, bác sĩ, quản trị viên, nhà phát triển) có cùng hiểu biết về mục tiêu và chức năng của sản phẩm.

### 1.2 Product Scope
Hệ thống cho phép:
- Bệnh nhân: đăng ký, đặt lịch khám, quản lý hồ sơ, tương tác với chatbot AI để được tư vấn ban đầu.
- Bác sĩ: quản lý lịch làm việc, hồ sơ bệnh nhân, kê đơn thuốc, xem báo cáo.
- Admin: giám sát toàn bộ hệ thống, quản lý người dùng, tạo báo cáo thống kê.
- Chatbot AI: hỗ trợ bệnh nhân với câu hỏi thường gặp, hướng dẫn đặt lịch, tư vấn triệu chứng ban đầu.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
|------|------------|
| JWT | JSON Web Token |
| LLM | Large Language Model |
| RAG | Retrieval-Augmented Generation |
| UI | User Interface |
| API | Application Programming Interface |
| NLP | Natural Language Processing |
| ERD | Entity Relationship Diagram |

### 1.4 References
- OWASP Top 10 Security Guidelines  
- HL7 FHIR Standards  
- OpenAI API Documentation  
- Microsoft ASP.NET Core Docs  
- ReactJS Official Docs  
- SQL Server Documentation  

### 1.5 Document Overview
Tài liệu gồm: tổng quan sản phẩm, yêu cầu chức năng và phi chức năng, giao diện, xác minh, phụ lục (use case, ERD, sequence diagram, API spec).

---

## 2. Product Overview

### 2.1 Product Perspective
Hệ thống là ứng dụng web đa tầng:
- **Frontend**: React + Vite (UI cho bệnh nhân, bác sĩ, admin).
- **Backend**: ASP.NET Core Web API (business logic).
- **Chatbot AI**: Python + FastAPI (NLP, LLM, RAG).
- **Database**: SQL Server (lưu trữ hồ sơ, lịch hẹn, đơn thuốc).

### 2.2 Product Functions
- Đăng ký/đăng nhập người dùng (JWT).
- Đặt lịch khám, hủy lịch, xem lịch sử.
- Quản lý hồ sơ bệnh nhân, đơn thuốc.
- Chatbot AI tư vấn ban đầu, trả lời FAQ.
- Quản lý bác sĩ, báo cáo thống kê.

### 2.3 Product Constraints
- Phải chạy trên trình duyệt hiện đại (Chrome, Edge, Firefox).
- API phản hồi < 2 giây.
- Chatbot phải hoạt động liên tục, uptime ≥ 99%.
- Dữ liệu phải được mã hóa (AES-256, HTTPS).

### 2.4 User Characteristics
- **Bệnh nhân**: không cần kỹ năng kỹ thuật, giao diện đơn giản.
- **Bác sĩ**: sử dụng hệ thống để quản lý hồ sơ, lịch khám.
- **Admin**: có quyền truy cập toàn bộ hệ thống, quản lý người dùng.

### 2.5 Assumptions and Dependencies
- Người dùng có kết nối internet.
- API chatbot hoạt động ổn định.
- Cơ sở dữ liệu được cấu hình đúng.
- Hệ thống CI/CD triển khai thành công.

### 2.6 Apportioning of Requirements
Các chức năng chatbot AI sẽ được phát triển sau khi hoàn thiện các chức năng quản lý cơ bản (auth, appointment, medical record).

---

## 3. Requirements

### 3.1 External Interfaces
- **UI**: Web responsive, hỗ trợ desktop/mobile.
- **API**: RESTful, JSON payload.
- **Chatbot**: HTTP interface, WebSocket cho realtime.
- **Database**: SQL Server, hỗ trợ stored procedures.

### 3.2 Functional Requirements
#### 3.2.1 Authentication
- Người dùng có thể đăng ký, đăng nhập.
- Xác thực bằng JWT.
- Phân quyền: bệnh nhân, bác sĩ, admin.

#### 3.2.2 Appointment Management
- Bệnh nhân chọn bác sĩ, ngày, giờ.
- Kiểm tra slot trống.
- Lưu lịch hẹn vào DB.
- Hủy lịch hẹn, xem lịch sử.

#### 3.2.3 Patient Records
- Bác sĩ xem, cập nhật hồ sơ bệnh nhân.
- Lưu đơn thuốc, chẩn đoán.
- Bệnh nhân xem hồ sơ cá nhân.

#### 3.2.4 Chatbot AI
- Trả lời câu hỏi thường gặp.
- Hướng dẫn đặt lịch.
- Tư vấn triệu chứng ban đầu.
- Tích hợp LLM + RAG để truy xuất kiến thức từ vector database.

#### 3.2.5 Reporting
- Admin xem số lượng lịch hẹn, bệnh nhân.
- Xuất báo cáo theo tháng/quý.
- Dashboard trực quan.

### 3.3 Quality of Service Requirements
- Thời gian phản hồi API < 2 giây.
- Uptime ≥ 99%.
- Chatbot độ chính xác ≥ 90%.
- Hệ thống chịu tải ≥ 1000 người dùng đồng thời.

### 3.4 Compliance Requirements
- Tuân thủ bảo mật dữ liệu y tế.
- Tuân thủ HL7 FHIR cho hồ sơ bệnh nhân.
- Tuân thủ GDPR về quyền riêng tư.

### 3.5 Design and Implementation Constraints
- Kiến trúc microservice.
- CI/CD với GitHub Actions.
- Frontend dùng React + Vite.
- Backend dùng ASP.NET Core Web API.
- Chatbot dùng Python + FastAPI.

### 3.6 AI/ML Requirements
- Chatbot sử dụng LLM để xử lý ngôn ngữ tự nhiên.
- Tích hợp RAG để truy xuất kiến thức từ vector database.
- Huấn luyện mô hình trên dữ liệu y tế giả lập.
- Đánh giá chatbot bằng precision, recall, F1-score.

---

## 4. Verification

- **Unit Test**: Kiểm thử từng module (Auth, Appointment, Chatbot).
- **Integration Test**: Kiểm thử luồng đặt lịch, chat.
- **Performance Test**: Kiểm tra tốc độ phản hồi, chịu tải.
- **Security Test**: Kiểm tra phân quyền, JWT, SQL injection.
- **Chatbot Evaluation**: Độ chính xác, độ trễ, phản hồi sai.

---

## 5. Appendices

### A. Use Case Diagram
- Actors: Patient, Doctor, Admin, Chatbot.
- Use cases: Register, Login, Book Appointment, Manage Records, Chat with Bot, Generate Reports.

### B. Sequence Diagram (Đặt lịch khám)
- Patient → UI → API → Appointment Service → DB → Confirmation.

### C. ERD (Entity Relationship Diagram)
- Tables: Patient, Doctor, Appointment, MedicalRecord, Prescription.

### D. API Documentation (OpenAPI Spec)
- Endpoints: `/api/auth`, `/api/patient`, `/api/doctor`, `/api/appointments`, `/api/chatbot`.

### E. Dataset mẫu cho chatbot
- FAQ về phòng khám.
- Triệu chứng bệnh phổ biến.
- Hướng dẫn đặt lịch.

---

