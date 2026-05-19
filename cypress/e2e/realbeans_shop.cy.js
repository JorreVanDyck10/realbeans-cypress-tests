const shopPassword = "theedi";

function enterShopifyPasswordIfNeeded() {
  cy.get("body").then(($body) => {
    const bodyText = $body.text();

    const hasPasswordInput =
      $body.find("input[type='password']").length > 0 ||
      $body.find("input[name='password']").length > 0;

    const looksLikePasswordPage =
      bodyText.match(/password|enter store|opening soon/i);

    if (hasPasswordInput || looksLikePasswordPage) {
      cy.log("Shopify password page detected");

      cy.get("input[type='password'], input[name='password']")
        .first()
        .clear()
        .type(shopPassword);

      cy.get("button[type='submit'], input[type='submit']")
        .first()
        .click();

      cy.wait(1000);
    } else {
      cy.log("No Shopify password page detected");
    }
  });
}

function visitShop(path = "/") {
  cy.visit(path);

  enterShopifyPasswordIfNeeded();

  cy.url().then((currentUrl) => {
    if (path !== "/" && !currentUrl.includes(path)) {
      cy.visit(path);
    }
  });
}

describe("RealBeans Shopify webshop", () => {
  it("loads the homepage", () => {
    visitShop("/");

    cy.title().should("not.be.empty");
    cy.contains(/RealBeans|coffee|beans|shop/i).should("exist");
  });

  it("opens the About page", () => {
  visitShop("/pages/about");

  cy.url().should("include", "/pages/about");
  cy.get("body").should("be.visible");
  cy.title().should("not.be.empty");
});

  it("opens the product catalog", () => {
    visitShop("/");

    cy.contains(/Catalog|Products|Shop|Coffee|Our Coffee/i).click({
      force: true,
    });

    cy.url().should("match", /collections|products|catalog|shop/i);
    cy.contains(/coffee|beans|blend|roasted/i).should("exist");
  });

  it("opens a product page", () => {
    visitShop("/collections/all");

    cy.get("a[href*='/products/']").first().click({ force: true });

    cy.url().should("include", "/products/");
    cy.contains(/Add to cart|Sold out|Buy/i).should("exist");
  });

  it("can add a product to the cart if available", () => {
    visitShop("/collections/all");

    cy.get("a[href*='/products/']").first().click({ force: true });

    cy.get("body").then(($body) => {
      if ($body.text().match(/Sold out/i)) {
        cy.log("Product is sold out, so add-to-cart is skipped.");
      } else {
        cy.contains(/Add to cart/i).click({ force: true });
        cy.contains(/cart|checkout|added|view cart/i).should("exist");
      }
    });
  });
});