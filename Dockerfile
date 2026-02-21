# Stage 1: Build the application
FROM maven:3.9-amazoncorretto-17 AS build
WORKDIR /app
# Copy the pom.xml and source code into the container
COPY backend/pom.xml .
COPY backend/src ./src
# Compile and package the application
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM amazoncorretto:17-alpine
WORKDIR /app
# Copy only the compiled JAR from the previous stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the default 8080 port for local dev
EXPOSE 8080

# Run the jar file, allowing the PORT environment variable to be injected by Render
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
