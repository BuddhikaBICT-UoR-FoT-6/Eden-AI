# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/eden-api-0.0.1-SNAPSHOT.jar app.jar

# Non-root user for security
RUN addgroup -S edenai && adduser -S edenai -G edenai
USER edenai

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
