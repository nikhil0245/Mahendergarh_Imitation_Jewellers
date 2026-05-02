package com.mij.framework;

import java.nio.file.Path;
import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public abstract class BaseUiTest {
  protected WebDriver driver;
  protected String baseUrl;

  @BeforeMethod
  public void setUpBrowser() {
    baseUrl = System.getProperty("baseUrl", "http://localhost:3000");
    String chromeDriver = System.getProperty(
        "chromeDriver",
        Path.of("..", ".tools", "chromedriver", "chromedriver-mac-arm64", "chromedriver")
            .normalize()
            .toString());

    System.setProperty("webdriver.chrome.driver", chromeDriver);

    ChromeOptions options = new ChromeOptions();
    if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
      options.addArguments("--headless=new");
    }
    options.addArguments("--window-size=1440,1000");
    options.addArguments("--disable-notifications");

    driver = new ChromeDriver(options);
    driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
  }

  @AfterMethod(alwaysRun = true)
  public void tearDownBrowser() {
    if (driver != null) {
      driver.quit();
    }
  }
}
