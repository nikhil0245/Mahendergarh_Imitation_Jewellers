package com.mij.tests;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.Test;

public class ProjectAutomationTest {
  private final Path projectRoot = Path.of("..").toAbsolutePath().normalize();

  @Test(description = "Verify React frontend stack is configured")
  public void frontendStackShouldBeConfigured() throws IOException {
    String packageJson = read("frontend/package.json");

    Assert.assertTrue(packageJson.contains("\"react\""), "React dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"vite\""), "Vite dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"react-router-dom\""), "React Router dependency should exist.");
    Reporter.log("Frontend stack verified: React, Vite, and React Router are configured.", true);
  }

  @Test(description = "Verify Node and Express backend stack is configured")
  public void backendStackShouldBeConfigured() throws IOException {
    String packageJson = read("backend/package.json");

    Assert.assertTrue(packageJson.contains("\"express\""), "Express dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"mongoose\""), "Mongoose dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"jsonwebtoken\""), "JWT dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"multer\""), "Multer dependency should exist.");
    Assert.assertTrue(packageJson.contains("\"razorpay\""), "Razorpay dependency should exist.");
    Reporter.log("Backend stack verified: Express, MongoDB/Mongoose, JWT, Multer, and Razorpay are configured.", true);
  }

  @Test(description = "Verify important backend API route files are present")
  public void backendApiRoutesShouldExist() {
    assertFileExists("backend/routes/authRoutes.js");
    assertFileExists("backend/routes/productRoutes.js");
    assertFileExists("backend/routes/cartRoutes.js");
    assertFileExists("backend/routes/orderRoutes.js");
    assertFileExists("backend/routes/payment.js");
    assertFileExists("backend/routes/uploadRoutes.js");
    Reporter.log("Backend route files verified for auth, products, cart, orders, payment, and upload.", true);
  }

  @Test(description = "Verify Docker Compose runs frontend and backend services")
  public void dockerComposeShouldDefineApplicationServices() throws IOException {
    String compose = read("docker-compose.yml");

    Assert.assertTrue(compose.contains("backend:"), "Backend service should be defined.");
    Assert.assertTrue(compose.contains("frontend:"), "Frontend service should be defined.");
    Assert.assertTrue(compose.contains("5001:5001"), "Backend port mapping should exist.");
    Assert.assertTrue(compose.contains("3000:3000"), "Frontend port mapping should exist.");
    Assert.assertTrue(compose.contains("depends_on:"), "Frontend should depend on backend.");
    Reporter.log("Docker Compose verified: frontend and backend services are configured together.", true);
  }

  @Test(description = "Verify GitHub Actions CI/CD workflow is configured")
  public void githubActionsWorkflowShouldBeConfigured() throws IOException {
    String workflow = read(".github/workflows/deploy.yml");

    Assert.assertTrue(workflow.contains("actions/checkout"), "Checkout step should exist.");
    Assert.assertTrue(workflow.contains("actions/setup-node"), "Node setup step should exist.");
    Assert.assertTrue(workflow.contains("npm install"), "Dependency installation should exist.");
    Assert.assertTrue(workflow.contains("node --check"), "Backend syntax check should exist.");
    Assert.assertTrue(workflow.contains("npm run build"), "Frontend build step should exist.");
    Assert.assertTrue(workflow.contains("RENDER_DEPLOY_HOOK"), "Render deploy hook should exist.");
    Assert.assertTrue(workflow.contains("VERCEL_DEPLOY_HOOK"), "Vercel deploy hook should exist.");
    Reporter.log("GitHub Actions verified: install, syntax check, build, and deployment hooks are configured.", true);
  }

  @Test(description = "Verify Jenkins pipeline has Docker automation stages")
  public void jenkinsPipelineShouldHaveDockerStages() throws IOException {
    String jenkinsfile = read("Jenkinsfile");

    Assert.assertTrue(jenkinsfile.contains("pipeline"), "Jenkins pipeline block should exist.");
    Assert.assertTrue(jenkinsfile.contains("Build Docker Image"), "Docker build stage should exist.");
    Assert.assertTrue(jenkinsfile.contains("docker build"), "Docker build command should exist.");
    Assert.assertTrue(jenkinsfile.contains("Run Container"), "Run container stage should exist.");
    Assert.assertTrue(jenkinsfile.contains("docker run"), "Docker run command should exist.");
    Reporter.log("Jenkins verified: Docker image build and container run stages are configured.", true);
  }

  @Test(description = "Verify frontend routing and admin pages are configured")
  public void frontendRoutesShouldBeConfigured() throws IOException {
    String app = read("frontend/src/App.jsx");

    Assert.assertTrue(app.contains("LoginPage"), "Login page route should be configured.");
    Assert.assertTrue(app.contains("CartPage"), "Cart page route should be configured.");
    Assert.assertTrue(app.contains("CheckoutPage"), "Checkout page route should be configured.");
    Assert.assertTrue(app.contains("PaymentPage"), "Payment page route should be configured.");
    Assert.assertTrue(app.contains("AdminProductsPage"), "Admin products route should be configured.");
    Reporter.log("Frontend routes verified for login, cart, checkout, payment, and admin product management.", true);
  }

  private String read(String relativePath) throws IOException {
    return Files.readString(projectRoot.resolve(relativePath));
  }

  private void assertFileExists(String relativePath) {
    Assert.assertTrue(Files.isRegularFile(projectRoot.resolve(relativePath)), relativePath + " should exist.");
  }
}
