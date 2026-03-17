# Software Design Document (SDD)
## Project: CareFirst Clinic — Intelligent Hospital Management System with AI Chatbot

---

## 1. Introduction

### 1.1 Background Study
Trong bối cảnh hiện nay, nhiều phòng khám vẫn quản lý hồ sơ bệnh nhân và lịch hẹn theo cách thủ công hoặc bán tự động, dẫn đến:
- Thời gian tra cứu hồ sơ lâu, dễ sai sót.
- Đặt lịch qua điện thoại thường quá tải trong giờ cao điểm.
- Đơn thuốc viết tay khó đọc, dễ gây nhầm lẫn.
- Bệnh nhân không được hỗ trợ ngoài giờ hành chính.
- Danh sách chờ không minh bạch, gây bất tiện cho bệnh nhân.

Sự phát triển của công nghệ web, cơ sở dữ liệu và trí tuệ nhân tạo (AI) mở ra cơ hội để xây dựng một hệ thống quản lý phòng khám thông minh, giúp số hóa toàn bộ quy trình, nâng cao hiệu quả và trải nghiệm người dùng.

#### 1.1.1 What kind of system
Hệ thống CareFirst Clinic là một **Hospital Management System** tích hợp **AI Chatbot**, hoạt động trên nền tảng web, hỗ trợ đa thiết bị (desktop, mobile). Nó bao gồm các module chính: quản lý bệnh nhân, quản lý bác sĩ, quản lý lịch hẹn, quản lý hồ sơ y tế, kê đơn điện tử, báo cáo thống kê, và chatbot AI hỗ trợ bệnh nhân.

#### 1.1.2 Who needs the system
- **Bệnh nhân**: đặt lịch khám trực tuyến, tra cứu hồ sơ, nhận tư vấn từ chatbot.
- **Bác sĩ**: quản lý lịch làm việc, hồ sơ bệnh nhân, kê đơn thuốc điện tử.
- **Quản trị viên**: giám sát toàn hệ thống, quản lý người dùng, tạo báo cáo.
- **Phòng khám**: nâng cao hiệu quả quản lý, giảm tải nhân sự, tăng sự hài lòng của bệnh nhân.

#### 1.1.3 Why they need the system
- Giảm thời gian tra cứu hồ sơ xuống dưới 3 giây.
- Cho phép đặt lịch trực tuyến 24/7 qua web và chatbot.
- Kê đơn điện tử, có cảnh báo tương tác thuốc tự động.
- Chatbot AI hỗ trợ tư vấn triệu chứng cơ bản, hướng dẫn trước khi khám.
- Hiển thị danh sách chờ theo thời gian thực.
- Quản lý tập trung, báo cáo thông minh.

#### 1.1.4 How the proposed system can improve their activities
- **Bệnh nhân**: tiết kiệm thời gian, dễ dàng đặt lịch, được hỗ trợ ngoài giờ hành chính.
- **Bác sĩ**: quản lý hồ sơ nhanh chóng, kê đơn điện tử chính xác, giảm sai sót.
- **Quản trị viên**: có báo cáo chi tiết, giám sát hệ thống hiệu quả.
- **Phòng khám**: tăng uy tín, nâng cao chất lượng dịch vụ, tối ưu nguồn lực.

---

### 1.2 Use Case Diagram (Overview)

```mermaid
graph TD
    %% Định nghĩa Actor với style nổi bật
    Patient([ BỆNH NHÂN])
    Doctor([ BÁC SĨ])
    Admin([ QUẢN TRỊ VIÊN])
    Chatbot([ CHATBOT AI])
    
    subgraph " HỆ THỐNG CAREFIRST CLINIC"
        %% Bệnh nhân - Màu xanh lá
        P1[ Đăng ký] --> Patient
        P2[ Đăng nhập] --> Patient
        P3[ Đặt lịch hẹn] --> Patient
        P4[ Hủy lịch] --> Patient
        P5[ Xem hồ sơ] --> Patient
        P6[ Chat với AI] --> Patient
        P7[ Thanh toán] --> Patient
        
        %% Bác sĩ - Màu đỏ
        D1[ Đăng nhập] --> Doctor
        D2[ Xem lịch hẹn] --> Doctor
        D3[ Xem hồ sơ BN] --> Doctor
        D4[ Cập nhật hồ sơ] --> Doctor
        D5[ Kê đơn] --> Doctor
        D6[ Báo cáo] --> Doctor
        
        %% Admin - Màu xanh dương
        A1[ Đăng nhập] --> Admin
        A2[ Quản lý người dùng] --> Admin
        A3[ Quản lý bác sĩ] --> Admin
        A4[ Quản lý bệnh nhân] --> Admin
        A5[ Quản lý lịch hẹn] --> Admin
        A6[ Báo cáo hệ thống] --> Admin
        A7[ Cấu hình chatbot] --> Admin
        
        %% Chatbot - Màu vàng
        C1[ Trả lời FAQ] --> Chatbot
        C2[ Hướng dẫn đặt lịch] --> Chatbot
        C3[ Tư vấn triệu chứng] --> Chatbot
        C4[ Chuyển bác sĩ] --> Chatbot
        C5[ Nhắc lịch] --> Chatbot
        
        %% Relationships - Đường thẳng
        P3 ---> D2
        P3 ---> P7
        P6 ---> C1
        P6 ---> C2
        P6 ---> C3
        P6 ---> C4
        
        D4 ---> D3
        D5 ---> D3
        
        A2 ---> A3
        A2 ---> A4
        A6 ---> A5
        A7 ---> C1
    end
    
    %% Styling màu sắc tươi sáng hơn
    classDef patient fill:#90EE90,stroke:#006400,stroke-width:2px,color:#000000
    classDef doctor fill:#FFB6C1,stroke:#8B0000,stroke-width:2px,color:#000000
    classDef admin fill:#87CEEB,stroke:#00008B,stroke-width:2px,color:#000000
    classDef chatbot fill:#FFD700,stroke:#B8860B,stroke-width:2px,color:#000000
    
    %% Style cho Actor
    classDef actorPatient fill:#228B22,stroke:#006400,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef actorDoctor fill:#DC143C,stroke:#8B0000,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef actorAdmin fill:#4169E1,stroke:#00008B,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef actorChatbot fill:#FF8C00,stroke:#B8860B,stroke-width:3px,color:#FFFFFF,font-weight:bold
    
    class Patient actorPatient
    class Doctor actorDoctor
    class Admin actorAdmin
    class Chatbot actorChatbot
    
    class P1,P2,P3,P4,P5,P6,P7 patient
    class D1,D2,D3,D4,D5,D6 doctor
    class A1,A2,A3,A4,A5,A6,A7 admin
    class C1,C2,C3,C4,C5 chatbot
    
    %% Style cho đường nối
    linkStyle default stroke:#333333,stroke-width:1.5px
```