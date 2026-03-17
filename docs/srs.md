# 🏥 Software Requirements Specification (SRS)
## Project: CareFirst Clinic — Intelligent Hospital Management System with AI Chatbot

---

## 1. Introduction

### 1.1 Document Purpose
Tài liệu này mô tả chi tiết các yêu cầu cho **CareFirst Clinic — Hệ thống Quản lý Phòng khám Thông minh tích hợp AI Chatbot**.  
Đối tượng đọc bao gồm tất cả các bên liên quan: bác sĩ, bệnh nhân, nhân viên lễ tân, quản trị viên và đội ngũ phát triển.  
Đội ngũ phát triển chỉ sử dụng tài liệu này và các phiên bản cập nhật làm nguồn tham khảo duy nhất cho các yêu cầu dự án. Mọi yêu cầu bằng văn bản hoặc lời nói chỉ được coi là hợp lệ khi được đưa vào tài liệu này hoặc các bản sửa đổi chính thức.

### 1.2 Product Scope
Sản phẩm phần mềm được đề xuất là **CareFirst Clinic**. Hệ thống được xây dựng để số hóa hoàn toàn quy trình quản lý phòng khám, bao gồm quản lý hồ sơ bệnh nhân, đặt lịch hẹn, kê đơn thuốc điện tử, theo dõi khám chữa bệnh và đặc biệt tích hợp AI Chatbot hỗ trợ bệnh nhân 24/7.

**Các vấn đề hiện tại cần giải quyết:**
- Thời gian tra cứu hồ sơ bệnh nhân lâu (mất 5–10 phút).
- Đường dây điện thoại đặt lịch luôn bận trong giờ cao điểm.
- Đơn thuốc viết tay khó đọc, gây hiểu nhầm.
- Bệnh nhân không được hỗ trợ ngoài giờ hành chính.
- Quản lý danh sách chờ thủ công, thiếu minh bạch.

**Mục tiêu của hệ thống mới:**
- Giảm thời gian tra cứu hồ sơ xuống dưới 3 giây.
- Cho phép đặt lịch trực tuyến 24/7 qua web và chatbot.
- Kê đơn điện tử, có cảnh báo tương tác thuốc tự động.
- AI Chatbot hỗ trợ tư vấn triệu chứng cơ bản, hướng dẫn trước khi khám.
- Hiển thị danh sách chờ theo thời gian thực.
- Quản lý tập trung, báo cáo thông minh.

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
| CI/CD | Continuous Integration / Continuous Deployment |

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
CareFirst Clinic là một hệ thống quản lý phòng khám thông minh, hoạt động như một ứng dụng web đa tầng:
- **Frontend (React + Vite)**: cung cấp giao diện người dùng cho bệnh nhân, bác sĩ, admin. Hỗ trợ responsive trên desktop và mobile.
- **Backend (ASP.NET Core Web API)**: xử lý logic nghiệp vụ, quản lý dữ liệu, cung cấp API cho frontend và chatbot.
- **AI Chatbot Service (Python + FastAPI)**: xử lý ngôn ngữ tự nhiên (NLP), tích hợp LLM và RAG để trả lời câu hỏi, tư vấn triệu chứng.
- **Database (SQL Server)**: lưu trữ hồ sơ bệnh nhân, lịch hẹn, đơn thuốc, báo cáo.

Hệ thống được triển khai theo kiến trúc microservice, dễ mở rộng, dễ bảo trì, và hỗ trợ CI/CD để đảm bảo chất lượng.

### 2.2 Product Functions
Các chức năng chính của hệ thống bao gồm:

#### 2.2.1 Đăng ký / Đăng nhập
- Người dùng có thể tạo tài khoản mới hoặc đăng nhập bằng tài khoản hiện có.
- Hệ thống sử dụng JWT để xác thực và phân quyền.
- Phân loại người dùng: bệnh nhân, bác sĩ, admin.

#### 2.2.2 Quản lý lịch hẹn
- Bệnh nhân có thể đặt lịch khám theo bác sĩ, ngày, giờ.
- Hệ thống kiểm tra slot trống và xác nhận lịch hẹn.
- Cho phép hủy lịch, xem lịch sử hẹn.
- Gửi thông báo nhắc lịch qua email hoặc SMS.

#### 2.2.3 Quản lý hồ sơ bệnh nhân
- Lưu trữ thông tin cá nhân, tiền sử bệnh, kết quả xét nghiệm.
- Bác sĩ có thể cập nhật hồ sơ, thêm chẩn đoán, kê đơn thuốc.
- Bệnh nhân có thể xem hồ sơ của mình.

#### 2.2.4 Chatbot AI
- Trả lời câu hỏi thường gặp (FAQ).
- Hướng dẫn bệnh nhân cách đặt lịch.
- Tư vấn triệu chứng ban đầu dựa trên NLP và LLM.
- Tích hợp RAG để truy xuất kiến thức từ vector database.

#### 2.2.5 Quản lý bác sĩ
- Lưu trữ thông tin bác sĩ: chuyên khoa, lịch làm việc.
- Admin có thể thêm, sửa, xóa thông tin bác sĩ.

