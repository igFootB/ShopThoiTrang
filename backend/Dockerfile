# Stage 1: Build ứng dụng bằng Maven
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
# Copy file cấu hình maven và mã nguồn
COPY pom.xml .
COPY src ./src
# Build ứng dụng và bỏ qua chạy test để build nhanh hơn
RUN mvn clean package -DskipTests

# Stage 2: Môi trường chạy ứng dụng (chỉ cần JRE cho nhẹ)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Lấy file jar đã được build từ Stage 1
COPY --from=build /app/target/shop-fashion-0.0.1-SNAPSHOT.jar app.jar

# Mở port 8080 theo mặc định của Spring Boot
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
