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
  it("handles the password page and loads the homepage", () => {
    visitShop("/");

    cy.title().should("not.be.empty");
    cy.get("body").should("be.visible");
  });

  it("shows the correct homepage intro text", () => {
  visitShop("/");

  cy.contains(
    /Since 1801, RealBeans has roasted premium coffee in Antwerp for Europe['’]s finest cafes\. Ethically sourced beans, crafted with care\./i
  ).should("exist");
});

  it("shows the About page history paragraph", () => {
    visitShop("/pages/about");

    cy.contains(
      "From a small Antwerp grocery to a European coffee staple, RealBeans honors tradition while innovating for the future. Our beans are roasted in-house, shipped from Antwerp or Stockholm, and loved across the continent."
    ).should("exist");
  });

  it("shows the product catalog with the correct RealBeans products", () => {
  visitShop("/collections/all");

  cy.contains("Blended coffee 5kg").should("exist");
  cy.contains("Roasted coffee beans 5kg").should("exist");
});

  it("can sort products by price", () => {
    visitShop("/collections/all");

    cy.get("body").then(($body) => {
      const hasSortDropdown =
        $body.find("select").length > 0 ||
        $body.text().match(/sort|price/i);

      if (hasSortDropdown) {
        cy.contains(/sort/i).should("exist");

        cy.get("select").then(($selects) => {
          if ($selects.length > 0) {
            cy.get("select").first().select("Price, low to high", { force: true });
            cy.wait(1000);
            cy.url().should("include", "sort");
          } else {
            cy.log("No select dropdown found; sorting may be a custom theme button.");
          }
        });
      } else {
        cy.log("No visible sorting option found on this theme.");
      }
    });
  });

  it("opens a product page and checks details", () => {
    visitShop("/collections/all");

    cy.get("a[href*='/products/']").first().click({ force: true });

    cy.url().should("include", "/products/");
    cy.get("body").should("be.visible");

    cy.contains(/coffee|beans|blend|roasted/i).should("exist");
    cy.contains(/€|EUR|\$/i).should("exist");
    cy.get("img").should("exist");
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