#### 2.2.6 Báo cáo & Thống kê
- Admin có thể xem báo cáo số lượng bệnh nhân, lịch hẹn, doanh thu.
- Dashboard trực quan hiển thị dữ liệu theo thời gian thực.
- Xuất báo cáo theo tháng/quý/năm.

---

## 2.3 Product Constraints
- Hệ thống phải chạy trên trình duyệt hiện đại (Chrome, Edge, Firefox).
- API phản hồi < 2 giây.
- Chatbot phải hoạt động liên tục, uptime ≥ 99%.
- Dữ liệu phải được mã hóa (AES-256, HTTPS).
- Hệ thống phải hỗ trợ ≥ 1000 người dùng đồng thời.
- Tuân thủ chuẩn HL7 FHIR và GDPR.

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
- Authentication (JWT, phân quyền).
- Appointment Management (đặt, hủy, nhắc lịch).
- Patient Records (hồ sơ, đơn thuốc).
- Chatbot AI (FAQ, triệu chứng, hướng dẫn).
- Reporting (dashboard, xuất báo cáo).

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
- Unit Test: kiểm thử từng module.
- Integration Test: kiểm thử luồng đặt lịch, chat.
- Performance Test: kiểm tra tốc độ phản hồi, chịu tải.
- Security Test: kiểm tra phân quyền, JWT, SQL injection.
- Chatbot Evaluation: độ chính xác, độ trễ, phản hồi sai.
- User Acceptance Test (UAT): kiểm thử với bệnh nhân và bác sĩ thực tế.

---

## 5. Appendices

### A. Use Case Diagram
**Actors**:
- Patient
- Doctor
- Admin
- Chatbot

**Use Cases**:
- Patient: Register, Login, Book Appointment, View Medical Record, Chat with Bot.
- Doctor: Login, Manage Patient Records, Issue Prescription, View Reports.
- Admin: Manage Users, Manage Doctors, Generate Reports, Monitor System.
- Chatbot: Answer FAQs, Guide Appointment Booking, Provide Symptom Advice.

### B. Sequence Diagram (Đặt lịch khám)
1. Patient chọn bác sĩ, ngày, giờ trên UI.
2. Frontend gửi request đến API Gateway.
3. API Gateway chuyển đến Appointment Service.
4. Appointment Service kiểm tra slot trống trong DB.
5. Nếu slot hợp lệ, lưu lịch hẹn vào DB.
6. Appointment Service trả về confirmation.
7. Frontend hiển thị thông báo xác nhận cho Patient.

### C. ERD (Entity Relationship Diagram)
**Tables**:
- Patient (id, name, dob, phone, email, userId)
- Doctor (id, name, specialty)
- Appointment (id, patientId, doctorId, timeSlot, status)
- MedicalRecord (id, patientId, diagnosis, prescription, createdAt)
- Prescription (id, recordId, medicine, dosage)

### D. API Documentation (OpenAPI Spec)
**Endpoints**:
- `/api/auth/register` — đăng ký tài khoản
- `/api/auth/login` — đăng nhập
- `/api/patient/{id}` — lấy thông tin bệnh nhân
- `/api/doctor/{id}` — lấy thông tin bác sĩ
- `/api/appointments` — đặt/hủy lịch hẹn
- `/api/chatbot/query` — gửi câu hỏi đến chatbot

### E. Dataset mẫu cho chatbot
- **FAQ**: Giờ mở cửa, địa chỉ phòng khám, quy trình khám.
- **Triệu chứng phổ biến**: đau đầu, sốt, ho, đau bụng.
- **Hướng dẫn đặt lịch**: cách chọn bác sĩ, cách hủy lịch.
- **Thông tin thuốc cơ bản**: công dụng, liều lượng, cảnh báo.

### F. Non-Functional Requirements Matrix
| Requirement | Description | Priority |
|-------------|-------------|----------|
| Performance | API phản hồi < 2 giây | High |
| Security | JWT, HTTPS, mã hóa dữ liệu | High |
| Scalability | Hỗ trợ nhiều phòng khám | Medium |
| Availability | Uptime ≥ 99% | High |
| Usability | Giao diện đơn giản, dễ dùng | High |
| Maintainability | Kiến trúc microservice, CI/CD | Medium |

### G. Glossary
- **Slot**: khoảng thời gian khám bệnh của bác sĩ.
- **Dashboard**: giao diện hiển thị dữ liệu thống kê.
- **Vector Database**: cơ sở dữ liệu lưu trữ embedding để chatbot truy xuất kiến thức.
- **Prescription**: đơn thuốc điện tử do bác sĩ kê.

---

## 6. Conclusion
Tài liệu SRS này là nền tảng cho việc phát triển hệ thống CareFirst Clinic. Nó mô tả đầy đủ mục tiêu, phạm vi, chức năng, yêu cầu phi chức năng, và phương pháp kiểm thử.  
Đội ngũ phát triển cần tuân thủ tài liệu này trong suốt quá trình để đảm bảo sản phẩm cuối cùng đáp ứng đúng nhu cầu của phòng khám và bệnh nhân.
