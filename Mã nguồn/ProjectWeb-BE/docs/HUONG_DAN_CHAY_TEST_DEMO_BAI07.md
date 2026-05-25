# Huong Dan Chay, Test Luong Va Demo Bai 07

## 1. Muc tieu tai lieu
Tai lieu nay huong dan:
- Chay he thong microservice e-commerce tu ma nguon dinh kem.
- Test luong dat hang va notification qua Kafka.
- Tong hop username/password su dung khi demo.
- Chuan bi noi dung de viet bao cao, slide, va quay video demo phan tich ma nguon.

## 2. Yeu cau dau vao
- Java 21.
- Maven local: D:/Seminar/BT7/.tools/apache-maven-3.9.9/bin/mvn.cmd
- Node.js + npm (de chay frontend).
- Kafka local khong Docker (da format KRaft).
- Cac cong chinh:
  - 8761 (Eureka)
  - 8181 (Gateway)
  - 8081-8085 (services)
  - 9092 (Kafka)
  - 5173 (Frontend)

## 3. Build backend
Mo PowerShell:

```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE"
& "D:\Seminar\BT7\.tools\apache-maven-3.9.9\bin\mvn.cmd" clean package -DskipTests
```

Neu gap loi lock file jar (cannot access file because it is being used by another process):

```powershell
taskkill /F /IM java.exe
```

Sau do build lai.

## 4. Chay Kafka local (khong Docker)
### 4.1 Chay broker
Mo terminal tai D:/tools/kafka:

```powershell
Set-Location "D:\tools\kafka"
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

### 4.2 Kiem tra Kafka da mo cong 9092
Mo terminal khac:

```powershell
Test-NetConnection localhost -Port 9092
```

Yeu cau: TcpTestSucceeded = True.

### 4.3 Tao topic de demo
Luu y: phai dung dung cwd D:/tools/kafka, neu khong se bi loi khong tim thay kafka-topics.bat.

```powershell
Set-Location "D:\tools\kafka"
.\bin\windows\kafka-topics.bat --create --topic notificationTopic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
.\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
```

## 5. Chay backend microservices (khong Docker)
Mo moi service tren mot terminal rieng.

### 5.1 Eureka Server
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\eureka-server"
java -jar target\eureka-server-0.0.1-SNAPSHOT.jar
```

### 5.2 User Service
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\user-service"
java -jar target\user-service-0.0.1-SNAPSHOT.jar
```

### 5.3 Product Service
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\product-service"
java -jar target\product-service-0.0.1-SNAPSHOT.jar
```

### 5.4 Order Service
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\order-service"
$env:KAFKA_BOOTSTRAP_SERVERS="localhost:9092"
java -jar target\order-service-0.0.1-SNAPSHOT.jar
```

### 5.5 Notification Service
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\notification-service"
$env:KAFKA_BOOTSTRAP_SERVERS="localhost:9092"
java -jar target\notification-service-0.0.1-SNAPSHOT.jar
```

### 5.6 Payment Service
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\payment-service"
java -jar target\payment-service-0.0.1-SNAPSHOT.jar
```

### 5.7 API Gateway
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-BE\api-gateway"
java -jar target\api-gateway-0.0.1-SNAPSHOT.jar
```

## 6. Chay frontend
```powershell
Set-Location "D:\Seminar\BT7\ProjectWeb-main\FE\react-e-commerce"
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend: http://localhost:5173

## 7. Username/Password can dung
### 7.1 Eureka Server
- URL: http://localhost:8761
- Username: admin
- Password: password

### 7.2 API Gateway actuator
- URL: http://localhost:8181/actuator
- Username: admin
- Password: password

### 7.3 Cac service actuator (vi du notification)
- URL: http://localhost:8084/actuator/prometheus
- Username: eureka
- Password: password

## 8. Test luong demo order -> Kafka -> notification
### 8.1 Dieu kien truoc khi test
- Kafka dang chay va cong 9092 mo.
- Order Service va Notification Service da set KAFKA_BOOTSTRAP_SERVERS=localhost:9092.
- Topic notificationTopic da duoc tao.
- Eureka va cac service da running.

### 8.2 Cach test nhanh bang API
1. Tao du lieu can thiet (user/product) theo API hien co.
2. Goi API place-order qua gateway hoac order-service.
3. Quan sat log order-service: da publish event vao notificationTopic.
4. Quan sat log notification-service: da nhan event va in log simulated email.

Message ky vong:
```json
{
  "orderNumber": "<id don hang>",
  "message": "Order Placed Successfully"
}
```

### 8.3 Kiem tra them
- http://localhost:8761/eureka/apps (dang nhap admin/password): service status UP.
- http://localhost:8084/actuator/prometheus (dang nhap eureka/password): co metrics.

## 9. Goi y quay video demo
1. Mo tong quan kien truc va danh sach service.
2. Mo Eureka, dang nhap, cho thay cac service da UP.
3. Mo frontend (hoac goi API truc tiep), thuc hien dat hang.
4. Cho thay log order-service gui event Kafka.
5. Cho thay log notification-service nhan event + simulated email.
6. Mo actuator/prometheus de xac nhan monitor.
7. Ket luan.

## 10. Checklist de nop dung yeu cau de bai
- [ ] Chay duoc ma nguon dinh kem.
- [ ] Co bao cao day du (co trang bia, trang phan cong thanh vien).
- [ ] Co slide thuyet trinh.
- [ ] Co video demo va link video.
- [ ] Dong goi day du code + bao cao + slide + link video.
- [ ] Dat ten file zip: Bai07_WebMicoservices_HoTen_MaSV.zip

## 11. Loi thuong gap
### 11.1 Sai duong dan Maven
Sai: D:/Seminar/BT7.tools/...
Dung: D:/Seminar/BT7/.tools/...

### 11.2 Maven clean bi khoa jar
Nguyen nhan: dang mo service bang java -jar.
Khac phuc: taskkill /F /IM java.exe roi build lai.

### 11.3 Kafka command not recognized
Nguyen nhan: khong dung dung cwd Kafka.
Khac phuc: Set-Location D:/tools/kafka truoc khi chay cac lenh .\\bin\\windows\\kafka-*.bat
