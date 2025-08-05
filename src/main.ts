import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors()

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

   // Enable CORS for frontend communication
  app.enableCors({
    origin: ["http://localhost:4200", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  })

  // app.setGlobalPrefix("api")

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("POS System API")
    .setDescription("Point of Sale System Backend API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log("POS Backend is running on: http://localhost:3000")
  console.log("Swagger docs available at: http://localhost:3000/api")
}
bootstrap()
